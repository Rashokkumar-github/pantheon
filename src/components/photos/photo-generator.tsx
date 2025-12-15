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
  ArrowRight,
  CheckCircle2,
  Wand2,
  Image as ImageIcon,
  Camera
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { 
  Photo, 
  GenerationOptions,
  HeadshotStyle,
  BackgroundStyle,
  AttireStyle,
  HEADSHOT_STYLES,
  BACKGROUND_STYLES,
  ATTIRE_STYLES
} from '@/types/photos'
import {
  HEADSHOT_STYLES as headshotStyles,
  BACKGROUND_STYLES as backgroundStyles,
  ATTIRE_STYLES as attireStyles,
} from '@/types/photos'

type GenerationStep = 'upload' | 'style' | 'generating' | 'complete'

export function PhotoGenerator() {
  const router = useRouter()
  const [step, setStep] = useState<GenerationStep>('upload')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [photo, setPhoto] = useState<Photo | null>(null)
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  const [options, setOptions] = useState<GenerationOptions>({
    headshotStyle: 'startup',
    background: 'studio',
    attire: 'business-casual',
  })

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    setError(null)
  }

  const handleContinueToStyle = async () => {
    if (!selectedFile) return
    
    setIsUploading(true)
    setError(null)

    try {
      const uploadedPhoto = await uploadPhoto(selectedFile)
      setPhoto(uploadedPhoto)
      setStep('style')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  const handleGenerate = async () => {
    if (!photo) return

    setStep('generating')
    setIsGenerating(true)
    setError(null)
    
    // Simulate progress while generating
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + Math.random() * 10, 90))
    }, 800)

    try {
      const response = await fetch('/api/photos/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          photoId: photo.id,
          options,
        }),
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Generation failed')
      }

      const { generatedUrl: resultUrl } = await response.json()
      
      setProgress(100)
      setGeneratedUrl(resultUrl)
      
      await updatePhotoWithEnhancement(photo.id, resultUrl, 'replicate-photomaker')
      
      setStep('complete')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setStep('style')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = async () => {
    if (!generatedUrl) return
    
    try {
      const response = await fetch(generatedUrl)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `professional-headshot-${Date.now()}.png`
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
    setGeneratedUrl(null)
    setProgress(0)
    setError(null)
    setOptions({
      headshotStyle: 'startup',
      background: 'studio',
      attire: 'business-casual',
    })
  }

  const steps = [
    { key: 'upload', label: 'Upload', icon: Camera },
    { key: 'style', label: 'Customize', icon: Wand2 },
    { key: 'generating', label: 'Generate', icon: Sparkles },
    { key: 'complete', label: 'Download', icon: Download },
  ]

  const currentStepIndex = steps.findIndex(s => s.key === step)

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {steps.map((s, idx) => (
          <div key={s.key} className="flex items-center">
            <div className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-full transition-all text-sm',
              step === s.key && 'bg-primary text-primary-foreground',
              idx < currentStepIndex && 'bg-primary/20 text-primary',
              idx > currentStepIndex && 'bg-muted text-muted-foreground'
            )}>
              {idx < currentStepIndex ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <s.icon className="h-4 w-4" />
              )}
              <span className="font-medium hidden sm:inline">{s.label}</span>
            </div>
            {idx < steps.length - 1 && (
              <div className={cn(
                'w-6 h-0.5 mx-1',
                idx < currentStepIndex ? 'bg-primary' : 'bg-border'
              )} />
            )}
          </div>
        ))}
      </div>

      <Card className="border-border/50 shadow-xl">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl">
            {step === 'upload' && 'Upload Your Photo'}
            {step === 'style' && 'Customize Your Headshot'}
            {step === 'generating' && 'Generating Your Headshot'}
            {step === 'complete' && 'Your Professional Headshot'}
          </CardTitle>
          <CardDescription className="text-base">
            {step === 'upload' && 'Upload a clear selfie to transform into a professional headshot'}
            {step === 'style' && 'Choose the style, background, and attire for your new headshot'}
            {step === 'generating' && 'Our AI is creating your professional headshot...'}
            {step === 'complete' && 'Your AI-generated professional headshot is ready!'}
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          {error && (
            <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Upload Step */}
          {step === 'upload' && (
            <PhotoDropzone
              onFileSelect={handleFileSelect}
              disabled={isUploading}
            />
          )}

          {/* Style Selection Step */}
          {step === 'style' && (
            <div className="space-y-8">
              {/* Preview of uploaded photo */}
              <div className="flex justify-center">
                <div className="relative">
                  <img 
                    src={photo?.original_url} 
                    alt="Your photo" 
                    className="w-32 h-32 rounded-full object-cover ring-4 ring-primary/20"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full p-1.5">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                </div>
              </div>

              {/* Headshot Style */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">Headshot Style</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {headshotStyles.map((style) => (
                    <button
                      key={style.value}
                      onClick={() => setOptions(o => ({ ...o, headshotStyle: style.value }))}
                      className={cn(
                        'flex flex-col items-center p-4 rounded-xl border-2 transition-all text-center',
                        options.headshotStyle === style.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50 hover:bg-muted/30'
                      )}
                    >
                      <span className="text-2xl mb-2">{style.icon}</span>
                      <span className="font-medium text-sm">{style.label}</span>
                      <span className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {style.description}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Background Style */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">Background</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {backgroundStyles.map((bg) => (
                    <button
                      key={bg.value}
                      onClick={() => setOptions(o => ({ ...o, background: bg.value }))}
                      className={cn(
                        'flex flex-col items-center p-3 rounded-xl border-2 transition-all',
                        options.background === bg.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50 hover:bg-muted/30'
                      )}
                    >
                      <div className={cn(
                        'w-12 h-12 rounded-lg mb-2',
                        bg.color
                      )} />
                      <span className="font-medium text-xs">{bg.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Attire Style */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">Attire</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {attireStyles.map((attire) => (
                    <button
                      key={attire.value}
                      onClick={() => setOptions(o => ({ ...o, attire: attire.value }))}
                      className={cn(
                        'flex flex-col items-center p-4 rounded-xl border-2 transition-all text-center',
                        options.attire === attire.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50 hover:bg-muted/30'
                      )}
                    >
                      <span className="text-2xl mb-2">{attire.icon}</span>
                      <span className="font-medium text-sm">{attire.label}</span>
                      <span className="text-xs text-muted-foreground mt-1">
                        {attire.description}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Generating Step */}
          {step === 'generating' && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="relative mb-8">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/40 to-purple-500/30 blur-2xl animate-pulse" />
                <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-primary via-purple-500 to-pink-500">
                  <Wand2 className="h-16 w-16 text-white animate-pulse" />
                </div>
              </div>
              
              <p className="text-lg font-medium text-foreground mb-2">
                Creating your professional headshot...
              </p>
              <p className="text-sm text-muted-foreground mb-6 text-center max-w-md">
                Our AI is generating a {options.headshotStyle} style headshot with {options.background} background and {options.attire} attire
              </p>
              
              <div className="w-full max-w-xs">
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary via-purple-500 to-pink-500 transition-all duration-500 ease-out rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-center text-sm text-muted-foreground mt-2">
                  {Math.round(progress)}%
                </p>
              </div>
            </div>
          )}

          {/* Complete Step */}
          {step === 'complete' && generatedUrl && (
            <div className="flex flex-col items-center">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mb-6">
                <div className="flex flex-col items-center">
                  <p className="text-sm font-medium text-muted-foreground mb-3">Original Photo</p>
                  <div className="relative rounded-2xl overflow-hidden shadow-lg ring-1 ring-border aspect-square w-full max-w-[300px]">
                    <img
                      src={photo?.original_url}
                      alt="Original"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <p className="text-sm font-medium text-primary mb-3 flex items-center gap-1">
                    <Sparkles className="h-4 w-4" />
                    AI Generated Headshot
                  </p>
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl ring-2 ring-primary/30 aspect-square w-full max-w-[300px]">
                    <img
                      src={generatedUrl}
                      alt="Generated"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 ring-2 ring-primary/20 rounded-2xl" />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-4">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">Generation complete!</span>
              </div>

              <p className="text-sm text-muted-foreground text-center max-w-md">
                Your {options.headshotStyle} style headshot with {options.background} background is ready for download
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between border-t pt-6">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              if (step === 'upload') router.back()
              else if (step === 'style') setStep('upload')
              else if (step === 'complete') handleStartOver()
            }}
            disabled={isUploading || isGenerating}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {step === 'complete' ? 'Start Over' : step === 'style' ? 'Back' : 'Cancel'}
          </Button>
          
          {step === 'upload' && (
            <Button 
              onClick={handleContinueToStyle}
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
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          )}

          {step === 'style' && (
            <Button onClick={handleGenerate} className="gap-2">
              <Wand2 className="h-4 w-4" />
              Generate Headshot
            </Button>
          )}

          {step === 'complete' && (
            <Button onClick={handleDownload} className="gap-2">
              <Download className="h-4 w-4" />
              Download Headshot
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Tips section */}
      {step === 'upload' && (
        <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-purple-500/5 border border-border/50">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Tips for best results:
          </h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 mt-1.5 rounded-full bg-primary/60 shrink-0" />
              Use a clear, front-facing photo
            </li>
            <li className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 mt-1.5 rounded-full bg-primary/60 shrink-0" />
              Good lighting on your face
            </li>
            <li className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 mt-1.5 rounded-full bg-primary/60 shrink-0" />
              Neutral expression works best
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

