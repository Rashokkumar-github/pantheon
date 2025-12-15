'use client'

import { useState, useEffect } from 'react'
import { PhotoCard } from './photo-card'
import { Skeleton } from '@/components/ui/skeleton'
import { getPhotos } from '@/lib/api/photos'
import type { Photo } from '@/types/photos'

export function PhotoList() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadPhotos = async () => {
    try {
      const data = await getPhotos()
      setPhotos(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load photos')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadPhotos()
  }, [])

  const handlePhotoDelete = () => {
    loadPhotos()
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-square rounded-xl" />
            <div className="space-y-2 px-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
        <p className="text-destructive">{error}</p>
      </div>
    )
  }

  if (photos.length === 0) {
    return null // Parent component handles empty state
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {photos.map((photo) => (
        <PhotoCard 
          key={photo.id} 
          photo={photo} 
          onDelete={handlePhotoDelete}
        />
      ))}
    </div>
  )
}

