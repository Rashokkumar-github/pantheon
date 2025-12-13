import Link from 'next/link'
import { createClient } from '@/lib/db/supabase-server'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Briefcase,
  FileText,
  ImageIcon,
  ListChecks,
  Plus,
  ArrowRight,
  TrendingUp,
} from 'lucide-react'

const quickActions = [
  {
    title: 'Add Job Application',
    description: 'Track a new job opportunity',
    href: '/dashboard/jobs/new',
    icon: Briefcase,
    color: 'bg-blue-500/10 text-blue-600',
  },
  {
    title: 'Generate Cover Letter',
    description: 'Create a tailored cover letter',
    href: '/dashboard/cover-letters/new',
    icon: FileText,
    color: 'bg-purple-500/10 text-purple-600',
  },
  {
    title: 'Create Resume Bullets',
    description: 'Generate impactful bullet points',
    href: '/dashboard/resume-bullets/new',
    icon: ListChecks,
    color: 'bg-green-500/10 text-green-600',
  },
  {
    title: 'Enhance Photo',
    description: 'Improve your profile picture',
    href: '/dashboard/photos/new',
    icon: ImageIcon,
    color: 'bg-amber-500/10 text-amber-600',
  },
]

const stats = [
  { label: 'Total Applications', value: '0', change: null },
  { label: 'Active', value: '0', change: null },
  { label: 'Interviews', value: '0', change: null },
  { label: 'Offers', value: '0', change: null },
]

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const firstName = user?.email?.split('@')[0] || 'there'

  return (
    <div className="flex flex-col">
      <DashboardHeader
        title="Dashboard"
        description="Welcome back! Here's an overview of your job search."
      />

      <div className="flex-1 space-y-8 p-6 pt-6 lg:p-8">
        {/* Welcome section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Welcome back, {firstName}!
            </h2>
            <p className="text-muted-foreground">
              Here&apos;s what&apos;s happening with your job search.
            </p>
          </div>
          <Button asChild className="gap-2">
            <Link href="/dashboard/jobs/new">
              <Plus className="h-4 w-4" />
              Add Application
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </p>
                {stat.change && (
                  <span className="flex items-center text-xs text-green-600">
                    <TrendingUp className="mr-1 h-3 w-3" />
                    {stat.change}
                  </span>
                )}
              </div>
              <p className="mt-2 text-3xl font-bold">{stat.value}</p>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="mb-4 text-lg font-semibold">Quick Actions</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => (
              <Link key={action.title} href={action.href}>
                <Card className="group h-full p-5 transition-all hover:border-primary/20 hover:shadow-md">
                  <div
                    className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg ${action.color}`}
                  >
                    <action.icon className="h-5 w-5" />
                  </div>
                  <h4 className="font-medium text-foreground group-hover:text-primary">
                    {action.title}
                  </h4>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {action.description}
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity & Applications */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Applications */}
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">Recent Applications</h3>
              <Button variant="ghost" size="sm" asChild className="gap-1">
                <Link href="/dashboard/jobs">
                  View all
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Briefcase className="h-6 w-6 text-muted-foreground" />
              </div>
              <h4 className="font-medium text-foreground">No applications yet</h4>
              <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                Start tracking your job applications to see them here.
              </p>
              <Button asChild className="mt-4 gap-2" size="sm">
                <Link href="/dashboard/jobs/new">
                  <Plus className="h-4 w-4" />
                  Add your first application
                </Link>
              </Button>
            </div>
          </Card>

          {/* Recent Cover Letters */}
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">Recent Cover Letters</h3>
              <Button variant="ghost" size="sm" asChild className="gap-1">
                <Link href="/dashboard/cover-letters">
                  View all
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <h4 className="font-medium text-foreground">No cover letters yet</h4>
              <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                Generate your first AI-powered cover letter.
              </p>
              <Button asChild className="mt-4 gap-2" size="sm">
                <Link href="/dashboard/cover-letters/new">
                  <Plus className="h-4 w-4" />
                  Generate cover letter
                </Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

