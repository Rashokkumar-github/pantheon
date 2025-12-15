import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { PhotoGenerator } from '@/components/photos/photo-generator'

export default function GeneratePhotoPage() {
  return (
    <div className="flex flex-col">
      <DashboardHeader
        title="Generate Professional Headshot"
        description="Transform your selfie into a polished, LinkedIn-ready professional headshot."
      />

      <div className="flex-1 p-6 lg:p-8">
        <PhotoGenerator />
      </div>
    </div>
  )
}

