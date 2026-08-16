import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import manifest from '@/app/manifest'

/**
 * `app/manifest.ts` is the one file besides the token sheet allowed to contain a
 * hex value: the browser paints the splash screen from it before any CSS
 * exists, so those two colours cannot be custom properties.
 *
 * The cost of that exemption is drift — someone retunes `--bg` and the install
 * splash keeps the old colour forever, which nobody notices until a director
 * installs it. These tests are what buys the exemption back.
 */

const GLOBALS = new URL('../../app/globals.css', import.meta.url).pathname

function token(name: string): string {
  const css = readFileSync(GLOBALS, 'utf8')
  const match = new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{3,8})`).exec(css)
  if (!match) throw new Error(`Token --${name} not found in app/globals.css`)
  return match[1]!.toLowerCase()
}

describe('the PWA manifest matches the design tokens', () => {
  it('background_color is --bg', () => {
    expect(manifest().background_color?.toLowerCase()).toBe(token('bg'))
  })

  it('theme_color is --accent', () => {
    expect(manifest().theme_color?.toLowerCase()).toBe(token('accent'))
  })
})

describe('the manifest describes the product a teacher installs', () => {
  it('opens standalone and portrait, the way every screen is designed', () => {
    expect(manifest().display).toBe('standalone')
    expect(manifest().orientation).toBe('portrait')
  })

  it('has a short name that fits under a home-screen icon', () => {
    expect(manifest().short_name!.length).toBeLessThanOrEqual(12)
  })
})
