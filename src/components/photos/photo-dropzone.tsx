'use client'

import { useState, useCallback, useRef } from 'react'
import { Upload, Image as ImageIcon, X, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PhotoDropzoneProps {
  onFileSelect: (file: File) => void
  disabled?: boolean
  className?: string
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export function PhotoDropzone({ onFileSelect, disabled, className }: PhotoDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const validateFile = useCallback((file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Please upload a JPEG, PNG, or WebP image'
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File size must be less than 10MB'
    }
    return null
  }, [])

  const handleFile = useCallback((file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)
    setSelectedFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    onFileSelect(file)
  }, [onFileSelect, validateFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) {
      setIsDragging(true)
    }
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (disabled) return

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFile(files[0])
    }
  }, [disabled, handleFile])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFile(files[0])
    }
  }, [handleFile])

  const handleClick = useCallback(() => {
    if (!disabled) {
      inputRef.current?.click()
    }
  }, [disabled])

  const handleClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setPreview(null)
    setSelectedFile(null)
    setError(null)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }, [])

  return (
    <div className={cn('w-full', className)}>
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden',
          'min-h-[320px]',
          isDragging && 'border-primary bg-primary/5 scale-[1.02]',
          !isDragging && !preview && 'border-border hover:border-primary/50 hover:bg-muted/30',
          preview && 'border-primary/30 bg-muted/10',
          disabled && 'opacity-50 cursor-not-allowed',
          error && 'border-destructive/50'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          onChange={handleInputChange}
          disabled={disabled}
          className="hidden"
        />

        {preview ? (
          <div className="relative w-full h-full min-h-[320px] flex items-center justify-center p-6">
            {/* Background blur effect */}
            <div 
              className="absolute inset-0 bg-cover bg-center blur-xl opacity-30"
              style={{ backgroundImage: `url(${preview})` }}
            />
            
            {/* Main preview */}
            <div className="relative z-10 flex flex-col items-center gap-4">
              <div className="relative group">
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-64 max-w-full rounded-xl shadow-2xl object-contain ring-4 ring-background/50"
                />
                <button
                  onClick={handleClear}
                  disabled={disabled}
                  className="absolute -top-3 -right-3 p-2 rounded-full bg-destructive text-white shadow-lg hover:bg-destructive/90 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              {selectedFile && (
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground truncate max-w-[200px]">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            {/* Animated upload icon */}
            <div className={cn(
              'relative mb-6 transition-transform duration-300',
              isDragging && 'scale-110'
            )}>
              <div className={cn(
                'absolute inset-0 rounded-full bg-primary/20 blur-xl transition-opacity',
                isDragging ? 'opacity-100' : 'opacity-0'
              )} />
              <div className={cn(
                'relative flex h-20 w-20 items-center justify-center rounded-full transition-all duration-300',
                isDragging ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              )}>
                {isDragging ? (
                  <Upload className="h-10 w-10 animate-bounce" />
                ) : (
                  <ImageIcon className="h-10 w-10" />
                )}
              </div>
            </div>

            <h3 className="text-lg font-semibold text-foreground mb-2">
              {isDragging ? 'Drop your photo here' : 'Upload your selfie'}
            </h3>
            
            <p className="text-sm text-muted-foreground mb-4 max-w-[280px]">
              Drag and drop a clear photo of yourself, or click to browse
            </p>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-primary/60" />
                JPEG, PNG, WebP
              </span>
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-primary/60" />
                Max 10MB
              </span>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 mt-3 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}

