/**
 * Offline write queue — the shapes. Ticket T-0.8.
 *
 * Two flows must survive a dead wifi router: recording an observation
 * (including the photo) and editing a lesson plan. Everything here exists to
 * make that true.
 *
 * Retrofitting offline is a rewrite, which is why this lands in Phase 0 rather
 * than alongside the features that use it.
 */

/** What a teacher was doing when the write was made. Used only for messaging. */
export type WriteKind = 'observation' | 'plan' | 'activity' | 'other'

export interface QueuedWrite {
  /** Client-generated so the row has an identity before the server sees it. */
  id: string
  kind: WriteKind
  /** Table name, e.g. 'observation'. */
  entity: string
  /** Row id — client-generated for creates, so a retry can never double-insert. */
  entityId: string
  /**
   * Denormalised, exactly as in the database. A queued write that reaches the
   * server with the wrong center_id would be rejected by RLS, so carrying it
   * here means an offline write is subject to the same boundary as a live one.
   */
  centerId: string
  op: 'create' | 'update'
  /** Changed fields only. Per-field granularity is what makes the merge sane. */
  fields: Record<string, unknown>
  /** Client clock at the moment of the edit. Drives last-write-wins. */
  editedAt: number
  attempts: number
  lastError?: string
  /** Keys into the blob store — photos held locally until they can be uploaded. */
  blobIds?: string[]
}

export interface QueuedBlob {
  id: string
  writeId: string
  /** Storage path once uploaded; null while it still lives only on this phone. */
  remotePath: string | null
  contentType: string
  data: Blob
}

/**
 * A write that lost a last-write-wins race.
 *
 * NEVER SILENTLY DISCARDED. The teacher gets a soft banner — "We saved a second
 * copy of this note. Tap to compare." — and never a merge UI. She is holding a
 * toddler; she is not resolving a three-way diff.
 */
export interface Conflict {
  id: string
  writeId: string
  entity: string
  entityId: string
  centerId: string
  /** The fields that lost, kept verbatim. */
  losingFields: Record<string, unknown>
  /** What the server had instead, for the compare view. */
  winningFields: Record<string, unknown>
  editedAt: number
  detectedAt: number
  seen: boolean
}

/**
 * What the SaveChip shows. There is deliberately no error state: a network
 * failure is not an error, it is "Saved on this phone".
 */
export type SaveState = 'saved' | 'saving' | 'saved-on-phone'

export interface QueueSnapshot {
  state: SaveState
  pending: number
  unseenConflicts: number
}

/** The result of trying to push one write to the server. */
export type PushOutcome =
  | { status: 'accepted' }
  /** The server had a newer version of at least one field. */
  | { status: 'superseded'; winningFields: Record<string, unknown> }
  /** Network is down or the request never landed. Keep it and retry. */
  | { status: 'offline'; message?: string }
  /**
   * The server refused and retrying will not help — a policy denial, a
   * constraint violation. Keeping it forever would mean a queue that never
   * drains, so it is parked as a conflict for a human to see.
   */
  | { status: 'rejected'; message: string }

export interface Transport {
  push(write: QueuedWrite): Promise<PushOutcome>
  uploadBlob(blob: QueuedBlob): Promise<{ remotePath: string } | { status: 'offline' }>
}
