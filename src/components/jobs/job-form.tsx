'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { JOB_STATUSES, type JobFormData, type Job, type JobStatus } from '@/types/jobs'
import { createJob, updateJob } from '@/lib/api/jobs'
import { Loader2 } from 'lucide-react'

interface JobFormProps {
  job?: Job
  mode: 'create' | 'edit'
}

export function JobForm({ job, mode }: JobFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<JobFormData>({
    company_name: job?.company_name || '',
    job_title: job?.job_title || '',
    job_description: job?.job_description || '',
    application_url: job?.application_url || '',
    status: job?.status || 'applied',
    applied_at: job?.applied_at ? job.applied_at.split('T')[0] : new Date().toISOString().split('T')[0],
    salary_range: job?.salary_range || '',
    location: job?.location || '',
    notes: job?.notes || '',
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleStatusChange = (value: string) => {
    setFormData(prev => ({ ...prev, status: value as JobStatus }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Validation
      if (!formData.company_name.trim()) {
        throw new Error('Company name is required')
      }
      if (!formData.job_title.trim()) {
        throw new Error('Job title is required')
      }

      if (mode === 'create') {
        await createJob(formData)
      } else if (job) {
        await updateJob(job.id, formData)
      }

      router.push('/dashboard/jobs')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-xl">
            {mode === 'create' ? 'New Job Application' : 'Edit Job Application'}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Required Fields */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="company_name">
                Company Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="company_name"
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                placeholder="e.g., Google, Stripe, Vercel"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="job_title">
                Job Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="job_title"
                name="job_title"
                value={formData.job_title}
                onChange={handleChange}
                placeholder="e.g., Senior Software Engineer"
                required
              />
            </div>
          </div>

          {/* Status and Date */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={handleStatusChange}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {JOB_STATUSES.map(status => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="applied_at">Application Date</Label>
              <Input
                id="applied_at"
                name="applied_at"
                type="date"
                value={formData.applied_at}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Location and Salary */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Remote, San Francisco, CA"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="salary_range">Salary Range</Label>
              <Input
                id="salary_range"
                name="salary_range"
                value={formData.salary_range}
                onChange={handleChange}
                placeholder="e.g., $150k - $180k"
              />
            </div>
          </div>

          {/* Application URL */}
          <div className="space-y-2">
            <Label htmlFor="application_url">Application URL</Label>
            <Input
              id="application_url"
              name="application_url"
              type="url"
              value={formData.application_url}
              onChange={handleChange}
              placeholder="https://..."
            />
          </div>

          {/* Job Description */}
          <div className="space-y-2">
            <Label htmlFor="job_description">Job Description</Label>
            <Textarea
              id="job_description"
              name="job_description"
              value={formData.job_description}
              onChange={handleChange}
              placeholder="Paste the job description here..."
              className="min-h-32"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Any additional notes about this application..."
              className="min-h-24"
            />
          </div>
        </CardContent>

        <CardFooter className="flex justify-between border-t pt-6">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === 'create' ? 'Add Application' : 'Save Changes'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}

