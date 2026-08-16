import { expect, test } from '@playwright/test'

/**
 * Ticket T-0.8 — THE TEST THAT PROVES OFFLINE WORKS.
 *
 * Written now, against features that do not exist yet, deliberately. Offline
 * cannot be retrofitted; it is a rewrite if you try. This spec is part of
 * Phase 0's definition of done, and the Phase 1 and Phase 3 tickets turn it
 * green one step at a time.
 *
 * CONDITIONALITY: PROJECT-INSTRUCTIONS §9.1 allows dropping offline only if
 * Part 0.5 confirms reliable wifi at every pilot site, VERIFIED BY WALKING THE
 * BUILDING. Part 0.5 is still blank. Until it is filled in and verified on
 * site, offline is mandatory and this is a Phase 0 blocker. Do not descope it
 * on your own judgment.
 *
 * Each step is marked `fixme` until the ticket that implements it lands, so CI
 * reports them as pending work rather than silently passing.
 */

test.describe('a dead wifi router does not lose a teacher’s work', () => {
  // The machinery underneath is built and unit-tested (T-0.8): IndexedDB write
  // queue, photo blob store, conflict store, service worker, SaveChip. What is
  // still missing is the screens these steps drive, so the spec stays pending
  // rather than passing vacuously.
  test.fixme(
    true,
    'Machinery landed in T-0.8. Turns green as T-1.4, T-1.5 and T-3.2 add the screens.'
  )

  test('an observation and a full week of plans survive going offline', async ({
    page,
    context,
  }) => {
    // 1. Load the roster online.
    await page.goto('/r/demo-classroom')
    await expect(page.getByRole('heading', { name: /my room/i })).toBeVisible()

    // 2. Kill the network.
    await context.setOffline(true)

    // 3. Record an observation with a photo and two indicators (T-3.2).
    await page.getByRole('button', { name: /observe/i }).click()
    await page.getByRole('button', { name: /maya/i }).click()
    await page.getByLabel(/what did you see/i).fill('Maya counted the blocks to 12 without help')
    await page.getByRole('checkbox').first().check()
    await page.getByRole('checkbox').nth(1).check()
    await page.getByRole('button', { name: /save this note/i }).click()

    // The chip never says "error" and never says "sync".
    await expect(page.getByText(/saved on this phone/i)).toBeVisible()

    // 4. Build a full 5-day lesson plan (T-1.4, T-1.5).
    await page.goto('/plan/demo-classroom/2026-08-17')
    for (const day of ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']) {
      await page.getByRole('tab', { name: day }).click()
      await page
        .getByRole('button', { name: /tap to add/i })
        .first()
        .click()
      await page.getByLabel(/title/i).fill(`${day} circle time`)
      await page.getByRole('button', { name: /done/i }).click()
    }

    // 5. Reload while STILL offline — both must still be there.
    await page.reload()
    await expect(page.getByText('Mon circle time')).toBeVisible()
    await page.goto('/child/demo-maya')
    await expect(page.getByText(/counted the blocks to 12/i)).toBeVisible()

    // 6. Network comes back.
    await context.setOffline(false)
    await expect(page.getByText(/^saved$/i)).toBeVisible({ timeout: 30_000 })

    // 7. Both landed in Postgres with the right center_id and indicator links.
    //    Asserted through the app's own read path, which is subject to RLS —
    //    if the write landed under the wrong center_id, this read returns
    //    nothing.
    await page.goto('/child/demo-maya')
    await expect(page.getByText(/counted the blocks to 12/i)).toBeVisible()
    await expect(page.locator('.gelds-code')).toHaveCount(2)
  })

  test('Print / Post is never disabled, even on an empty plan', async ({ page, context }) => {
    await context.setOffline(true)
    await page.goto('/plan/demo-classroom/2026-08-24')
    // Coverage changes its prominence. It never changes its availability.
    await expect(page.getByRole('button', { name: /print \/ post/i })).toBeEnabled()
  })
})
