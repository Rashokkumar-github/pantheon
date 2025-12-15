import Link from 'next/link'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ResumeBulletList } from '@/components/resume-bullets/resume-bullet-list'
import { createClient } from '@/lib/db/supabase-server'
import { ListChecks, Sparkles } from 'lucide-react'

export default async function ResumeBulletsPage() {
  const supabase = await createClient()
  
  const { data: bullets, error } = await supabase
    .from('resume_bullets')
    .select('*')
    .order('created_at', { ascending: false })

  const hasBullets = bullets && bullets.length > 0

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
        {hasBullets ? (
          <div className="mx-auto max-w-4xl">
            <ResumeBulletList bullets={bullets} />
          </div>
        ) : (
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
        )}
      </div>
    </div>
  )
}
