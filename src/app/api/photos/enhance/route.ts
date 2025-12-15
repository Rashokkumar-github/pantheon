import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/db/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verify authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { photoId } = body

    if (!photoId) {
      return NextResponse.json({ error: 'Photo ID is required' }, { status: 400 })
    }

    // Get photo from database
    const { data: photo, error: photoError } = await supabase
      .from('photos')
      .select('*')
      .eq('id', photoId)
      .eq('user_id', user.id)
      .single()

    if (photoError || !photo) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 })
    }

    // Get a fresh signed URL for the original image
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('photos')
      .createSignedUrl(photo.storage_path, 60 * 60) // 1 hour

    if (signedUrlError || !signedUrlData) {
      return NextResponse.json({ error: 'Failed to get image URL' }, { status: 500 })
    }

    const imageUrl = signedUrlData.signedUrl

    // Check if Replicate API key is configured
    const replicateApiKey = process.env.REPLICATE_API_TOKEN
    
    if (!replicateApiKey) {
      // Fallback: Return the original image as "enhanced" for development
      // In production, you'd want to throw an error here
      console.warn('REPLICATE_API_TOKEN not set, returning original image')
      
      // Update photo as enhanced with original URL
      await supabase
        .from('photos')
        .update({
          enhanced_url: photo.original_url,
          is_enhanced: true,
          enhancement_service: 'none (development)',
          updated_at: new Date().toISOString(),
        })
        .eq('id', photoId)

      return NextResponse.json({ 
        enhancedUrl: photo.original_url,
        message: 'Enhancement skipped - Replicate API key not configured'
      })
    }

    // Call Replicate API for face enhancement
    // Using CodeFormer model which is great for face restoration/enhancement
    const replicateResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${replicateApiKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'wait', // Wait for the result synchronously (up to 60s)
      },
      body: JSON.stringify({
        // CodeFormer model for face restoration
        version: '7de2ea26c616d5bf2245ad0d5e24f0ff9a6204578a5c876db53142edd9d2cd56',
        input: {
          image: imageUrl,
          codeformer_fidelity: 0.7, // Balance between quality and fidelity to original
          background_enhance: true,
          face_upsample: true,
          upscale: 2,
        },
      }),
    })

    if (!replicateResponse.ok) {
      const errorText = await replicateResponse.text()
      console.error('Replicate API error:', errorText)
      return NextResponse.json({ 
        error: 'Enhancement service error' 
      }, { status: 500 })
    }

    const prediction = await replicateResponse.json()

    // If we got a result directly (with Prefer: wait header)
    if (prediction.output) {
      const enhancedImageUrl = prediction.output

      // Download the enhanced image and upload to Supabase storage
      const enhancedImageResponse = await fetch(enhancedImageUrl)
      const enhancedImageBlob = await enhancedImageResponse.blob()
      
      const enhancedPath = photo.storage_path.replace(/(\.[^.]+)$/, '-enhanced$1')
      
      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(enhancedPath, enhancedImageBlob, {
          contentType: 'image/png',
          upsert: true,
        })

      if (uploadError) {
        console.error('Failed to upload enhanced image:', uploadError)
        // Still return the Replicate URL as fallback
        return NextResponse.json({ enhancedUrl: enhancedImageUrl })
      }

      // Get signed URL for the enhanced image
      const { data: enhancedSignedUrl } = await supabase.storage
        .from('photos')
        .createSignedUrl(enhancedPath, 60 * 60 * 24 * 365) // 1 year

      const finalEnhancedUrl = enhancedSignedUrl?.signedUrl || enhancedImageUrl

      // Update photo record
      await supabase
        .from('photos')
        .update({
          enhanced_url: finalEnhancedUrl,
          is_enhanced: true,
          enhancement_service: 'replicate-codeformer',
          updated_at: new Date().toISOString(),
        })
        .eq('id', photoId)

      return NextResponse.json({ enhancedUrl: finalEnhancedUrl })
    }

    // If we need to poll for the result
    if (prediction.status === 'starting' || prediction.status === 'processing') {
      // Poll for completion
      const maxAttempts = 30
      let attempts = 0
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 2000)) // Wait 2 seconds
        
        const pollResponse = await fetch(prediction.urls.get, {
          headers: {
            'Authorization': `Bearer ${replicateApiKey}`,
          },
        })
        
        const pollResult = await pollResponse.json()
        
        if (pollResult.status === 'succeeded' && pollResult.output) {
          const enhancedImageUrl = pollResult.output
          
          // Download and store in Supabase
          const enhancedImageResponse = await fetch(enhancedImageUrl)
          const enhancedImageBlob = await enhancedImageResponse.blob()
          
          const enhancedPath = photo.storage_path.replace(/(\.[^.]+)$/, '-enhanced$1')
          
          await supabase.storage
            .from('photos')
            .upload(enhancedPath, enhancedImageBlob, {
              contentType: 'image/png',
              upsert: true,
            })

          const { data: enhancedSignedUrl } = await supabase.storage
            .from('photos')
            .createSignedUrl(enhancedPath, 60 * 60 * 24 * 365)

          const finalEnhancedUrl = enhancedSignedUrl?.signedUrl || enhancedImageUrl

          await supabase
            .from('photos')
            .update({
              enhanced_url: finalEnhancedUrl,
              is_enhanced: true,
              enhancement_service: 'replicate-codeformer',
              updated_at: new Date().toISOString(),
            })
            .eq('id', photoId)

          return NextResponse.json({ enhancedUrl: finalEnhancedUrl })
        }
        
        if (pollResult.status === 'failed') {
          return NextResponse.json({ 
            error: 'Enhancement failed: ' + (pollResult.error || 'Unknown error')
          }, { status: 500 })
        }
        
        attempts++
      }
      
      return NextResponse.json({ 
        error: 'Enhancement timed out' 
      }, { status: 504 })
    }

    return NextResponse.json({ 
      error: 'Unexpected enhancement status' 
    }, { status: 500 })

  } catch (error) {
    console.error('Enhancement error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 })
  }
}

