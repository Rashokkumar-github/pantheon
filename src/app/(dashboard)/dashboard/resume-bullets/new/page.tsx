import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { ResumeBulletGenerator } from '@/components/resume-bullets/resume-bullet-generator'

export default function NewResumeBulletsPage() {
  return (
    <div className="flex flex-col">
      <DashboardHeader
        title="Generate Resume Bullets"
        description="Create tailored bullet points using AI"
      />

      <div className="flex-1 p-6 lg:p-8">
        <div className="mx-auto max-w-3xl">
          <ResumeBulletGenerator />
        </div>
      </div>
    </div>
  )
}

