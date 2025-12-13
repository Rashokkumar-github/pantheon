import { createClient } from '@/lib/db/supabase-client'
import type { Job, JobFormData } from '@/types/jobs'

// Client-side API functions for jobs

export async function getJobs(): Promise<Job[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data || []
}

export async function getJob(id: string): Promise<Job | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    throw new Error(error.message)
  }
  return data
}

export async function createJob(formData: JobFormData): Promise<Job> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('jobs')
    .insert({
      user_id: user.id,
      company_name: formData.company_name,
      job_title: formData.job_title,
      job_description: formData.job_description || null,
      application_url: formData.application_url || null,
      status: formData.status,
      applied_at: formData.applied_at || null,
      salary_range: formData.salary_range || null,
      location: formData.location || null,
      notes: formData.notes || null,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function updateJob(id: string, formData: Partial<JobFormData>): Promise<Job> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('jobs')
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

export async function deleteJob(id: string): Promise<void> {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('jobs')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
}

export async function updateJobStatus(id: string, status: Job['status']): Promise<Job> {
  return updateJob(id, { status })
}

