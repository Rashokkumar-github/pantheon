import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { SmartApplyWizard } from '@/components/jobs/smart-apply-wizard'

export default function SmartApplyPage() {
  return (
    <div className="flex flex-col">
      <DashboardHeader
        title="Smart Apply"
        description="Generate your cover letter and resume bullets in one go"
      />

      <div className="flex-1 p-6 lg:p-8">
        <div className="mx-auto max-w-3xl">
          <SmartApplyWizard />
        </div>
      </div>
    </div>
  )
}

