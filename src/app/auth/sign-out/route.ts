import { createClient } from '@/lib/db/supabase-server'
import { NextResponse } from 'next/server'

/**
 * Sign out route
 * POST /auth/sign-out
 */
export async function POST() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  return NextResponse.json({ success: true })
}

