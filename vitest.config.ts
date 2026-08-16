import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    exclude: ['tests/e2e/**'],
    // The RLS suites each rebuild the schema in the same database. Run test
    // files one at a time so they cannot race each other into a half-dropped
    // schema — a failure mode that looks like a policy bug and is not one.
    // The whole suite takes a few seconds, so there is nothing to win here.
    fileParallelism: false,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./', import.meta.url)),
    },
  },
})
