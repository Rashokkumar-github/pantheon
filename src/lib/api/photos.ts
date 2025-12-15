import { createClient } from '@/lib/db/supabase-client'
import type { Photo } from '@/types/photos'

// Client-side API functions for photos

export async function getPhotos(): Promise<Photo[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data || []
}

export async function getPhoto(id: string): Promise<Photo | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    throw new Error(error.message)
  }
  return data
}

export async function uploadPhoto(file: File): Promise<Photo> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Not authenticated')

  // Generate unique file path
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
  const storagePath = `${user.id}/${fileName}`

  // Upload to storage
  const { error: uploadError } = await supabase.storage
    .from('photos')
    .upload(storagePath, file, {
      contentType: file.type,
      upsert: false,
    })

  if (uploadError) throw new Error(uploadError.message)

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('photos')
    .getPublicUrl(storagePath)

  // For private buckets, we need to create a signed URL
  const { data: signedData } = await supabase.storage
    .from('photos')
    .createSignedUrl(storagePath, 60 * 60 * 24 * 365) // 1 year

  const originalUrl = signedData?.signedUrl || urlData.publicUrl

  // Create database record
  const { data, error } = await supabase
    .from('photos')
    .insert({
      user_id: user.id,
      original_url: originalUrl,
      storage_path: storagePath,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type,
      is_enhanced: false,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function deletePhoto(id: string): Promise<void> {
  const supabase = createClient()
  
  // Get the photo first to get storage path
  const photo = await getPhoto(id)
  if (!photo) throw new Error('Photo not found')

  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from('photos')
    .remove([photo.storage_path])

  if (storageError) throw new Error(storageError.message)

  // Delete enhanced version if exists
  if (photo.enhanced_url) {
    const enhancedPath = photo.storage_path.replace(/(\.[^.]+)$/, '-enhanced$1')
    await supabase.storage.from('photos').remove([enhancedPath])
  }

  // Delete database record
  const { error } = await supabase
    .from('photos')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
}

export async function updatePhotoWithEnhancement(
  id: string, 
  enhancedUrl: string,
  enhancementService: string
): Promise<Photo> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('photos')
    .update({
      enhanced_url: enhancedUrl,
      is_enhanced: true,
      enhancement_service: enhancementService,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function getSignedUrl(storagePath: string): Promise<string> {
  const supabase = createClient()
  
  const { data, error } = await supabase.storage
    .from('photos')
    .createSignedUrl(storagePath, 60 * 60) // 1 hour
  
  if (error) throw new Error(error.message)
  return data.signedUrl
}

