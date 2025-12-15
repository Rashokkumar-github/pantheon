import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/db/supabase-server'
import Anthropic from '@anthropic-ai/sdk'
import pdf from 'pdf-parse/lib/pdf-parse'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verify authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const fileType = file.type
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Handle PDF files
    if (fileType === 'application/pdf') {
      try {
        const pdfData = await pdf(buffer)
        const extractedText = pdfData.text.trim()
        
        if (!extractedText) {
          return NextResponse.json({ 
            error: 'Could not extract text from PDF. The PDF may be image-based. Try uploading a screenshot instead.' 
          }, { status: 400 })
        }

        return NextResponse.json({ 
          text: extractedText,
          source: 'pdf'
        })
      } catch (pdfError) {
        console.error('PDF parsing error:', pdfError)
        return NextResponse.json({ 
          error: 'Failed to parse PDF. Please try pasting the text manually or uploading an image.' 
        }, { status: 400 })
      }
    }

    // Handle image files (PNG, JPEG, WebP, GIF)
    if (fileType.startsWith('image/')) {
      const anthropicApiKey = process.env.ANTHROPIC_API_KEY
      
      if (!anthropicApiKey) {
        return NextResponse.json({ 
          error: 'ANTHROPIC_API_KEY not configured for image processing.' 
        }, { status: 500 })
      }

      const client = new Anthropic({
        apiKey: anthropicApiKey,
      })

      // Convert image to base64
      const base64Image = buffer.toString('base64')
      
      // Map file type to Anthropic's expected media type
      let mediaType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'
      if (fileType === 'image/jpeg' || fileType === 'image/jpg') {
        mediaType = 'image/jpeg'
      } else if (fileType === 'image/png') {
        mediaType = 'image/png'
      } else if (fileType === 'image/gif') {
        mediaType = 'image/gif'
      } else if (fileType === 'image/webp') {
        mediaType = 'image/webp'
      } else {
        return NextResponse.json({ 
          error: 'Unsupported image format. Please use PNG, JPEG, WebP, or GIF.' 
        }, { status: 400 })
      }

      try {
        const message = await client.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4000,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'image',
                  source: {
                    type: 'base64',
                    media_type: mediaType,
                    data: base64Image,
                  },
                },
                {
                  type: 'text',
                  text: `Extract all text from this resume image. Preserve the structure and formatting as much as possible using plain text. Include all sections like contact information, experience, education, skills, etc. Return ONLY the extracted text, no additional commentary.`,
                },
              ],
            },
          ],
        })

        const extractedText = message.content
          .filter((block): block is Anthropic.TextBlock => block.type === 'text')
          .map(block => block.text)
          .join('\n')

        return NextResponse.json({ 
          text: extractedText,
          source: 'image-ocr'
        })
      } catch (ocrError) {
        console.error('OCR error:', ocrError)
        return NextResponse.json({ 
          error: 'Failed to extract text from image. Please try a clearer image or paste the text manually.' 
        }, { status: 500 })
      }
    }

    return NextResponse.json({ 
      error: 'Unsupported file type. Please upload a PDF or image (PNG, JPEG, WebP, GIF).' 
    }, { status: 400 })

  } catch (error) {
    console.error('Resume extraction error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 })
  }
}

