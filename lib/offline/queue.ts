/**
 * The offline write queue. Ticket T-0.8.
 *
 * Every write in the product goes through here: straight into IndexedDB first,
 * optimistic update on screen, then an attempt at the network. Nothing is ever
 * lost because nothing waits on the network to be considered saved.
 *
 * Design rules this file enforces, all from BUILD-INSTRUCTIONS §5.1:
 *
 *  - **Writes replay in the order the teacher made them.** Oldest first.
 *  - **Conflict policy is last-write-wins per field, and never silently
 *    discards.** A losing write is kept in the conflict store and surfaced as
 *    a soft banner. There is no merge UI — she is holding a toddler.
 *  - **A network failure is not an error.** It is "Saved on this phone."
 *  - **Retry with backoff**, and stop the pass at the first offline result
 *    rather than hammering a dead router with the whole queue.
 *
 * Timers and clocks are injected so the behaviour is testable without waiting.
 */

import type {
  Conflict,
  QueueSnapshot,
  QueuedBlob,
  QueuedWrite,
  SaveState,
  Transport,
  WriteKind,
} from './types'
import type { OfflineStore } from './store'

// Re-exported for convenience at call sites.
export type { QueueSnapshot, SaveState }

/** Backoff schedule in milliseconds. Caps out so a long outage stays cheap. */
export const BACKOFF_MS = [1_000, 5_000, 15_000, 60_000, 300_000] as const

export function backoffFor(attempts: number): number {
  const index = Math.min(attempts, BACKOFF_MS.length - 1)
  return BACKOFF_MS[index]!
}

export interface QueueOptions {
  store: OfflineStore
  transport: Transport
  /** Injected so tests do not depend on the wall clock. */
  now?: () => number
  /** Injected so tests do not depend on crypto being present. */
  newId?: () => string
  onChange?: (snapshot: QueueSnapshot) => void
}

export interface EnqueueInput {
  kind: WriteKind
  entity: string
  entityId: string
  centerId: string
  op: 'create' | 'update'
  fields: Record<string, unknown>
  blobs?: { contentType: string; data: Blob }[]
}

export class OfflineQueue {
  private readonly store: OfflineStore
  private readonly transport: Transport
  private readonly now: () => number
  private readonly newId: () => string
  private readonly onChange: ((snapshot: QueueSnapshot) => void) | undefined

  private flushing = false
  private lastPassHitNetwork = false

  constructor(options: QueueOptions) {
    this.store = options.store
    this.transport = options.transport
    this.now = options.now ?? (() => Date.now())
    this.newId =
      options.newId ??
      (() =>
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `id-${Math.random().toString(36).slice(2)}`)
    this.onChange = options.onChange
  }

  /**
   * Record a write. Resolves as soon as it is durable on this device — never
   * waits for the network, so the UI can show "Saved" immediately and honestly.
   */
  async enqueue(input: EnqueueInput): Promise<QueuedWrite> {
    const id = this.newId()
    const blobIds: string[] = []

    for (const blob of input.blobs ?? []) {
      const blobId = this.newId()
      blobIds.push(blobId)
      await this.store.putBlob({
        id: blobId,
        writeId: id,
        remotePath: null,
        contentType: blob.contentType,
        data: blob.data,
      })
    }

    const write: QueuedWrite = {
      id,
      kind: input.kind,
      entity: input.entity,
      entityId: input.entityId,
      centerId: input.centerId,
      op: input.op,
      fields: input.fields,
      editedAt: this.now(),
      attempts: 0,
      ...(blobIds.length > 0 ? { blobIds } : {}),
    }

    await this.store.putWrite(write)
    await this.emit()
    return write
  }

  /**
   * Attempt to drain the queue. Safe to call on every `online` event, on an
   * interval, and after every enqueue — concurrent calls collapse into one.
   */
  async flush(): Promise<void> {
    if (this.flushing) return
    this.flushing = true
    this.lastPassHitNetwork = false
    await this.emit()

    try {
      const writes = await this.store.listWrites()
      for (const write of writes) {
        const keepGoing = await this.pushOne(write)
        if (!keepGoing) break
      }
    } finally {
      this.flushing = false
      await this.emit()
    }
  }

  /** @returns false when the network is down and the pass should stop. */
  private async pushOne(write: QueuedWrite): Promise<boolean> {
    // Photos go first: a write that references a blob the server cannot see
    // would land with a broken path.
    const blobs = write.blobIds?.length ? await this.store.listBlobs(write.id) : []
    const uploaded: Record<string, string> = {}

    for (const blob of blobs) {
      if (blob.remotePath) {
        uploaded[blob.id] = blob.remotePath
        continue
      }
      const result = await this.transport.uploadBlob(blob)
      if ('status' in result) {
        await this.backOff(write)
        return false
      }
      uploaded[blob.id] = result.remotePath
      await this.store.putBlob({ ...blob, remotePath: result.remotePath })
    }

    const outbound: QueuedWrite = blobs.length
      ? { ...write, fields: { ...write.fields, ...this.blobFields(blobs, uploaded) } }
      : write

    const outcome = await this.transport.push(outbound)
    this.lastPassHitNetwork = true

    switch (outcome.status) {
      case 'accepted':
        await this.settle(write, blobs)
        return true

      case 'superseded':
        // Last-write-wins per field: the server's newer values stand, and ours
        // are kept rather than thrown away.
        await this.recordConflict(write, outcome.winningFields)
        await this.settle(write, blobs)
        return true

      case 'rejected':
        // Retrying will not help. Park it where a human can see it instead of
        // leaving a queue that can never drain.
        await this.recordConflict(write, {}, outcome.message)
        await this.settle(write, blobs)
        return true

      case 'offline':
        await this.backOff(write)
        return false
    }
  }

  /** Swap the local blob ids for the storage paths the server now knows about. */
  private blobFields(
    blobs: QueuedBlob[],
    uploaded: Record<string, string>
  ): Record<string, string> {
    const first = blobs[0]
    if (!first) return {}
    const path = uploaded[first.id]
    return path ? { photo_path: path } : {}
  }

  private async settle(write: QueuedWrite, blobs: QueuedBlob[]): Promise<void> {
    for (const blob of blobs) await this.store.deleteBlob(blob.id)
    await this.store.deleteWrite(write.id)
  }

  private async backOff(write: QueuedWrite): Promise<void> {
    await this.store.putWrite({ ...write, attempts: write.attempts + 1 })
  }

  private async recordConflict(
    write: QueuedWrite,
    winningFields: Record<string, unknown>,
    message?: string
  ): Promise<void> {
    const conflict: Conflict = {
      id: this.newId(),
      writeId: write.id,
      entity: write.entity,
      entityId: write.entityId,
      centerId: write.centerId,
      losingFields: write.fields,
      winningFields: message ? { ...winningFields, _reason: message } : winningFields,
      editedAt: write.editedAt,
      detectedAt: this.now(),
      seen: false,
    }
    await this.store.putConflict(conflict)
  }

  /** How long to wait before the next attempt, given what is queued. */
  async nextRetryDelay(): Promise<number | null> {
    const writes = await this.store.listWrites()
    if (writes.length === 0) return null
    const fewest = Math.min(...writes.map((w) => w.attempts))
    return backoffFor(fewest)
  }

  async snapshot(): Promise<QueueSnapshot> {
    const [writes, conflicts] = await Promise.all([
      this.store.listWrites(),
      this.store.listConflicts(),
    ])
    return {
      state: this.stateFor(writes.length),
      pending: writes.length,
      unseenConflicts: conflicts.filter((c) => !c.seen).length,
    }
  }

  private stateFor(pending: number): SaveState {
    if (pending === 0) return 'saved'
    // Mid-pass, or a pass that has not yet failed on the network, still counts
    // as saving. Only a pass that actually failed to reach the server earns
    // "Saved on this phone".
    if (this.flushing && !this.lastPassHitNetwork) return 'saving'
    return 'saved-on-phone'
  }

  async conflicts(): Promise<Conflict[]> {
    return this.store.listConflicts()
  }

  async dismissConflict(id: string): Promise<void> {
    await this.store.markConflictSeen(id)
    await this.emit()
  }

  private async emit(): Promise<void> {
    if (!this.onChange) return
    this.onChange(await this.snapshot())
  }
}

/**
 * Last-write-wins, per field.
 *
 * Applied on the server's answer rather than guessed at locally: whichever side
 * edited a given field most recently owns that field, and the other side's
 * value is what gets kept as a conflict. Whole-row wins would throw away edits
 * to fields nobody contested.
 */
export function mergeFields(
  mine: Record<string, unknown>,
  myEditedAt: number,
  theirs: Record<string, unknown>,
  theirEditedAt: number
): { merged: Record<string, unknown>; lost: Record<string, unknown> } {
  const merged: Record<string, unknown> = { ...theirs }
  const lost: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(mine)) {
    if (!(key in theirs)) {
      merged[key] = value
    } else if (myEditedAt > theirEditedAt) {
      merged[key] = value
    } else if (theirs[key] !== value) {
      lost[key] = value
    }
  }

  return { merged, lost }
}
