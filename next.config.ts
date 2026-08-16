import type { NextConfig } from 'next'
import { assertNoExposedSecrets } from './lib/security/public-env'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  env: {},
}

// The service role key must never reach the browser. BUILD-INSTRUCTIONS §7.1.
// Checks both names and values — see lib/security/public-env.ts for why the
// value check is the one that catches the realistic mistake.
assertNoExposedSecrets(process.env)

export default nextConfig
