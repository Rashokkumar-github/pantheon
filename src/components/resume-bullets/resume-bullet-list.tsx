'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { deleteResumeBullet, deleteResumeBullets } from '@/lib/api/resume-bullets'
import type { ResumeBullet } from '@/types/resume-bullets'
import { Copy, Check, Trash2, Calendar } from 'lucide-react'

interface ResumeBulletListProps {
  bullets: ResumeBullet[]
}

export function ResumeBulletList({ bullets }: ResumeBulletListProps) {
  const router = useRouter()
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const toggleAll = () => {
    if (selectedIds.size === bullets.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(bullets.map(b => b.id)))
    }
  }

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      console.error('Failed to copy')
    }
  }

  const handleCopySelected = async () => {
    const selectedBullets = bullets
      .filter(b => selectedIds.has(b.id))
      .map(b => `• ${b.bullet_text}`)
      .join('\n')
    
    try {
      await navigator.clipboard.writeText(selectedBullets)
      setCopiedId('all')
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      console.error('Failed to copy')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this bullet?')) return
    
    setIsDeleting(true)
    try {
      await deleteResumeBullet(id)
      router.refresh()
    } catch (error) {
      console.error('Failed to delete:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return
    if (!confirm(`Are you sure you want to delete ${selectedIds.size} bullet${selectedIds.size > 1 ? 's' : ''}?`)) return
    
    setIsDeleting(true)
    try {
      await deleteResumeBullets(Array.from(selectedIds))
      setSelectedIds(new Set())
      router.refresh()
    } catch (error) {
      console.error('Failed to delete:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  // Group bullets by date
  const bulletsByDate = bullets.reduce((acc, bullet) => {
    const date = new Date(bullet.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(bullet)
    return acc
  }, {} as Record<string, ResumeBullet[]>)

  return (
    <div className="space-y-6">
      {/* Bulk actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleAll}
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
              selectedIds.size === bullets.length && bullets.length > 0
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-muted-foreground/30 hover:border-primary'
            }`}
            aria-label="Select all"
          >
            {selectedIds.size === bullets.length && bullets.length > 0 && (
              <Check className="h-3 w-3" />
            )}
          </button>
          <span className="text-sm text-muted-foreground">
            {selectedIds.size > 0
              ? `${selectedIds.size} selected`
              : `${bullets.length} bullet${bullets.length !== 1 ? 's' : ''}`}
          </span>
        </div>

        {selectedIds.size > 0 && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopySelected}
              className="gap-2"
            >
              {copiedId === 'all' ? (
                <Check className="h-4 w-4 text-emerald-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copiedId === 'all' ? 'Copied!' : 'Copy Selected'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeleteSelected}
              disabled={isDeleting}
              className="gap-2 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              Delete Selected
            </Button>
          </div>
        )}
      </div>

      {/* Bullets grouped by date */}
      {Object.entries(bulletsByDate).map(([date, dateBullets]) => (
        <div key={date} className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            {date}
          </div>
          
          <div className="space-y-2">
            {dateBullets.map((bullet) => (
              <Card
                key={bullet.id}
                className={`group p-4 transition-colors ${
                  selectedIds.has(bullet.id)
                    ? 'border-primary/50 bg-primary/5'
                    : 'hover:bg-muted/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => toggleSelection(bullet.id)}
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                      selectedIds.has(bullet.id)
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-muted-foreground/30 hover:border-primary'
                    }`}
                    aria-label={`Select bullet: ${bullet.bullet_text.substring(0, 50)}`}
                  >
                    {selectedIds.has(bullet.id) && <Check className="h-3 w-3" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">
                      • {bullet.bullet_text}
                    </p>
                    {bullet.job_description && (
                      <p className="mt-2 text-xs text-muted-foreground line-clamp-1">
                        Job: {bullet.job_description.substring(0, 100)}...
                      </p>
                    )}
                  </div>

                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(bullet.id, bullet.bullet_text)}
                      className="h-8 w-8 p-0"
                      title="Copy bullet"
                    >
                      {copiedId === bullet.id ? (
                        <Check className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(bullet.id)}
                      disabled={isDeleting}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      title="Delete bullet"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

