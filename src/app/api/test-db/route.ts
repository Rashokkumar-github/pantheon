import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * Test API route to verify Supabase connection
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

    // Simple connection test
    const { data, error } = await supabase
      .from('_test')
      .select('*')
      .limit(1)
    
    // If we get an error about table not existing, that's fine - connection works
    if (error && error.code === 'PGRST116') {
      return NextResponse.json({
        success: true,
        message: 'Supabase connection successful (no tables yet)',
        projectUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      })
    }
    
    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          code: error.code,
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Supabase connection successful',
      data,
      projectUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
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

