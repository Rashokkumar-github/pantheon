import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Client for use in Client Components and API routes
// Will throw error when used if env vars are missing
export const supabase: SupabaseClient = (() => {
  if (!supabaseUrl) {
    console.warn('⚠️  NEXT_PUBLIC_SUPABASE_URL is not set')
    // Return a dummy client that will error on use
    return createClient('https://placeholder.supabase.co', 'placeholder-key')
  }

  if (!supabaseAnonKey) {
    console.warn('⚠️  NEXT_PUBLIC_SUPABASE_ANON_KEY is not set')
    // Return a dummy client that will error on use
    return createClient(supabaseUrl || 'https://placeholder.supabase.co', 'placeholder-key')
  }

  return createClient(supabaseUrl, supabaseAnonKey)
})()

// Server-side client with service role key (bypasses RLS)
// Only use this in API routes or server components when you need admin access
export function createServerClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!serviceRoleKey) {
    throw new Error('Missing env.SUPABASE_SERVICE_ROLE_KEY')
  }
  
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

