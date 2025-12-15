import Link from 'next/link'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Sparkles } from 'lucide-react'
import { CoverLetterList } from '@/components/cover-letters/cover-letter-list'
import { createClient } from '@/lib/db/supabase-server'

export default async function CoverLettersPage() {
  const supabase = await createClient()
  
  const { count } = await supabase
    .from('cover_letters')
    .select('*', { count: 'exact', head: true })

  const hasCoverLetters = (count ?? 0) > 0

  return (
    <div className="flex flex-col">
      <DashboardHeader
        title="Cover Letters"
        description="Generate and manage AI-powered cover letters."
      >
        <Button asChild className="gap-2">
          <Link href="/dashboard/cover-letters/new">
            <Sparkles className="h-4 w-4" />
            Generate New
          </Link>
        </Button>
      </DashboardHeader>

      <div className="flex-1 p-6 lg:p-8">
        {hasCoverLetters ? (
          <CoverLetterList />
        ) : (
          <Card className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              No cover letters yet
            </h3>
            <p className="mt-2 max-w-md text-muted-foreground">
              Generate personalized cover letters tailored to specific job
              descriptions using AI.
            </p>
            <Button asChild className="mt-6 gap-2">
              <Link href="/dashboard/cover-letters/new">
                <Sparkles className="h-4 w-4" />
                Generate your first cover letter
              </Link>
            </Button>
          </Card>
        )}
      </div>
    </div>
  )
}
