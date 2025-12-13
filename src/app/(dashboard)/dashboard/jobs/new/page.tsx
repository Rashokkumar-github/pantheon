import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { JobForm } from '@/components/jobs/job-form'

export default function NewJobPage() {
  return (
    <div className="flex flex-col">
      <DashboardHeader
        title="Add Job Application"
        description="Track a new job application."
      />

      <div className="flex-1 p-6 lg:p-8">
        <div className="mx-auto max-w-2xl">
          <JobForm mode="create" />
        </div>
      </div>
    </div>
  )
}

