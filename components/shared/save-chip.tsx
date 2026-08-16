'use client'

import { cn } from '@/lib/utils'
import { copy } from '@/lib/copy'
import type { SaveState } from '@/lib/offline/types'

/**
 * One quiet chip, top right. Ticket T-0.8.
 *
 * `Saved` / `Saving…` / `Saved on this phone`. That is the whole vocabulary.
 *
 * It never says "sync" — a teacher does not know what that means and the word
 * is banned in §7.2. It never turns red, and it never shows an error, because a
 * network failure is not an error: the work is on the phone and it is going to
 * arrive. Treating a dead router as a failure teaches her the app loses things,
 * which is the exact fear this product exists to remove.
 */

export interface SaveChipProps {
  state: SaveState
  className?: string
}

const LABEL: Record<SaveState, string> = {
  saved: copy.save.saved,
  saving: copy.save.saving,
  'saved-on-phone': copy.save.savedOnPhone,
}

export function SaveChip({ state, className }: SaveChipProps) {
  return (
    <span
      // Announced politely: she should never be interrupted mid-sentence by a
      // status change, but a screen reader user still needs to know it saved.
      role="status"
      aria-live="polite"
      className={cn(
        'inline-flex items-center gap-2 rounded-sm px-3 py-1',
        'text-[length:var(--text-small)]',
        state === 'saved' ? 'text-text-muted' : 'text-accent-text',
        state === 'saved-on-phone' && 'bg-attention-soft',
        className
      )}
    >
      <span
        aria-hidden
        className={cn(
          'size-2 rounded-full',
          state === 'saved' && 'bg-good',
          state === 'saving' && 'bg-accent',
          state === 'saved-on-phone' && 'bg-attention'
        )}
      />
      {LABEL[state]}
    </span>
  )
}
