'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { type Job, getStatusConfig } from '@/types/jobs'
import {
  Building2,
  Calendar,
  ExternalLink,
  MapPin,
  MoreVertical,
  Pencil,
  Trash2,
  DollarSign,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface JobCardProps {
  job: Job
  onDelete?: (id: string) => void
}

export function JobCard({ job, onDelete }: JobCardProps) {
  const statusConfig = getStatusConfig(job.status)
  
  const formattedDate = job.applied_at
    ? new Date(job.applied_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null

  return (
    <Card className="group relative transition-all hover:border-primary/30 hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <Link
              href={`/dashboard/jobs/${job.id}`}
              className="block"
            >
              <h3 className="truncate text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                {job.job_title}
              </h3>
            </Link>
            <div className="mt-1 flex items-center gap-2 text-muted-foreground">
              <Building2 className="h-4 w-4 shrink-0" />
              <span className="truncate text-sm">{job.company_name}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className={cn('shrink-0 font-medium', statusConfig.color)}
            >
              {statusConfig.label}
            </Badge>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 data-[state=open]:opacity-100"
                >
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/jobs/${job.id}`}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </DropdownMenuItem>
                {job.application_url && (
                  <DropdownMenuItem asChild>
                    <a
                      href={job.application_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Listing
                    </a>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => onDelete?.(job.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
          {job.location && (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              <span>{job.location}</span>
            </div>
          )}
          {job.salary_range && (
            <div className="flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5" />
              <span>{job.salary_range}</span>
            </div>
          )}
          {formattedDate && (
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <span>Applied {formattedDate}</span>
            </div>
          )}
        </div>

        {job.notes && (
          <p className="mt-3 line-clamp-2 text-sm text-muted-foreground/80">
            {job.notes}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

