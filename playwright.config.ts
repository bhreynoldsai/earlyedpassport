import { defineConfig, devices } from '@playwright/test'

/**
 * The offline test is the reason this file exists. It runs on a phone-sized
 * viewport because that is the only device this product is really designed for.
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: process.env.BASE_URL ?? 'http://127.0.0.1:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'phone',
      // A five-year-old Android at 375px wide. If it does not work here, it
      // does not work.
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'pnpm build && pnpm start',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
})
