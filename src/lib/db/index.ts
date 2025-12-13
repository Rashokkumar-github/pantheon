// Database utilities and exports
// For Server Components, Server Actions, and Route Handlers
export { createClient as createServerClient } from './supabase-server'

// For Client Components
export { createClient as createBrowserClient } from './supabase-client'

// Legacy exports (for backward compatibility)
export { supabase, createServerClient as createAdminClient } from './supabase'

// Re-export types when we generate them
// export type { Database } from './types'

