// Job status enum matching database constraint
export type JobStatus = 'applied' | 'interview' | 'offer' | 'rejected' | 'withdrawn'

export const JOB_STATUSES: { value: JobStatus; label: string; color: string }[] = [
  { value: 'applied', label: 'Applied', color: 'bg-blue-500/15 text-blue-700 dark:text-blue-400' },
  { value: 'interview', label: 'Interview', color: 'bg-amber-500/15 text-amber-700 dark:text-amber-400' },
  { value: 'offer', label: 'Offer', color: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400' },
  { value: 'rejected', label: 'Rejected', color: 'bg-rose-500/15 text-rose-700 dark:text-rose-400' },
  { value: 'withdrawn', label: 'Withdrawn', color: 'bg-slate-500/15 text-slate-700 dark:text-slate-400' },
]

export interface Job {
  id: string
  user_id: string
  company_name: string
  job_title: string
  job_description: string | null
  application_url: string | null
  status: JobStatus
  applied_at: string | null
  salary_range: string | null
  location: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface JobFormData {
  company_name: string
  job_title: string
  job_description?: string
  application_url?: string
  status: JobStatus
  applied_at?: string
  salary_range?: string
  location?: string
  notes?: string
}

export function getStatusConfig(status: JobStatus) {
  return JOB_STATUSES.find(s => s.value === status) || JOB_STATUSES[0]
}

