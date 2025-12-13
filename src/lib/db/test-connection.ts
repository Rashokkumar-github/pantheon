/**
 * Test Supabase connection
 * This file can be used to verify the database connection is working
 * Run: npx tsx src/lib/db/test-connection.ts (if tsx is installed)
 */

import { supabase } from './supabase'

export async function testConnection() {
  try {
    // Test connection by querying a system table
    const { data, error } = await supabase
      .from('_test')
      .select('*')
      .limit(1)
    
    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "relation does not exist" which is fine for testing
      console.error('Connection test error:', error)
      return { success: false, error }
    }
    
    console.log('✅ Supabase connection successful!')
    console.log('Project URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    return { success: true, data }
  } catch (error) {
    console.error('❌ Connection test failed:', error)
    return { success: false, error }
  }
}

// Uncomment to run directly
// testConnection()

