import Link from 'next/link'
import { Suspense } from 'react'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { JobList } from '@/components/jobs/job-list'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Sparkles } from 'lucide-react'

function JobListSkeleton() {
  return (
    <div className="space-y-6">
      {/* Filter skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-9 w-full max-w-sm" />
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-8 w-20 rounded-full" />
          ))}
        </div>
      </div>
      
      {/* Cards skeleton */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="rounded-lg border p-6">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2 mb-4" />
            <div className="flex gap-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function JobsPage() {
  return (
    <div className="flex flex-col">
      <DashboardHeader
        title="Job Applications"
        description="Track and manage all your job applications."
      >
        <div className="flex gap-2">
          <Button asChild variant="outline" className="gap-2">
            <Link href="/dashboard/jobs/new">
              <Plus className="h-4 w-4" />
              Add Application
            </Link>
          </Button>
          <Button asChild className="gap-2">
            <Link href="/dashboard/jobs/apply">
              <Sparkles className="h-4 w-4" />
              Smart Apply
            </Link>
          </Button>
        </div>
      </DashboardHeader>

      <div className="flex-1 p-6 lg:p-8">
        <Suspense fallback={<JobListSkeleton />}>
          <JobList />
        </Suspense>
      </div>
    </div>
  )
}
