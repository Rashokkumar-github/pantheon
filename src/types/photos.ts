// Photo status enum
export type PhotoStatus = 'uploading' | 'uploaded' | 'enhancing' | 'enhanced' | 'generating' | 'generated' | 'failed'
export type PhotoType = 'enhanced' | 'generated'

export interface Photo {
  id: string
  user_id: string
  job_id: string | null
  original_url: string
  enhanced_url: string | null
  storage_path: string
  file_name: string
  file_size: number | null
  mime_type: string | null
  is_enhanced: boolean
  enhancement_service: string | null
  created_at: string
  updated_at: string
}

export interface PhotoUploadData {
  file: File
  job_id?: string
}

export interface EnhancementOptions {
  style: 'professional' | 'natural' | 'creative'
  background?: 'blur' | 'solid' | 'gradient' | 'office'
}

export const ENHANCEMENT_STYLES = [
  { 
    value: 'professional' as const, 
    label: 'Professional', 
    description: 'Clean, polished look perfect for LinkedIn' 
  },
  { 
    value: 'natural' as const, 
    label: 'Natural', 
    description: 'Subtle enhancements that look authentic' 
  },
  { 
    value: 'creative' as const, 
    label: 'Creative', 
    description: 'More dramatic, artistic enhancements' 
  },
]

export const BACKGROUND_OPTIONS = [
  { value: 'blur' as const, label: 'Blurred', description: 'Softly blur the background' },
  { value: 'solid' as const, label: 'Solid Color', description: 'Clean solid background' },
  { value: 'gradient' as const, label: 'Gradient', description: 'Smooth gradient effect' },
  { value: 'office' as const, label: 'Office', description: 'Professional office setting' },
]

// ============ HEADSHOT GENERATION TYPES ============

export type HeadshotStyle = 'corporate' | 'startup' | 'creative' | 'executive'
export type BackgroundStyle = 'office' | 'studio' | 'outdoor' | 'gradient' | 'abstract'
export type AttireStyle = 'formal' | 'business-casual' | 'smart-casual' | 'creative'

export interface GenerationOptions {
  headshotStyle: HeadshotStyle
  background: BackgroundStyle
  attire: AttireStyle
}

export const HEADSHOT_STYLES: { value: HeadshotStyle; label: string; description: string; icon: string }[] = [
  { 
    value: 'corporate', 
    label: 'Corporate', 
    description: 'Traditional professional look for banking, law, consulting',
    icon: '🏢'
  },
  { 
    value: 'startup', 
    label: 'Startup', 
    description: 'Modern, approachable look for tech companies',
    icon: '🚀'
  },
  { 
    value: 'creative', 
    label: 'Creative', 
    description: 'Artistic and unique for creative industries',
    icon: '🎨'
  },
  { 
    value: 'executive', 
    label: 'Executive', 
    description: 'Polished C-suite ready headshot',
    icon: '👔'
  },
]

export const BACKGROUND_STYLES: { value: BackgroundStyle; label: string; description: string; color: string }[] = [
  { 
    value: 'studio', 
    label: 'Studio', 
    description: 'Clean studio backdrop with soft lighting',
    color: 'bg-neutral-200'
  },
  { 
    value: 'office', 
    label: 'Modern Office', 
    description: 'Professional office environment',
    color: 'bg-slate-300'
  },
  { 
    value: 'outdoor', 
    label: 'Outdoor', 
    description: 'Natural outdoor setting with soft bokeh',
    color: 'bg-emerald-200'
  },
  { 
    value: 'gradient', 
    label: 'Gradient', 
    description: 'Smooth professional gradient backdrop',
    color: 'bg-gradient-to-br from-blue-200 to-indigo-300'
  },
  { 
    value: 'abstract', 
    label: 'Abstract', 
    description: 'Creative abstract background',
    color: 'bg-gradient-to-br from-purple-200 to-pink-200'
  },
]

export const ATTIRE_STYLES: { value: AttireStyle; label: string; description: string; icon: string }[] = [
  { 
    value: 'formal', 
    label: 'Formal', 
    description: 'Suit and tie, professional attire',
    icon: '👔'
  },
  { 
    value: 'business-casual', 
    label: 'Business Casual', 
    description: 'Blazer with no tie, professional but relaxed',
    icon: '🧥'
  },
  { 
    value: 'smart-casual', 
    label: 'Smart Casual', 
    description: 'Polished casual look, collared shirt',
    icon: '👕'
  },
  { 
    value: 'creative', 
    label: 'Creative', 
    description: 'Stylish and modern for creative fields',
    icon: '🎽'
  },
]

