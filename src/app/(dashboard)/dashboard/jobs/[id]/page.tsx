import { notFound } from 'next/navigation'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { JobForm } from '@/components/jobs/job-form'
import { createClient } from '@/lib/db/supabase-server'

interface JobPageProps {
  params: Promise<{ id: string }>
}

export default async function JobPage({ params }: JobPageProps) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: job, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !job) {
    notFound()
  }

  return (
    <div className="flex flex-col">
      <DashboardHeader
        title="Edit Job Application"
        description={`${job.job_title} at ${job.company_name}`}
      />

      <div className="flex-1 p-6 lg:p-8">
        <div className="mx-auto max-w-2xl">
          <JobForm job={job} mode="edit" />
        </div>
      </div>
    </div>
  )
}

