import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/db/supabase-server'
import Anthropic from '@anthropic-ai/sdk'
import type { GenerateCoverLetterRequest } from '@/types/cover-letters'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verify authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json() as GenerateCoverLetterRequest
    const { jobDescription, resume, companyName, jobTitle } = body

    if (!jobDescription || !jobDescription.trim()) {
      return NextResponse.json({ error: 'Job description is required' }, { status: 400 })
    }

    if (!resume || !resume.trim()) {
      return NextResponse.json({ error: 'Resume is required' }, { status: 400 })
    }

    // Check if Anthropic API key is configured
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY
    
    if (!anthropicApiKey) {
      return NextResponse.json({ 
        error: 'ANTHROPIC_API_KEY not configured. Please add it to your environment variables.' 
      }, { status: 500 })
    }

    const client = new Anthropic({
      apiKey: anthropicApiKey,
    })

    const systemPrompt = `You are an expert career coach and professional cover letter writer. Your task is to create compelling, personalized cover letters that:

1. Are tailored specifically to the job description provided
2. Highlight relevant experience and skills from the candidate's resume
3. Show genuine enthusiasm for the role and company
4. Use professional but engaging language
5. Are concise (approximately 300-400 words)
6. Follow a clear structure: opening hook, body paragraphs connecting experience to requirements, and a strong closing
7. Avoid generic phrases and clichés
8. Demonstrate understanding of the company's needs

Format the cover letter professionally with proper salutations and closings. Do not include placeholders like [Your Name] - write as if the letter is ready to send.`

    const userPrompt = `Please write a professional cover letter for the following position:

${companyName ? `Company: ${companyName}` : ''}
${jobTitle ? `Position: ${jobTitle}` : ''}

JOB DESCRIPTION:
${jobDescription}

CANDIDATE'S RESUME:
${resume}

Write a compelling cover letter that connects my experience to this specific role. Make it personal, engaging, and tailored to this opportunity.`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      system: systemPrompt,
    })

    // Extract the text content from the response
    const coverLetterContent = message.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map(block => block.text)
      .join('\n')

    // Generate a title for the cover letter
    const title = companyName && jobTitle 
      ? `${jobTitle} at ${companyName}`
      : companyName 
        ? `Cover Letter for ${companyName}`
        : jobTitle 
          ? `Cover Letter for ${jobTitle}`
          : `Cover Letter - ${new Date().toLocaleDateString()}`

    return NextResponse.json({ 
      coverLetter: coverLetterContent,
      title: title,
    })

  } catch (error) {
    console.error('Cover letter generation error:', error)
    
    if (error instanceof Anthropic.APIError) {
      return NextResponse.json({ 
        error: `AI service error: ${error.message}` 
      }, { status: error.status || 500 })
    }
    
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 })
  }
}

