import { createClient } from '@/lib/db/supabase-client'
import type { CoverLetter, CoverLetterFormData, GenerateCoverLetterRequest, GenerateCoverLetterResponse } from '@/types/cover-letters'

// Client-side API functions for cover letters

export async function getCoverLetters(): Promise<CoverLetter[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('cover_letters')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data || []
}

export async function getCoverLetter(id: string): Promise<CoverLetter | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('cover_letters')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    throw new Error(error.message)
  }
  return data
}

export async function createCoverLetter(formData: CoverLetterFormData & { is_generated?: boolean; ai_service?: string }): Promise<CoverLetter> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('cover_letters')
    .insert({
      user_id: user.id,
      title: formData.title,
      content: formData.content,
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

export async function updateCoverLetter(id: string, formData: Partial<CoverLetterFormData>): Promise<CoverLetter> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('cover_letters')
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

export async function deleteCoverLetter(id: string): Promise<void> {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('cover_letters')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
}

export async function generateCoverLetter(request: GenerateCoverLetterRequest): Promise<GenerateCoverLetterResponse> {
  const response = await fetch('/api/cover-letters/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })

  const data = await response.json()
  
  if (!response.ok) {
    throw new Error(data.error || 'Failed to generate cover letter')
  }

  return data
}

