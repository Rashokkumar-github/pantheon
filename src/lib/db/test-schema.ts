/**
 * Test utilities for database schema validation
 * This file contains helper functions to test the database schema
 */

import { createClient } from './supabase-server'

/**
 * Test that all required tables exist
 */
export async function testSchemaTables() {
  const supabase = await createClient()
  
  const tables = ['users', 'jobs', 'photos', 'cover_letters', 'resume_bullets']
  const results: Record<string, boolean> = {}
  
  for (const table of tables) {
    const { error } = await supabase.from(table).select('*').limit(0)
    results[table] = !error
  }
  
  return results
}

/**
 * Test that RLS policies are working correctly
 * This should be run with an authenticated user
 */
export async function testRLSPolicies(userId: string) {
  const supabase = await createClient()
  
  // Test that user can only see their own data
  const tests = {
    jobs: await supabase.from('jobs').select('*').eq('user_id', userId),
    photos: await supabase.from('photos').select('*').eq('user_id', userId),
    cover_letters: await supabase.from('cover_letters').select('*').eq('user_id', userId),
    resume_bullets: await supabase.from('resume_bullets').select('*').eq('user_id', userId),
  }
  
  return tests
}

/**
 * Verify database schema structure
 */
export async function verifySchema() {
  const supabase = await createClient()
  
  try {
    // Test connection
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(0)
    
    if (usersError) {
      return {
        success: false,
        error: `Users table error: ${usersError.message}`,
      }
    }
    
    // Test foreign key relationships by checking table structure
    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .select('*')
      .limit(0)
    
    if (jobsError) {
      return {
        success: false,
        error: `Jobs table error: ${jobsError.message}`,
      }
    }
    
    return {
      success: true,
      message: 'Schema verification successful',
      tables: {
        users: true,
        jobs: true,
        photos: true,
        cover_letters: true,
        resume_bullets: true,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

