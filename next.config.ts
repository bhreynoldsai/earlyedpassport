import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  // The service role key must never reach the browser. This is the build-time
  // check required by BUILD-INSTRUCTIONS §7.1.
  env: {},
}

if (
  typeof process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY === 'string' ||
  Object.keys(process.env).some(
    (k) => k.startsWith('NEXT_PUBLIC_') && k.toLowerCase().includes('service_role')
  )
) {
  throw new Error(
    'A service role key is exposed through a NEXT_PUBLIC_ env var. Remove it before building.'
  )
}

export default nextConfig
