import { createClient } from '@/lib/db/supabase-client'
import type { 
  ResumeBullet, 
  ResumeBulletFormData, 
  GenerateResumeBulletsRequest, 
  GenerateResumeBulletsResponse 
} from '@/types/resume-bullets'

// Client-side API functions for resume bullets

export async function getResumeBullets(): Promise<ResumeBullet[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('resume_bullets')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data || []
}

export async function getResumeBullet(id: string): Promise<ResumeBullet | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('resume_bullets')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    throw new Error(error.message)
  }
  return data
}

export async function createResumeBullet(
  formData: ResumeBulletFormData & { is_generated?: boolean; ai_service?: string }
): Promise<ResumeBullet> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('resume_bullets')
    .insert({
      user_id: user.id,
      bullet_text: formData.bullet_text,
      job_id: formData.job_id || null,
      job_description: formData.job_description || null,
      is_generated: formData.is_generated ?? true,
      ai_service: formData.ai_service || 'anthropic-claude',
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function createResumeBullets(
  bullets: Array<ResumeBulletFormData & { is_generated?: boolean; ai_service?: string }>
): Promise<ResumeBullet[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('resume_bullets')
    .insert(
      bullets.map(bullet => ({
        user_id: user.id,
        bullet_text: bullet.bullet_text,
        job_id: bullet.job_id || null,
        job_description: bullet.job_description || null,
        is_generated: bullet.is_generated ?? true,
        ai_service: bullet.ai_service || 'anthropic-claude',
      }))
    )
    .select()

  if (error) throw new Error(error.message)
  return data
}

export async function updateResumeBullet(
  id: string, 
  formData: Partial<ResumeBulletFormData>
): Promise<ResumeBullet> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('resume_bullets')
    .update({
      ...formData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function deleteResumeBullet(id: string): Promise<void> {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('resume_bullets')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
}

export async function deleteResumeBullets(ids: string[]): Promise<void> {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('resume_bullets')
    .delete()
    .in('id', ids)

  if (error) throw new Error(error.message)
}

export async function generateResumeBullets(
  request: GenerateResumeBulletsRequest
): Promise<GenerateResumeBulletsResponse> {
  const response = await fetch('/api/resume-bullets/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })

  const data = await response.json()
  
  if (!response.ok) {
    throw new Error(data.error || 'Failed to generate resume bullets')
  }

  return data
}

