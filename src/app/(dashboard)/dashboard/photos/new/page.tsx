import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { PhotoEnhancer } from '@/components/photos/photo-enhancer'

export default function NewPhotoPage() {
  return (
    <div className="flex flex-col">
      <DashboardHeader
        title="Create Profile Photo"
        description="Transform your selfie into a professional LinkedIn-worthy headshot."
      />

      <div className="flex-1 p-6 lg:p-8">
        <PhotoEnhancer />
      </div>
    </div>
  )
}

