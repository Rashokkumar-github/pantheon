import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifySchema } from '@/lib/db/test-schema'

/**
 * Test API route to verify Supabase connection and schema
 * GET /api/test-db
 */
export async function GET() {
  try {
    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing Supabase environment variables',
          missing: {
            url: !supabaseUrl,
            anonKey: !supabaseAnonKey,
          },
          message: 'Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local',
        },
        { status: 500 }
      )
    }

    // Create client for testing
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Test that all schema tables exist
    const requiredTables = ['users', 'jobs', 'photos', 'cover_letters', 'resume_bullets']
    const tableTests: Record<string, { exists: boolean; error?: string }> = {}

    for (const table of requiredTables) {
      const { error } = await supabase.from(table).select('*').limit(0)
      tableTests[table] = {
        exists: !error,
        error: error?.message,
      }
    }

    // Verify schema using the test utility
    const schemaVerification = await verifySchema()

    const allTablesExist = Object.values(tableTests).every((test) => test.exists)

    return NextResponse.json({
      success: allTablesExist && schemaVerification.success,
      message: allTablesExist
        ? 'Supabase connection and schema verification successful'
        : 'Connection successful but some tables are missing',
      projectUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      tables: tableTests,
      schemaVerification,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

