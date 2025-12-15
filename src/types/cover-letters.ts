// Cover letter types matching database schema

export interface CoverLetter {
  id: string
  user_id: string
  job_id: string | null
  title: string
  content: string
  job_description: string | null
  is_generated: boolean
  ai_service: string | null
  created_at: string
  updated_at: string
}

export interface CoverLetterFormData {
  title: string
  content: string
  job_id?: string
  job_description?: string
}

export interface GenerateCoverLetterRequest {
  jobDescription: string
  resume: string
  companyName?: string
  jobTitle?: string
  jobId?: string
}

export interface GenerateCoverLetterResponse {
  coverLetter: string
  title: string
  error?: string
}

