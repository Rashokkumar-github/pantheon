'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Download, 
  Trash2, 
  Sparkles, 
  MoreVertical,
  Eye,
  ExternalLink
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { deletePhoto } from '@/lib/api/photos'
import { cn } from '@/lib/utils'
import type { Photo } from '@/types/photos'

interface PhotoCardProps {
  photo: Photo
  onDelete?: () => void
}

export function PhotoCard({ photo, onDelete }: PhotoCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  
  const displayUrl = photo.enhanced_url || photo.original_url
  const hasEnhanced = !!photo.enhanced_url

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this photo?')) return
    
    setIsDeleting(true)
    try {
      await deletePhoto(photo.id)
      onDelete?.()
    } catch (error) {
      console.error('Failed to delete photo:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDownload = async (url: string, suffix: string) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const downloadUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = `photo-${suffix}-${Date.now()}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <>
      <Card className="group relative overflow-hidden border-border/50 transition-all hover:border-border hover:shadow-lg">
        {/* Image container */}
        <div 
          className="relative aspect-square cursor-pointer overflow-hidden bg-muted"
          onClick={() => setShowPreview(true)}
        >
          <img
            src={displayUrl}
            alt={photo.file_name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100">
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <Button size="sm" variant="secondary" className="gap-1.5">
                <Eye className="h-3.5 w-3.5" />
                View
              </Button>
            </div>
          </div>

          {/* Enhanced badge */}
          {hasEnhanced && (
            <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full bg-primary/90 text-primary-foreground text-xs font-medium backdrop-blur-sm">
              <Sparkles className="h-3 w-3" />
              Enhanced
            </div>
          )}
        </div>

        {/* Info section */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {photo.file_name}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatDate(photo.created_at)}
              </p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" className="shrink-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowPreview(true)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </DropdownMenuItem>
                {hasEnhanced && (
                  <DropdownMenuItem onClick={() => handleDownload(photo.enhanced_url!, 'enhanced')}>
                    <Download className="mr-2 h-4 w-4" />
                    Download Enhanced
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => handleDownload(photo.original_url, 'original')}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Download Original
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Card>

      {/* Preview dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {photo.file_name}
              {hasEnhanced && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  <Sparkles className="h-3 w-3" />
                  Enhanced
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          
          <div className={cn(
            'grid gap-4',
            hasEnhanced ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
          )}>
            {hasEnhanced && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Original</p>
                <div className="rounded-lg overflow-hidden border">
                  <img
                    src={photo.original_url}
                    alt="Original"
                    className="w-full object-contain max-h-[500px]"
                  />
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => handleDownload(photo.original_url, 'original')}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Original
                </Button>
              </div>
            )}
            
            <div className="space-y-2">
              {hasEnhanced && (
                <p className="text-sm font-medium text-primary flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  Enhanced
                </p>
              )}
              <div className={cn(
                'rounded-lg overflow-hidden border',
                hasEnhanced && 'ring-2 ring-primary/20'
              )}>
                <img
                  src={displayUrl}
                  alt={hasEnhanced ? 'Enhanced' : 'Photo'}
                  className="w-full object-contain max-h-[500px]"
                />
              </div>
              <Button 
                size="sm" 
                className="w-full"
                onClick={() => handleDownload(displayUrl, hasEnhanced ? 'enhanced' : 'original')}
              >
                <Download className="mr-2 h-4 w-4" />
                Download {hasEnhanced ? 'Enhanced' : 'Photo'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

