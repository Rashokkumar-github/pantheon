import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { CoverLetterGenerator } from '@/components/cover-letters/cover-letter-generator'

export default function NewCoverLetterPage() {
  return (
    <div className="flex flex-col">
      <DashboardHeader
        title="Generate Cover Letter"
        description="Create a tailored cover letter using AI"
      />

      <div className="flex-1 p-6 lg:p-8">
        <div className="mx-auto max-w-3xl">
          <CoverLetterGenerator />
        </div>
      </div>
    </div>
  )
}

