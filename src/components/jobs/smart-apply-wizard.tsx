'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createJob } from '@/lib/api/jobs'
import { createCoverLetter } from '@/lib/api/cover-letters'
import { createResumeBullets } from '@/lib/api/resume-bullets'
import type { GeneratedBullet } from '@/types/resume-bullets'
import { 
  Loader2, 
  Sparkles, 
  Check, 
  ArrowLeft, 
  ArrowRight,
  Save, 
  Upload, 
  FileUp, 
  Image, 
  Type,
  Copy,
  FileText,
  ListChecks,
  Briefcase,
  Building2,
  MapPin,
  DollarSign,
  Link as LinkIcon,
  Trash2
} from 'lucide-react'

type Step = 'job-details' | 'resume-input' | 'generating' | 'results'
type ResumeInputMethod = 'text' | 'file'

interface SelectedBullet extends GeneratedBullet {
  id: string
  isSelected: boolean
  editedBullet: string
}

export function SmartApplyWizard() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Step state
  const [step, setStep] = useState<Step>('job-details')
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Copy states
  const [copiedCoverLetter, setCopiedCoverLetter] = useState(false)
  const [copiedBullets, setCopiedBullets] = useState(false)
  const [copiedBulletId, setCopiedBulletId] = useState<string | null>(null)

  // Resume input state
  const [resumeInputMethod, setResumeInputMethod] = useState<ResumeInputMethod>('text')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  // Job details state
  const [companyName, setCompanyName] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [location, setLocation] = useState('')
  const [salaryRange, setSalaryRange] = useState('')
  const [applicationUrl, setApplicationUrl] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [notes, setNotes] = useState('')
  const [resume, setResume] = useState('')

  // Generated results state
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState('')
  const [coverLetterTitle, setCoverLetterTitle] = useState('')
  const [generatedBullets, setGeneratedBullets] = useState<SelectedBullet[]>([])

  // Results tab state
  const [activeTab, setActiveTab] = useState<'cover-letter' | 'bullets'>('cover-letter')

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      setError('Please upload a PDF or image file (PNG, JPEG, WebP, or GIF)')
      return
    }

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
      setResumeInputMethod('text')
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

  const validateJobDetails = () => {
    if (!companyName.trim()) {
      setError('Company name is required')
      return false
    }
    if (!jobTitle.trim()) {
      setError('Job title is required')
      return false
    }
    setError(null)
    return true
  }

  const validateResumeInput = () => {
    if (!jobDescription.trim()) {
      setError('Job description is required')
      return false
    }
    if (!resume.trim()) {
      setError('Resume is required')
      return false
    }
    setError(null)
    return true
  }

  const handleGenerate = async () => {
    if (!validateResumeInput()) return

    setIsLoading(true)
    setStep('generating')
    setError(null)

    try {
      const response = await fetch('/api/jobs/smart-apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobDescription,
          resume,
          companyName,
          jobTitle,
          location,
          salaryRange,
          applicationUrl,
          notes,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate application materials')
      }

      setGeneratedCoverLetter(data.coverLetter)
      setCoverLetterTitle(data.coverLetterTitle)
      
      const selectableBullets: SelectedBullet[] = data.bullets.map((bullet: GeneratedBullet, index: number) => ({
        ...bullet,
        id: `bullet-${index}`,
        isSelected: true,
        editedBullet: bullet.bullet,
      }))
      setGeneratedBullets(selectableBullets)
      
      setStep('results')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate')
      setStep('resume-input')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleBulletSelection = (id: string) => {
    setGeneratedBullets(bullets =>
      bullets.map(b => b.id === id ? { ...b, isSelected: !b.isSelected } : b)
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

  const handleCopyCoverLetter = async () => {
    try {
      await navigator.clipboard.writeText(generatedCoverLetter)
      setCopiedCoverLetter(true)
      setTimeout(() => setCopiedCoverLetter(false), 2000)
    } catch {
      setError('Failed to copy to clipboard')
    }
  }

  const handleCopyBullets = async () => {
    const selectedBullets = generatedBullets
      .filter(b => b.isSelected)
      .map(b => `• ${b.editedBullet}`)
      .join('\n')
    
    try {
      await navigator.clipboard.writeText(selectedBullets)
      setCopiedBullets(true)
      setTimeout(() => setCopiedBullets(false), 2000)
    } catch {
      setError('Failed to copy to clipboard')
    }
  }

  const handleCopyBullet = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedBulletId(id)
      setTimeout(() => setCopiedBulletId(null), 2000)
    } catch {
      setError('Failed to copy to clipboard')
    }
  }

  const handleSaveAll = async () => {
    setIsSaving(true)
    setError(null)

    try {
      // 1. Create the job application
      const job = await createJob({
        company_name: companyName,
        job_title: jobTitle,
        job_description: jobDescription,
        location: location || undefined,
        salary_range: salaryRange || undefined,
        application_url: applicationUrl || undefined,
        notes: notes || undefined,
        status: 'applied',
        applied_at: new Date().toISOString().split('T')[0],
      })

      // 2. Create the cover letter linked to job
      await createCoverLetter({
        title: coverLetterTitle,
        content: generatedCoverLetter,
        job_id: job.id,
        job_description: jobDescription,
        is_generated: true,
        ai_service: 'anthropic-claude',
      })

      // 3. Create selected resume bullets linked to job
      const selectedBullets = generatedBullets.filter(b => b.isSelected)
      if (selectedBullets.length > 0) {
        await createResumeBullets(
          selectedBullets.map(b => ({
            bullet_text: b.editedBullet,
            job_id: job.id,
            job_description: jobDescription,
            is_generated: true,
            ai_service: 'anthropic-claude',
          }))
        )
      }

      router.push('/dashboard/jobs')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setIsSaving(false)
    }
  }

  const selectedBulletCount = generatedBullets.filter(b => b.isSelected).length

  // Progress indicator
  const steps = [
    { id: 'job-details', label: 'Job Details', icon: Briefcase },
    { id: 'resume-input', label: 'Resume', icon: FileText },
    { id: 'generating', label: 'Generate', icon: Sparkles },
    { id: 'results', label: 'Results', icon: Check },
  ]

  const currentStepIndex = steps.findIndex(s => s.id === step)

  // Render progress bar
  const renderProgress = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((s, index) => {
          const Icon = s.icon
          const isCompleted = index < currentStepIndex
          const isCurrent = s.id === step
          const isGenerating = s.id === 'generating' && step === 'generating'
          
          return (
            <div key={s.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                    isCompleted
                      ? 'border-primary bg-primary text-primary-foreground'
                      : isCurrent
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-muted-foreground/30 text-muted-foreground'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : isGenerating ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                <span className={`mt-2 text-xs font-medium ${
                  isCurrent ? 'text-primary' : 'text-muted-foreground'
                }`}>
                  {s.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`mx-2 h-0.5 w-12 sm:w-20 ${
                    index < currentStepIndex ? 'bg-primary' : 'bg-muted-foreground/30'
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )

  // Step 1: Job Details
  if (step === 'job-details') {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-xl">Smart Apply</CardTitle>
          <CardDescription>
            Generate a cover letter and resume bullets in one go
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {renderProgress()}

          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="company_name" className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                Company Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="company_name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g., Google, Stripe, Vercel"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="job_title" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                Job Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="job_title"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g., Senior Software Engineer"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                Location
              </Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Remote, San Francisco, CA"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="salary_range" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                Salary Range
              </Label>
              <Input
                id="salary_range"
                value={salaryRange}
                onChange={(e) => setSalaryRange(e.target.value)}
                placeholder="e.g., $150k - $180k"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="application_url" className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4 text-muted-foreground" />
              Application URL
            </Label>
            <Input
              id="application_url"
              type="url"
              value={applicationUrl}
              onChange={(e) => setApplicationUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any notes about this application..."
              className="min-h-20"
            />
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
            onClick={() => {
              if (validateJobDetails()) setStep('resume-input')
            }}
            className="gap-2"
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    )
  }

  // Step 2: Resume Input
  if (step === 'resume-input') {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-xl">Job Description & Resume</CardTitle>
          <CardDescription>
            Provide the job posting and your resume for AI analysis
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {renderProgress()}

          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

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
                          Text extracted • Click to upload different file
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
                      </div>
                    </div>
                  )}
                </div>

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
            onClick={() => setStep('job-details')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Button 
            onClick={handleGenerate} 
            disabled={isLoading || isExtracting}
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Generate Materials
          </Button>
        </CardFooter>
      </Card>
    )
  }

  // Step 3: Generating
  if (step === 'generating') {
    return (
      <Card className="border-border/50">
        <CardContent className="py-16">
          {renderProgress()}
          
          <div className="flex flex-col items-center justify-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Sparkles className="h-8 w-8 text-primary animate-pulse" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              Generating your application materials...
            </h3>
            <p className="mt-2 text-muted-foreground text-center max-w-md">
              AI is crafting a personalized cover letter and tailored resume bullets for {jobTitle} at {companyName}
            </p>
            <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              This may take a moment
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Step 4: Results
  return (
    <div className="space-y-6">
      <Card className="border-border/50">
        <CardHeader>
          {renderProgress()}
          
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">
                {jobTitle} at {companyName}
              </CardTitle>
              <CardDescription className="mt-1">
                Review and edit your generated materials before saving
              </CardDescription>
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Tab navigation */}
          <div className="flex gap-1 border-b mt-4">
            <button
              type="button"
              onClick={() => setActiveTab('cover-letter')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === 'cover-letter'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <FileText className="h-4 w-4" />
              Cover Letter
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('bullets')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === 'bullets'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <ListChecks className="h-4 w-4" />
              Resume Bullets
              <Badge variant="secondary" className="ml-1">
                {selectedBulletCount}
              </Badge>
            </button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Cover Letter Tab */}
          {activeTab === 'cover-letter' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="cover-letter-content">Cover Letter</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyCoverLetter}
                  className="gap-2"
                >
                  {copiedCoverLetter ? (
                    <Check className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  {copiedCoverLetter ? 'Copied!' : 'Copy'}
                </Button>
              </div>
              <Textarea
                id="cover-letter-content"
                value={generatedCoverLetter}
                onChange={(e) => setGeneratedCoverLetter(e.target.value)}
                className="min-h-[400px] font-mono text-sm leading-relaxed"
              />
            </div>
          )}

          {/* Resume Bullets Tab */}
          {activeTab === 'bullets' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {selectedBulletCount} of {generatedBullets.length} bullets selected
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyBullets}
                  disabled={selectedBulletCount === 0}
                  className="gap-2"
                >
                  {copiedBullets ? (
                    <Check className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  {copiedBullets ? 'Copied!' : 'Copy Selected'}
                </Button>
              </div>

              <div className="space-y-3">
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
                        <div className="mb-2">
                          <Badge variant="secondary" className="text-xs">
                            {bullet.category}
                          </Badge>
                        </div>

                        <Textarea
                          value={bullet.editedBullet}
                          onChange={(e) => updateBulletText(bullet.id, e.target.value)}
                          className="min-h-16 text-sm resize-none"
                        />

                        <p className="mt-2 text-xs text-muted-foreground">
                          {bullet.relevance}
                        </p>
                      </div>

                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyBullet(bullet.id, bullet.editedBullet)}
                          className="h-8 w-8 p-0"
                        >
                          {copiedBulletId === bullet.id ? (
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
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between border-t pt-6">
          <Button
            variant="ghost"
            onClick={() => setStep('resume-input')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Button 
            onClick={handleSaveAll} 
            disabled={isSaving}
            className="gap-2"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Application & Materials
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

