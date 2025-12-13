import Link from 'next/link'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Briefcase, Plus } from 'lucide-react'

export default function JobsPage() {
  return (
    <div className="flex flex-col">
      <DashboardHeader
        title="Job Applications"
        description="Track and manage all your job applications."
      >
        <Button asChild className="gap-2">
          <Link href="/dashboard/jobs/new">
            <Plus className="h-4 w-4" />
            Add Application
          </Link>
        </Button>
      </DashboardHeader>

      <div className="flex-1 p-6 lg:p-8">
        <Card className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Briefcase className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">
            No job applications yet
          </h3>
          <p className="mt-2 max-w-md text-muted-foreground">
            Start tracking your job search by adding your first application.
            You&apos;ll be able to track status, deadlines, and more.
          </p>
          <Button asChild className="mt-6 gap-2">
            <Link href="/dashboard/jobs/new">
              <Plus className="h-4 w-4" />
              Add your first application
            </Link>
          </Button>
        </Card>
      </div>
    </div>
  )
}

