'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { JobCard } from './job-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { type Job, JOB_STATUSES, type JobStatus } from '@/types/jobs'
import { getJobs, deleteJob } from '@/lib/api/jobs'
import { Briefcase, Loader2, Plus, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function JobList() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'all'>(
    (searchParams.get('status') as JobStatus) || 'all'
  )
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [jobToDelete, setJobToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadJobs = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await getJobs()
      setJobs(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load jobs')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadJobs()
  }, [loadJobs])

  const filteredJobs = jobs.filter(job => {
    const matchesSearch =
      searchQuery === '' ||
      job.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.job_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'all' || job.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleStatusFilterChange = (status: JobStatus | 'all') => {
    setStatusFilter(status)
    const params = new URLSearchParams(searchParams)
    if (status === 'all') {
      params.delete('status')
    } else {
      params.set('status', status)
    }
    router.push(`/dashboard/jobs?${params.toString()}`, { scroll: false })
  }

  const handleDeleteClick = (id: string) => {
    setJobToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!jobToDelete) return

    try {
      setIsDeleting(true)
      await deleteJob(jobToDelete)
      setJobs(prev => prev.filter(j => j.id !== jobToDelete))
      setDeleteDialogOpen(false)
      setJobToDelete(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete job')
    } finally {
      setIsDeleting(false)
    }
  }

  const statusCounts = jobs.reduce(
    (acc, job) => {
      acc[job.status] = (acc[job.status] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <Card className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-destructive">{error}</p>
        <Button onClick={loadJobs} className="mt-4">
          Try Again
        </Button>
      </Card>
    )
  }

  if (jobs.length === 0) {
    return (
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
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search jobs..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9 pr-9"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Status Filter Pills */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleStatusFilterChange('all')}
            className={cn(
              'inline-flex items-center rounded-full px-3 py-1 text-sm font-medium transition-colors',
              statusFilter === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            All
            <Badge variant="secondary" className="ml-2 h-5 min-w-5 justify-center bg-background/20">
              {jobs.length}
            </Badge>
          </button>
          {JOB_STATUSES.map(status => (
            <button
              key={status.value}
              onClick={() => handleStatusFilterChange(status.value)}
              className={cn(
                'inline-flex items-center rounded-full px-3 py-1 text-sm font-medium transition-colors',
                statusFilter === status.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              {status.label}
              {statusCounts[status.value] ? (
                <Badge variant="secondary" className="ml-2 h-5 min-w-5 justify-center bg-background/20">
                  {statusCounts[status.value]}
                </Badge>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {filteredJobs.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground">
            No jobs match your current filters.
          </p>
          <Button
            variant="ghost"
            onClick={() => {
              setSearchQuery('')
              handleStatusFilterChange('all')
            }}
            className="mt-2"
          >
            Clear filters
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredJobs.map(job => (
            <JobCard key={job.id} job={job} onDelete={handleDeleteClick} />
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Job Application</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this job application? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

