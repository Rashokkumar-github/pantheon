import Link from 'next/link'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ListChecks, Sparkles } from 'lucide-react'

export default function ResumeBulletsPage() {
  return (
    <div className="flex flex-col">
      <DashboardHeader
        title="Resume Bullets"
        description="Create impactful resume bullet points with AI."
      >
        <Button asChild className="gap-2">
          <Link href="/dashboard/resume-bullets/new">
            <Sparkles className="h-4 w-4" />
            Generate New
          </Link>
        </Button>
      </DashboardHeader>

      <div className="flex-1 p-6 lg:p-8">
        <Card className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <ListChecks className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">
            No resume bullets yet
          </h3>
          <p className="mt-2 max-w-md text-muted-foreground">
            Generate compelling resume bullet points tailored to specific job
            descriptions and your experience.
          </p>
          <Button asChild className="mt-6 gap-2">
            <Link href="/dashboard/resume-bullets/new">
              <Sparkles className="h-4 w-4" />
              Generate your first bullets
            </Link>
          </Button>
        </Card>
      </div>
    </div>
  )
}

