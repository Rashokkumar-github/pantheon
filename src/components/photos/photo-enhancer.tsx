'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { PhotoDropzone } from './photo-dropzone'
import { uploadPhoto, updatePhotoWithEnhancement } from '@/lib/api/photos'
import { 
  Loader2, 
  Sparkles, 
  Download, 
  ArrowLeft, 
  CheckCircle2,
  Wand2,
  Image as ImageIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Photo } from '@/types/photos'

type EnhancementStep = 'upload' | 'enhancing' | 'complete'

export function PhotoEnhancer() {
  const router = useRouter()
  const [step, setStep] = useState<EnhancementStep>('upload')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [photo, setPhoto] = useState<Photo | null>(null)
  const [enhancedUrl, setEnhancedUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    setError(null)
  }

  const handleUploadAndEnhance = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    setError(null)

    try {
      // Upload the photo
      const uploadedPhoto = await uploadPhoto(selectedFile)
      setPhoto(uploadedPhoto)
      
      // Start enhancement
      setStep('enhancing')
      setIsUploading(false)
      setIsEnhancing(true)
      
      // Simulate progress while enhancing
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + Math.random() * 15, 90))
      }, 500)

      // Call the enhancement API
      const response = await fetch('/api/photos/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId: uploadedPhoto.id }),
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Enhancement failed')
      }

      const { enhancedUrl: resultUrl } = await response.json()
      
      setProgress(100)
      setEnhancedUrl(resultUrl)
      
      // Update photo record
      await updatePhotoWithEnhancement(uploadedPhoto.id, resultUrl, 'replicate')
      
      setStep('complete')
      setIsEnhancing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setIsUploading(false)
      setIsEnhancing(false)
      setStep('upload')
    }
  }

  const handleDownload = async () => {
    if (!enhancedUrl) return
    
    try {
      const response = await fetch(enhancedUrl)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `linkedin-photo-enhanced-${Date.now()}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      setError('Failed to download image')
    }
  }

  const handleStartOver = () => {
    setStep('upload')
    setSelectedFile(null)
    setPhoto(null)
    setEnhancedUrl(null)
    setProgress(0)
    setError(null)
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-3 mb-8">
        {[
          { key: 'upload', label: 'Upload', icon: ImageIcon },
          { key: 'enhancing', label: 'Enhance', icon: Wand2 },
          { key: 'complete', label: 'Download', icon: Download },
        ].map((s, idx) => (
          <div key={s.key} className="flex items-center">
            <div className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-full transition-all',
              step === s.key && 'bg-primary text-primary-foreground',
              step !== s.key && (
                ['enhancing', 'complete'].includes(step) && s.key === 'upload' ||
                step === 'complete' && s.key === 'enhancing'
              ) && 'bg-primary/20 text-primary',
              step !== s.key && !(
                ['enhancing', 'complete'].includes(step) && s.key === 'upload' ||
                step === 'complete' && s.key === 'enhancing'
              ) && 'bg-muted text-muted-foreground'
            )}>
              {(['enhancing', 'complete'].includes(step) && s.key === 'upload' ||
                step === 'complete' && s.key === 'enhancing') ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <s.icon className="h-4 w-4" />
              )}
              <span className="text-sm font-medium hidden sm:inline">{s.label}</span>
            </div>
            {idx < 2 && (
              <div className={cn(
                'w-8 h-0.5 mx-2',
                (step === 'enhancing' && idx === 0) || (step === 'complete')
                  ? 'bg-primary'
                  : 'bg-border'
              )} />
            )}
          </div>
        ))}
      </div>

      <Card className="border-border/50 shadow-xl">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl">
            {step === 'upload' && 'Upload Your Photo'}
            {step === 'enhancing' && 'Enhancing Your Photo'}
            {step === 'complete' && 'Your LinkedIn-Ready Photo'}
          </CardTitle>
          <CardDescription className="text-base">
            {step === 'upload' && 'Upload a clear selfie to transform into a professional headshot'}
            {step === 'enhancing' && 'Our AI is working its magic on your photo...'}
            {step === 'complete' && 'Your professional headshot is ready for download!'}
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          {error && (
            <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          )}

          {step === 'upload' && (
            <PhotoDropzone
              onFileSelect={handleFileSelect}
              disabled={isUploading}
            />
          )}

          {step === 'enhancing' && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="relative mb-8">
                {/* Animated glow effect */}
                <div className="absolute inset-0 rounded-full bg-primary/30 blur-2xl animate-pulse" />
                <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/60">
                  <Sparkles className="h-16 w-16 text-primary-foreground animate-pulse" />
                </div>
              </div>
              
              <p className="text-lg font-medium text-foreground mb-2">
                Enhancing your photo...
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                This usually takes 10-30 seconds
              </p>
              
              {/* Progress bar */}
              <div className="w-full max-w-xs">
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-center text-sm text-muted-foreground mt-2">
                  {Math.round(progress)}%
                </p>
              </div>
            </div>
          )}

          {step === 'complete' && enhancedUrl && (
            <div className="flex flex-col items-center">
              {/* Before/After comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-6">
                <div className="flex flex-col items-center">
                  <p className="text-sm font-medium text-muted-foreground mb-3">Original</p>
                  <div className="relative rounded-2xl overflow-hidden shadow-lg ring-1 ring-border">
                    <img
                      src={photo?.original_url}
                      alt="Original"
                      className="w-full max-w-[280px] object-cover aspect-square"
                    />
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <p className="text-sm font-medium text-primary mb-3 flex items-center gap-1">
                    <Sparkles className="h-4 w-4" />
                    Enhanced
                  </p>
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl ring-2 ring-primary/30">
                    <img
                      src={enhancedUrl}
                      alt="Enhanced"
                      className="w-full max-w-[280px] object-cover aspect-square"
                    />
                    <div className="absolute inset-0 ring-2 ring-primary/20 rounded-2xl" />
                  </div>
                </div>
              </div>

              {/* Success message */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-6">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">Enhancement complete!</span>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between border-t pt-6">
          <Button
            type="button"
            variant="ghost"
            onClick={step === 'complete' ? handleStartOver : () => router.back()}
            disabled={isUploading || isEnhancing}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {step === 'complete' ? 'Start Over' : 'Cancel'}
          </Button>
          
          {step === 'upload' && (
            <Button 
              onClick={handleUploadAndEnhance}
              disabled={!selectedFile || isUploading}
              className="gap-2"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Enhance Photo
                </>
              )}
            </Button>
          )}

          {step === 'complete' && (
            <Button onClick={handleDownload} className="gap-2">
              <Download className="h-4 w-4" />
              Download Enhanced Photo
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Tips section */}
      {step === 'upload' && (
        <div className="mt-8 p-6 rounded-2xl bg-muted/30 border border-border/50">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Tips for best results:
          </h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 mt-1.5 rounded-full bg-primary/60 shrink-0" />
              Use a clear, well-lit photo
            </li>
            <li className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 mt-1.5 rounded-full bg-primary/60 shrink-0" />
              Face the camera directly
            </li>
            <li className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 mt-1.5 rounded-full bg-primary/60 shrink-0" />
              Avoid heavy filters or editing
            </li>
            <li className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 mt-1.5 rounded-full bg-primary/60 shrink-0" />
              Higher resolution = better results
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}

