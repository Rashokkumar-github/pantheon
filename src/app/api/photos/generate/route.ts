import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/db/supabase-server'
import type { GenerationOptions, HeadshotStyle, BackgroundStyle, AttireStyle } from '@/types/photos'

// Build the prompt based on user options
function buildPrompt(options: GenerationOptions): string {
  const styleDescriptions: Record<HeadshotStyle, string> = {
    corporate: 'professional corporate executive portrait, formal business setting, confident and authoritative',
    startup: 'modern tech startup founder portrait, approachable and innovative, Silicon Valley style',
    creative: 'creative professional portrait, artistic and unique, dynamic and expressive',
    executive: 'C-suite executive portrait, polished and distinguished, leadership presence',
  }

  const backgroundDescriptions: Record<BackgroundStyle, string> = {
    studio: 'clean studio backdrop with soft professional lighting, neutral gray background',
    office: 'modern office environment background with soft bokeh, professional workspace',
    outdoor: 'outdoor setting with natural light, soft green bokeh background, park or garden',
    gradient: 'smooth gradient backdrop, professional studio lighting, blue to gray gradient',
    abstract: 'abstract artistic background, creative colorful bokeh, unique and modern',
  }

  const attireDescriptions: Record<AttireStyle, string> = {
    formal: 'wearing a tailored dark suit with tie, crisp white shirt, professional formal attire',
    'business-casual': 'wearing a blazer without tie, professional but relaxed, business casual attire',
    'smart-casual': 'wearing a collared shirt or polo, polished casual look, smart casual attire',
    creative: 'wearing stylish modern clothing, creative professional attire, fashion-forward',
  }

  return `Professional LinkedIn headshot portrait photo, ${styleDescriptions[options.headshotStyle]}, ${attireDescriptions[options.attire]}, ${backgroundDescriptions[options.background]}, high quality, sharp focus, professional photography, 8k, studio lighting, looking at camera, friendly confident expression, shoulders and head visible, centered composition`
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verify authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { photoId, options } = body as { photoId: string; options: GenerationOptions }

    if (!photoId) {
      return NextResponse.json({ error: 'Photo ID is required' }, { status: 400 })
    }

    if (!options) {
      return NextResponse.json({ error: 'Generation options are required' }, { status: 400 })
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
    const prompt = buildPrompt(options)

    // Check if Replicate API key is configured
    const replicateApiKey = process.env.REPLICATE_API_TOKEN
    
    if (!replicateApiKey) {
      // Fallback: Return the original image for development
      console.warn('REPLICATE_API_TOKEN not set, returning original image')
      
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
        generatedUrl: photo.original_url,
        message: 'Generation skipped - Replicate API key not configured'
      })
    }

    // Use Replicate's PhotoMaker model for identity-preserving generation
    // This model can generate professional headshots while maintaining the person's likeness
    const replicateResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${replicateApiKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'wait',
      },
      body: JSON.stringify({
        // Using PhotoMaker for identity-preserving generation
        // Alternative: tencentarc/photomaker or lucataco/photomaker
        version: 'ddfc2b08d209f9fa8c1uj1bca788cfbd1c7bfc45f8c4a37aa9e1b4db7c1ed45', // placeholder version
        input: {
          input_image: imageUrl,
          prompt: prompt,
          negative_prompt: 'blurry, bad quality, distorted, ugly, deformed, cartoon, anime, illustration, painting, drawing, text, watermark, signature, cropped, out of frame, worst quality, low quality, jpeg artifacts, duplicate, morbid, mutilated, extra fingers, mutated hands, poorly drawn hands, poorly drawn face, mutation, deformed, disfigured, gross proportions, malformed limbs, missing arms, missing legs, extra arms, extra legs, fused fingers, too many fingers, long neck',
          num_steps: 30,
          style_strength_ratio: 30,
          guidance_scale: 7.5,
          num_outputs: 1,
        },
      }),
    })

    if (!replicateResponse.ok) {
      const errorText = await replicateResponse.text()
      console.error('Replicate API error:', errorText)
      
      // For development/demo: return original image if API fails
      return NextResponse.json({ 
        generatedUrl: photo.original_url,
        message: 'Using original image - Replicate API error (check API token and model version)'
      })
    }

    const prediction = await replicateResponse.json()

    // Handle successful response
    if (prediction.output) {
      const generatedImageUrl = Array.isArray(prediction.output) 
        ? prediction.output[0] 
        : prediction.output

      // Download and store in Supabase
      try {
        const generatedImageResponse = await fetch(generatedImageUrl)
        const generatedImageBlob = await generatedImageResponse.blob()
        
        const generatedPath = photo.storage_path.replace(/(\.[^.]+)$/, `-generated-${Date.now()}$1`)
        
        const { error: uploadError } = await supabase.storage
          .from('photos')
          .upload(generatedPath, generatedImageBlob, {
            contentType: 'image/png',
            upsert: true,
          })

        if (!uploadError) {
          const { data: generatedSignedUrl } = await supabase.storage
            .from('photos')
            .createSignedUrl(generatedPath, 60 * 60 * 24 * 365) // 1 year

          const finalUrl = generatedSignedUrl?.signedUrl || generatedImageUrl

          await supabase
            .from('photos')
            .update({
              enhanced_url: finalUrl,
              is_enhanced: true,
              enhancement_service: 'replicate-photomaker',
              updated_at: new Date().toISOString(),
            })
            .eq('id', photoId)

          return NextResponse.json({ generatedUrl: finalUrl })
        }
      } catch (storageError) {
        console.error('Storage error:', storageError)
      }

      // Return Replicate URL directly if storage fails
      return NextResponse.json({ generatedUrl: generatedImageUrl })
    }

    // If we need to poll for the result
    if (prediction.status === 'starting' || prediction.status === 'processing') {
      const maxAttempts = 60 // Up to 2 minutes for generation
      let attempts = 0
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        const pollResponse = await fetch(prediction.urls.get, {
          headers: {
            'Authorization': `Bearer ${replicateApiKey}`,
          },
        })
        
        const pollResult = await pollResponse.json()
        
        if (pollResult.status === 'succeeded' && pollResult.output) {
          const generatedImageUrl = Array.isArray(pollResult.output) 
            ? pollResult.output[0] 
            : pollResult.output
          
          // Store in Supabase
          try {
            const generatedImageResponse = await fetch(generatedImageUrl)
            const generatedImageBlob = await generatedImageResponse.blob()
            
            const generatedPath = photo.storage_path.replace(/(\.[^.]+)$/, `-generated-${Date.now()}$1`)
            
            await supabase.storage
              .from('photos')
              .upload(generatedPath, generatedImageBlob, {
                contentType: 'image/png',
                upsert: true,
              })

            const { data: generatedSignedUrl } = await supabase.storage
              .from('photos')
              .createSignedUrl(generatedPath, 60 * 60 * 24 * 365)

            const finalUrl = generatedSignedUrl?.signedUrl || generatedImageUrl

            await supabase
              .from('photos')
              .update({
                enhanced_url: finalUrl,
                is_enhanced: true,
                enhancement_service: 'replicate-photomaker',
                updated_at: new Date().toISOString(),
              })
              .eq('id', photoId)

            return NextResponse.json({ generatedUrl: finalUrl })
          } catch {
            return NextResponse.json({ generatedUrl: generatedImageUrl })
          }
        }
        
        if (pollResult.status === 'failed') {
          console.error('Generation failed:', pollResult.error)
          return NextResponse.json({ 
            generatedUrl: photo.original_url,
            message: 'Generation failed, using original image'
          })
        }
        
        attempts++
      }
      
      return NextResponse.json({ 
        error: 'Generation timed out' 
      }, { status: 504 })
    }

    // Fallback: return original image
    return NextResponse.json({ 
      generatedUrl: photo.original_url,
      message: 'Using original image as fallback'
    })

  } catch (error) {
    console.error('Generation error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 })
  }
}

