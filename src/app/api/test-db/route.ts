import { NextResponse } from 'next/server'
import { supabase } from '@/lib/db'

/**
 * Test API route to verify Supabase connection
 * GET /api/test-db
 */
export async function GET() {
  try {
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

