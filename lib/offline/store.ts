/**
 * Where queued writes live between the tap and the server. Ticket T-0.8.
 *
 * Two implementations behind one interface:
 *
 *   - `IndexedDbStore` — the real one, on the phone, via `idb`.
 *   - `MemoryStore`    — the same behaviour in a Map, so the queue's logic is
 *                        testable in Node without pulling in an IndexedDB
 *                        shim. The dependency list is deliberately small; a
 *                        seam we control beats a package we don't.
 *
 * The queue never touches IndexedDB directly, only this interface.
 */

import type { Conflict, QueuedBlob, QueuedWrite } from './types'

export interface OfflineStore {
  putWrite(write: QueuedWrite): Promise<void>
  /** Oldest first — a teacher's edits replay in the order she made them. */
  listWrites(): Promise<QueuedWrite[]>
  deleteWrite(id: string): Promise<void>

  putBlob(blob: QueuedBlob): Promise<void>
  listBlobs(writeId: string): Promise<QueuedBlob[]>
  deleteBlob(id: string): Promise<void>

  putConflict(conflict: Conflict): Promise<void>
  listConflicts(): Promise<Conflict[]>
  markConflictSeen(id: string): Promise<void>

  clear(): Promise<void>
}

export const DB_NAME = 'eep-offline'
export const DB_VERSION = 1
export const STORE_WRITES = 'writes'
export const STORE_BLOBS = 'blobs'
export const STORE_CONFLICTS = 'conflicts'

/** In-memory store. Used by tests, and as the fallback when IndexedDB is absent. */
export class MemoryStore implements OfflineStore {
  private writes = new Map<string, QueuedWrite>()
  private blobs = new Map<string, QueuedBlob>()
  private conflicts = new Map<string, Conflict>()

  async putWrite(write: QueuedWrite): Promise<void> {
    this.writes.set(write.id, { ...write })
  }

  async listWrites(): Promise<QueuedWrite[]> {
    return [...this.writes.values()].sort((a, b) => a.editedAt - b.editedAt)
  }

  async deleteWrite(id: string): Promise<void> {
    this.writes.delete(id)
  }

  async putBlob(blob: QueuedBlob): Promise<void> {
    this.blobs.set(blob.id, blob)
  }

  async listBlobs(writeId: string): Promise<QueuedBlob[]> {
    return [...this.blobs.values()].filter((b) => b.writeId === writeId)
  }

  async deleteBlob(id: string): Promise<void> {
    this.blobs.delete(id)
  }

  async putConflict(conflict: Conflict): Promise<void> {
    this.conflicts.set(conflict.id, conflict)
  }

  async listConflicts(): Promise<Conflict[]> {
    return [...this.conflicts.values()].sort((a, b) => b.detectedAt - a.detectedAt)
  }

  async markConflictSeen(id: string): Promise<void> {
    const existing = this.conflicts.get(id)
    if (existing) this.conflicts.set(id, { ...existing, seen: true })
  }

  async clear(): Promise<void> {
    this.writes.clear()
    this.blobs.clear()
    this.conflicts.clear()
  }
}

/**
 * The real store. Imported lazily so that server components and Node tests
 * never pull `idb` into their bundle.
 */
export async function createIndexedDbStore(): Promise<OfflineStore> {
  const { openDB } = await import('idb')

  const db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(database) {
      if (!database.objectStoreNames.contains(STORE_WRITES)) {
        const writes = database.createObjectStore(STORE_WRITES, { keyPath: 'id' })
        writes.createIndex('editedAt', 'editedAt')
      }
      if (!database.objectStoreNames.contains(STORE_BLOBS)) {
        const blobs = database.createObjectStore(STORE_BLOBS, { keyPath: 'id' })
        blobs.createIndex('writeId', 'writeId')
      }
      if (!database.objectStoreNames.contains(STORE_CONFLICTS)) {
        const conflicts = database.createObjectStore(STORE_CONFLICTS, { keyPath: 'id' })
        conflicts.createIndex('detectedAt', 'detectedAt')
      }
    },
  })

  return {
    async putWrite(write) {
      await db.put(STORE_WRITES, write)
    },
    async listWrites() {
      return (await db.getAllFromIndex(STORE_WRITES, 'editedAt')) as QueuedWrite[]
    },
    async deleteWrite(id) {
      await db.delete(STORE_WRITES, id)
    },
    async putBlob(blob) {
      await db.put(STORE_BLOBS, blob)
    },
    async listBlobs(writeId) {
      return (await db.getAllFromIndex(STORE_BLOBS, 'writeId', writeId)) as QueuedBlob[]
    },
    async deleteBlob(id) {
      await db.delete(STORE_BLOBS, id)
    },
    async putConflict(conflict) {
      await db.put(STORE_CONFLICTS, conflict)
    },
    async listConflicts() {
      const all = (await db.getAllFromIndex(STORE_CONFLICTS, 'detectedAt')) as Conflict[]
      return all.reverse()
    },
    async markConflictSeen(id) {
      const existing = (await db.get(STORE_CONFLICTS, id)) as Conflict | undefined
      if (existing) await db.put(STORE_CONFLICTS, { ...existing, seen: true })
    },
    async clear() {
      await Promise.all([db.clear(STORE_WRITES), db.clear(STORE_BLOBS), db.clear(STORE_CONFLICTS)])
    },
  }
}
