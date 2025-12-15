'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { CoverLetterCard } from './cover-letter-card'
import { getCoverLetters } from '@/lib/api/cover-letters'
import type { CoverLetter } from '@/types/cover-letters'

export function CoverLetterList() {
  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCoverLetters() {
      try {
        const data = await getCoverLetters()
        setCoverLetters(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load cover letters')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCoverLetters()
  }, [])

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
            <Skeleton className="h-20 w-full" />
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-destructive">{error}</p>
      </Card>
    )
  }

  if (coverLetters.length === 0) {
    return null // Parent component handles empty state
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {coverLetters.map((coverLetter) => (
        <CoverLetterCard key={coverLetter.id} coverLetter={coverLetter} />
      ))}
    </div>
  )
}

