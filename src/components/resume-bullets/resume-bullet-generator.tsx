'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { generateResumeBullets, createResumeBullets } from '@/lib/api/resume-bullets'
import type { GeneratedBullet } from '@/types/resume-bullets'
import { 
  Loader2, 
  Sparkles, 
  ListChecks, 
  Copy, 
  Check, 
  ArrowLeft, 
  Save, 
  Upload, 
  FileUp, 
  Image, 
  Type,
  Trash2,
  Plus
} from 'lucide-react'

type Step = 'input' | 'generating' | 'result'
type ResumeInputMethod = 'text' | 'file'

interface SelectedBullet extends GeneratedBullet {
  id: string
  isSelected: boolean
  isEditing: boolean
  editedBullet: string
}

export function ResumeBulletGenerator() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState<Step>('input')
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Input method state
  const [resumeInputMethod, setResumeInputMethod] = useState<ResumeInputMethod>('text')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  // Input state
  const [jobDescription, setJobDescription] = useState('')
  const [resume, setResume] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [jobTitle, setJobTitle] = useState('')

  // Result state
  const [generatedBullets, setGeneratedBullets] = useState<SelectedBullet[]>([])
  const [generatedTitle, setGeneratedTitle] = useState('')

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      setError('Please upload a PDF or image file (PNG, JPEG, WebP, or GIF)')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB')
      return
    }

    setUploadedFile(file)
    setError(null)
    setIsExtracting(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/resume/extract', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to extract text from file')
      }

      setResume(data.text)
      setResumeInputMethod('text') // Switch to text view to show extracted content
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file')
      setUploadedFile(null)
    } finally {
      setIsExtracting(false)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (!file) return

    const input = fileInputRef.current
    if (input) {
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(file)
      input.files = dataTransfer.files
      handleFileSelect({ target: input } as React.ChangeEvent<HTMLInputElement>)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleGenerate = async () => {
    setError(null)
    
    if (!jobDescription.trim()) {
      setError('Please enter the job description')
      return
    }
    
    if (!resume.trim()) {
      setError('Please enter your resume or upload a file')
      return
    }

    setIsLoading(true)
    setStep('generating')

    try {
      const result = await generateResumeBullets({
        jobDescription,
        resume,
        companyName: companyName || undefined,
        jobTitle: jobTitle || undefined,
      })

      // Convert to selectable bullets
      const selectableBullets: SelectedBullet[] = result.bullets.map((bullet, index) => ({
        ...bullet,
        id: `bullet-${index}`,
        isSelected: true,
        isEditing: false,
        editedBullet: bullet.bullet,
      }))

      setGeneratedBullets(selectableBullets)
      setGeneratedTitle(result.title)
      setStep('result')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate resume bullets')
      setStep('input')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleBulletSelection = (id: string) => {
    setGeneratedBullets(bullets =>
      bullets.map(b => b.id === id ? { ...b, isSelected: !b.isSelected } : b)
    )
  }

  const toggleBulletEditing = (id: string) => {
    setGeneratedBullets(bullets =>
      bullets.map(b => b.id === id ? { ...b, isEditing: !b.isEditing } : b)
    )
  }

  const updateBulletText = (id: string, text: string) => {
    setGeneratedBullets(bullets =>
      bullets.map(b => b.id === id ? { ...b, editedBullet: text } : b)
    )
  }

  const removeBullet = (id: string) => {
    setGeneratedBullets(bullets => bullets.filter(b => b.id !== id))
  }

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      setError('Failed to copy to clipboard')
    }
  }

  const handleCopyAll = async () => {
    const selectedBullets = generatedBullets
      .filter(b => b.isSelected)
      .map(b => `• ${b.editedBullet}`)
      .join('\n')
    
    try {
      await navigator.clipboard.writeText(selectedBullets)
      setCopiedId('all')
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      setError('Failed to copy to clipboard')
    }
  }

  const handleSave = async () => {
    const selectedBullets = generatedBullets.filter(b => b.isSelected)
    
    if (selectedBullets.length === 0) {
      setError('Please select at least one bullet point to save')
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      await createResumeBullets(
        selectedBullets.map(b => ({
          bullet_text: b.editedBullet,
          job_description: jobDescription,
          is_generated: true,
          ai_service: 'anthropic-claude',
        }))
      )

      router.push('/dashboard/resume-bullets')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save bullets')
    } finally {
      setIsSaving(false)
    }
  }

  const handleStartOver = () => {
    setStep('input')
    setGeneratedBullets([])
    setGeneratedTitle('')
    setError(null)
  }

  const selectedCount = generatedBullets.filter(b => b.isSelected).length

  // Generating state
  if (step === 'generating') {
    return (
      <Card className="border-border/50">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="relative mb-6">
            <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-8 w-8 text-primary animate-pulse" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-foreground">
            Crafting your resume bullets...
          </h3>
          <p className="mt-2 text-muted-foreground">
            Analyzing job requirements and matching your experience
          </p>
          <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            This may take a moment
          </div>
        </CardContent>
      </Card>
    )
  }

  // Result state
  if (step === 'result') {
    return (
      <div className="space-y-6">
        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <ListChecks className="h-5 w-5 text-primary" />
                  {generatedTitle}
                </CardTitle>
                <CardDescription className="mt-1">
                  Generated {generatedBullets.length} bullet points • {selectedCount} selected
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyAll}
                className="gap-2"
                disabled={selectedCount === 0}
              >
                {copiedId === 'all' ? (
                  <Check className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copiedId === 'all' ? 'Copied!' : 'Copy All Selected'}
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {generatedBullets.map((bullet) => (
                <div
                  key={bullet.id}
                  className={`group relative rounded-lg border p-4 transition-colors ${
                    bullet.isSelected
                      ? 'border-primary/50 bg-primary/5'
                      : 'border-border/50 bg-muted/30 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Selection checkbox */}
                    <button
                      type="button"
                      onClick={() => toggleBulletSelection(bullet.id)}
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                        bullet.isSelected
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-muted-foreground/30 hover:border-primary'
                      }`}
                    >
                      {bullet.isSelected && <Check className="h-3 w-3" />}
                    </button>

                    <div className="flex-1 min-w-0">
                      {/* Category badge */}
                      <div className="mb-2 flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {bullet.category}
                        </Badge>
                      </div>

                      {/* Bullet text or edit field */}
                      {bullet.isEditing ? (
                        <Textarea
                          value={bullet.editedBullet}
                          onChange={(e) => updateBulletText(bullet.id, e.target.value)}
                          className="min-h-20 text-sm"
                          autoFocus
                          onBlur={() => toggleBulletEditing(bullet.id)}
                        />
                      ) : (
                        <p 
                          className="text-sm text-foreground cursor-pointer hover:bg-muted/50 rounded px-1 -mx-1 py-0.5"
                          onClick={() => toggleBulletEditing(bullet.id)}
                          title="Click to edit"
                        >
                          • {bullet.editedBullet}
                        </p>
                      )}

                      {/* Relevance explanation */}
                      <p className="mt-2 text-xs text-muted-foreground">
                        {bullet.relevance}
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(bullet.id, bullet.editedBullet)}
                        className="h-8 w-8 p-0"
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
                        onClick={() => removeBullet(bullet.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {generatedBullets.length === 0 && (
              <div className="py-8 text-center text-muted-foreground">
                <p>All bullets have been removed.</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleStartOver}
                  className="mt-4"
                >
                  Generate New Bullets
                </Button>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-between border-t pt-6">
            <Button
              variant="ghost"
              onClick={handleStartOver}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Start Over
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isSaving || selectedCount === 0}
              className="gap-2"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save {selectedCount} Bullet{selectedCount !== 1 ? 's' : ''}
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Input state
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-xl">Generate Resume Bullets</CardTitle>
        <CardDescription>
          Enter the job description and your resume to generate tailored bullet points
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Optional context fields */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="company_name">Company Name (optional)</Label>
            <Input
              id="company_name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g., Google, Stripe, Vercel"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="job_title">Job Title (optional)</Label>
            <Input
              id="job_title"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g., Senior Software Engineer"
            />
          </div>
        </div>

        {/* Job Description */}
        <div className="space-y-2">
          <Label htmlFor="job_description">
            Job Description <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="job_description"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the full job description here..."
            className="min-h-48"
          />
          <p className="text-xs text-muted-foreground">
            Include the complete job posting for best results
          </p>
        </div>

        {/* Resume Input Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>
              Your Resume <span className="text-destructive">*</span>
            </Label>
            
            {/* Input method toggle */}
            <div className="flex rounded-lg border border-border bg-muted/50 p-0.5">
              <button
                type="button"
                onClick={() => setResumeInputMethod('text')}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  resumeInputMethod === 'text'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Type className="h-3.5 w-3.5" />
                Paste Text
              </button>
              <button
                type="button"
                onClick={() => setResumeInputMethod('file')}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  resumeInputMethod === 'file'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Upload className="h-3.5 w-3.5" />
                Upload File
              </button>
            </div>
          </div>

          {resumeInputMethod === 'text' ? (
            <div className="space-y-2">
              <Textarea
                id="resume"
                value={resume}
                onChange={(e) => setResume(e.target.value)}
                placeholder="Paste your resume content here (plain text)..."
                className="min-h-48"
              />
              <p className="text-xs text-muted-foreground">
                Copy and paste your resume as plain text for the AI to analyze
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* File drop zone */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className={`relative flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
                  isExtracting
                    ? 'border-primary/50 bg-primary/5'
                    : uploadedFile
                    ? 'border-emerald-500/50 bg-emerald-500/5'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,image/png,image/jpeg,image/jpg,image/webp,image/gif"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {isExtracting ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative">
                      <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
                      <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Loader2 className="h-6 w-6 text-primary animate-spin" />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-foreground">Extracting text...</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Using AI to read your resume
                      </p>
                    </div>
                  </div>
                ) : uploadedFile ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
                      <Check className="h-6 w-6 text-emerald-500" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-foreground">{uploadedFile.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Text extracted successfully • Click to upload a different file
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 p-6">
                    <div className="flex gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                        <FileUp className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                        <Image className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-foreground">
                        Drop your resume here or click to browse
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Supports PDF files and images (PNG, JPEG, WebP)
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Max file size: 10MB
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Show extracted text preview if available */}
              {resume && uploadedFile && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm text-muted-foreground">Extracted Text Preview</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setResumeInputMethod('text')}
                      className="h-auto py-1 text-xs"
                    >
                      Edit Text
                    </Button>
                  </div>
                  <div className="max-h-32 overflow-y-auto rounded-lg border bg-muted/30 p-3">
                    <p className="whitespace-pre-wrap text-xs text-muted-foreground">
                      {resume.length > 500 ? `${resume.substring(0, 500)}...` : resume}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex justify-between border-t pt-6">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleGenerate} 
          disabled={isLoading || isExtracting}
          className="gap-2"
        >
          <Sparkles className="h-4 w-4" />
          Generate Bullet Points
        </Button>
      </CardFooter>
    </Card>
  )
}

