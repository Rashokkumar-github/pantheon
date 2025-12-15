// Resume bullet types matching database schema

export interface ResumeBullet {
  id: string
  user_id: string
  job_id: string | null
  bullet_text: string
  job_description: string | null
  is_generated: boolean
  ai_service: string | null
  created_at: string
  updated_at: string
}

export interface ResumeBulletFormData {
  bullet_text: string
  job_id?: string
  job_description?: string
}

export interface GenerateResumeBulletsRequest {
  jobDescription: string
  resume: string
  companyName?: string
  jobTitle?: string
  jobId?: string
}

export interface GeneratedBullet {
  bullet: string
  category: string
  relevance: string
}

export interface GenerateResumeBulletsResponse {
  bullets: GeneratedBullet[]
  title: string
  error?: string
}

