import { beforeEach, describe, expect, it } from 'vitest'
import { MemoryStore } from '@/lib/offline/store'
import { OfflineQueue, backoffFor, mergeFields } from '@/lib/offline/queue'
import type { PushOutcome, QueuedBlob, QueuedWrite, Transport } from '@/lib/offline/types'

/**
 * The queue is what stands between a teacher and losing an observation she just
 * recorded in a room with no wifi. It gets tested accordingly.
 */

class FakeTransport implements Transport {
  outcomes: PushOutcome[] = []
  pushed: QueuedWrite[] = []
  uploaded: QueuedBlob[] = []
  blobOffline = false

  async push(write: QueuedWrite): Promise<PushOutcome> {
    this.pushed.push(write)
    return this.outcomes.shift() ?? { status: 'accepted' }
  }

  async uploadBlob(blob: QueuedBlob): Promise<{ remotePath: string } | { status: 'offline' }> {
    if (this.blobOffline) return { status: 'offline' }
    this.uploaded.push(blob)
    return { remotePath: `photos/${blob.id}.jpg` }
  }
}

let store: MemoryStore
let transport: FakeTransport
let clock: number
let counter: number

function makeQueue(onChange?: (s: unknown) => void): OfflineQueue {
  return new OfflineQueue({
    store,
    transport,
    now: () => (clock += 1),
    newId: () => `id-${++counter}`,
    ...(onChange ? { onChange: onChange as never } : {}),
  })
}

const observation = {
  kind: 'observation' as const,
  entity: 'observation',
  entityId: 'obs-1',
  centerId: 'center-a',
  op: 'create' as const,
  fields: { note: 'Maya counted the blocks to 12 without help' },
}

beforeEach(() => {
  store = new MemoryStore()
  transport = new FakeTransport()
  clock = 1_000
  counter = 0
})

describe('a write is durable before the network is involved', () => {
  it('is queued without waiting for a push', async () => {
    const queue = makeQueue()
    await queue.enqueue(observation)
    expect(transport.pushed).toHaveLength(0)
    expect(await store.listWrites()).toHaveLength(1)
  })

  it('reports Saved once the queue drains', async () => {
    const queue = makeQueue()
    await queue.enqueue(observation)
    await queue.flush()
    expect((await queue.snapshot()).state).toBe('saved')
    expect(await store.listWrites()).toHaveLength(0)
  })

  it('carries center_id so an offline write faces the same boundary as a live one', async () => {
    const queue = makeQueue()
    await queue.enqueue(observation)
    await queue.flush()
    expect(transport.pushed[0]?.centerId).toBe('center-a')
  })

  it('gives a create its row id up front, so a retry cannot double-insert', async () => {
    const queue = makeQueue()
    await queue.enqueue(observation)
    transport.outcomes = [{ status: 'offline' }]
    await queue.flush()
    await queue.flush()
    expect(transport.pushed.every((w) => w.entityId === 'obs-1')).toBe(true)
  })
})

describe('going offline', () => {
  it('keeps the write and reports Saved on this phone', async () => {
    const queue = makeQueue()
    await queue.enqueue(observation)
    transport.outcomes = [{ status: 'offline' }]
    await queue.flush()

    const snapshot = await queue.snapshot()
    expect(snapshot.state).toBe('saved-on-phone')
    expect(snapshot.pending).toBe(1)
  })

  it('never reports an error state at all', async () => {
    const queue = makeQueue()
    await queue.enqueue(observation)
    transport.outcomes = [{ status: 'offline', message: 'ECONNREFUSED' }]
    await queue.flush()
    // The union has no error member; this is the guarantee in test form.
    expect(['saved', 'saving', 'saved-on-phone']).toContain((await queue.snapshot()).state)
  })

  it('stops the pass at the first failure instead of hammering a dead router', async () => {
    const queue = makeQueue()
    await queue.enqueue(observation)
    await queue.enqueue({ ...observation, entityId: 'obs-2' })
    await queue.enqueue({ ...observation, entityId: 'obs-3' })
    transport.outcomes = [{ status: 'offline' }]
    await queue.flush()
    expect(transport.pushed).toHaveLength(1)
  })

  it('sends everything once the network returns', async () => {
    const queue = makeQueue()
    await queue.enqueue(observation)
    await queue.enqueue({ ...observation, entityId: 'obs-2' })
    transport.outcomes = [{ status: 'offline' }]
    await queue.flush()

    await queue.flush()
    expect(transport.pushed.map((w) => w.entityId)).toEqual(['obs-1', 'obs-1', 'obs-2'])
    expect(await store.listWrites()).toHaveLength(0)
  })

  it('replays writes in the order the teacher made them', async () => {
    const queue = makeQueue()
    await queue.enqueue({ ...observation, entityId: 'first' })
    await queue.enqueue({ ...observation, entityId: 'second' })
    await queue.enqueue({ ...observation, entityId: 'third' })
    await queue.flush()
    expect(transport.pushed.map((w) => w.entityId)).toEqual(['first', 'second', 'third'])
  })

  it('backs off further with each failed attempt, then caps', async () => {
    expect(backoffFor(0)).toBeLessThan(backoffFor(1))
    expect(backoffFor(1)).toBeLessThan(backoffFor(2))
    expect(backoffFor(99)).toBe(backoffFor(4))
  })

  it('reports a growing retry delay as attempts accumulate', async () => {
    const queue = makeQueue()
    await queue.enqueue(observation)
    transport.outcomes = [{ status: 'offline' }]
    await queue.flush()
    const first = await queue.nextRetryDelay()

    transport.outcomes = [{ status: 'offline' }]
    await queue.flush()
    const second = await queue.nextRetryDelay()

    expect(first).not.toBeNull()
    expect(second!).toBeGreaterThan(first!)
  })

  it('has no retry delay when nothing is queued', async () => {
    const queue = makeQueue()
    expect(await queue.nextRetryDelay()).toBeNull()
  })
})

describe('photos', () => {
  it('uploads the blob before the row that references it', async () => {
    const queue = makeQueue()
    await queue.enqueue({
      ...observation,
      blobs: [{ contentType: 'image/jpeg', data: new Blob(['x']) }],
    })
    await queue.flush()

    expect(transport.uploaded).toHaveLength(1)
    expect(transport.pushed[0]?.fields.photo_path).toMatch(/^photos\//)
  })

  it('holds the photo on the phone while the upload cannot happen', async () => {
    const queue = makeQueue()
    const write = await queue.enqueue({
      ...observation,
      blobs: [{ contentType: 'image/jpeg', data: new Blob(['x']) }],
    })
    transport.blobOffline = true
    await queue.flush()

    expect(transport.pushed).toHaveLength(0)
    expect(await store.listBlobs(write.id)).toHaveLength(1)
    expect((await queue.snapshot()).state).toBe('saved-on-phone')
  })

  it('does not re-upload a blob that already landed', async () => {
    const queue = makeQueue()
    await queue.enqueue({
      ...observation,
      blobs: [{ contentType: 'image/jpeg', data: new Blob(['x']) }],
    })
    transport.outcomes = [{ status: 'offline' }]
    await queue.flush()
    await queue.flush()
    expect(transport.uploaded).toHaveLength(1)
  })
})

describe('conflicts are never silently discarded', () => {
  it('keeps the losing note when the server has a newer one', async () => {
    const queue = makeQueue()
    await queue.enqueue(observation)
    transport.outcomes = [
      { status: 'superseded', winningFields: { note: 'Someone else wrote this' } },
    ]
    await queue.flush()

    const conflicts = await queue.conflicts()
    expect(conflicts).toHaveLength(1)
    expect(conflicts[0]?.losingFields.note).toBe('Maya counted the blocks to 12 without help')
    expect(conflicts[0]?.winningFields.note).toBe('Someone else wrote this')
  })

  it('surfaces the conflict as unseen so a banner can appear', async () => {
    const queue = makeQueue()
    await queue.enqueue(observation)
    transport.outcomes = [{ status: 'superseded', winningFields: { note: 'theirs' } }]
    await queue.flush()
    expect((await queue.snapshot()).unseenConflicts).toBe(1)

    const [conflict] = await queue.conflicts()
    await queue.dismissConflict(conflict!.id)
    expect((await queue.snapshot()).unseenConflicts).toBe(0)
  })

  it('drains the queue rather than retrying a write the server refused', async () => {
    const queue = makeQueue()
    await queue.enqueue(observation)
    transport.outcomes = [{ status: 'rejected', message: 'row-level security' }]
    await queue.flush()

    expect(await store.listWrites()).toHaveLength(0)
    const [conflict] = await queue.conflicts()
    expect(conflict?.losingFields.note).toBeDefined()
    expect(conflict?.winningFields._reason).toMatch(/row-level security/)
  })
})

describe('mergeFields — last write wins per field', () => {
  it('takes my newer field and keeps theirs where I did not touch it', () => {
    const { merged, lost } = mergeFields(
      { note: 'mine' },
      200,
      { note: 'theirs', mood: 'happy' },
      100
    )
    expect(merged).toEqual({ note: 'mine', mood: 'happy' })
    expect(lost).toEqual({})
  })

  it('keeps my losing value rather than dropping it', () => {
    const { merged, lost } = mergeFields({ note: 'mine' }, 100, { note: 'theirs' }, 200)
    expect(merged.note).toBe('theirs')
    expect(lost.note).toBe('mine')
  })

  it('adds a field the other side never had, whatever the clocks say', () => {
    const { merged, lost } = mergeFields({ extra: 'new' }, 1, { note: 'theirs' }, 999)
    expect(merged).toEqual({ note: 'theirs', extra: 'new' })
    expect(lost).toEqual({})
  })

  it('loses nothing when both sides wrote the same value', () => {
    const { lost } = mergeFields({ note: 'same' }, 100, { note: 'same' }, 200)
    expect(lost).toEqual({})
  })

  it('merges per field, not per row', () => {
    // The whole point: an uncontested field survives a contested one.
    const { merged, lost } = mergeFields(
      { note: 'mine', indicators: ['CD-MA1.4a'] },
      100,
      { note: 'theirs' },
      200
    )
    expect(merged.note).toBe('theirs')
    expect(merged.indicators).toEqual(['CD-MA1.4a'])
    expect(lost).toEqual({ note: 'mine' })
  })
})

describe('the chip', () => {
  it('notifies on every change so it can stay honest', async () => {
    const seen: string[] = []
    const queue = makeQueue((s) => seen.push((s as { state: string }).state))
    await queue.enqueue(observation)
    await queue.flush()
    expect(seen).toContain('saved')
  })

  it('reads Saving while a pass is in flight', async () => {
    let midFlight: string | undefined
    const queue = new OfflineQueue({
      store,
      transport: {
        async push() {
          midFlight = (await queue.snapshot()).state
          return { status: 'accepted' }
        },
        async uploadBlob() {
          return { remotePath: 'x' }
        },
      },
      now: () => (clock += 1),
      newId: () => `id-${++counter}`,
    })
    await queue.enqueue(observation)
    await queue.flush()
    expect(midFlight).toBe('saving')
  })
})
