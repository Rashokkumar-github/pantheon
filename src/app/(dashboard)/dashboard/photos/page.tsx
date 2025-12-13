import Link from 'next/link'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ImageIcon, Upload } from 'lucide-react'

export default function PhotosPage() {
  return (
    <div className="flex flex-col">
      <DashboardHeader
        title="Photo Enhancement"
        description="Enhance your profile photos for a professional look."
      >
        <Button asChild className="gap-2">
          <Link href="/dashboard/photos/new">
            <Upload className="h-4 w-4" />
            Upload Photo
          </Link>
        </Button>
      </DashboardHeader>

      <div className="flex-1 p-6 lg:p-8">
        <Card className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">
            No photos yet
          </h3>
          <p className="mt-2 max-w-md text-muted-foreground">
            Upload a photo and enhance it with AI for your professional profile,
            LinkedIn, or resume.
          </p>
          <Button asChild className="mt-6 gap-2">
            <Link href="/dashboard/photos/new">
              <Upload className="h-4 w-4" />
              Upload your first photo
            </Link>
          </Button>
        </Card>
      </div>
    </div>
  )
}

