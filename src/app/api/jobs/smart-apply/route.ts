import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/db/supabase-server'
import Anthropic from '@anthropic-ai/sdk'
import type { GeneratedBullet } from '@/types/resume-bullets'

interface SmartApplyRequest {
  jobDescription: string
  resume: string
  companyName: string
  jobTitle: string
  location?: string
  salaryRange?: string
  applicationUrl?: string
  notes?: string
}

interface SmartApplyResponse {
  coverLetter: string
  coverLetterTitle: string
  bullets: GeneratedBullet[]
  bulletsTitle: string
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verify authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json() as SmartApplyRequest
    const { jobDescription, resume, companyName, jobTitle } = body

    if (!jobDescription || !jobDescription.trim()) {
      return NextResponse.json({ error: 'Job description is required' }, { status: 400 })
    }

    if (!resume || !resume.trim()) {
      return NextResponse.json({ error: 'Resume is required' }, { status: 400 })
    }

    if (!companyName || !companyName.trim()) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 })
    }

    if (!jobTitle || !jobTitle.trim()) {
      return NextResponse.json({ error: 'Job title is required' }, { status: 400 })
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

    // Generate both cover letter and resume bullets in a single API call
    const systemPrompt = `You are an expert career coach, professional cover letter writer, and resume specialist. Your task is to analyze a job description and candidate's resume, then generate BOTH a tailored cover letter AND impactful resume bullet points.

You MUST respond with valid JSON in this exact format:
{
  "coverLetter": "The full cover letter text...",
  "bullets": [
    {
      "bullet": "A resume bullet point starting with an action verb",
      "category": "Category name (e.g., Technical Skills, Leadership, Problem Solving)",
      "relevance": "Brief explanation of why this bullet is relevant"
    }
  ]
}

COVER LETTER GUIDELINES:
- Tailor specifically to the job description
- Highlight relevant experience from the resume
- Show enthusiasm for the role and company
- Use professional but engaging language
- Keep it concise (300-400 words)
- Follow clear structure: opening hook, body connecting experience to requirements, strong closing
- Avoid generic phrases and clichés
- Do not include placeholders like [Your Name]

RESUME BULLETS GUIDELINES:
- Generate 8-12 bullet points
- Use the STAR method implicitly
- Start with strong action verbs
- Include quantifiable achievements when possible
- Directly relevant to job requirements
- Highlight transferable skills
- Concise but impactful (1-2 lines each)
- Avoid generic phrases`

    const userPrompt = `Generate a tailored cover letter AND resume bullet points for this job application:

Company: ${companyName}
Position: ${jobTitle}

JOB DESCRIPTION:
${jobDescription}

CANDIDATE'S RESUME:
${resume}

Generate both materials that work together to present a compelling application. The cover letter should tell a story while the resume bullets provide concrete evidence of qualifications.

Respond with valid JSON only.`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      system: systemPrompt,
    })

    // Extract the text content from the response
    const responseText = message.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map(block => block.text)
      .join('\n')

    // Parse the JSON response
    let parsedResponse: { coverLetter: string; bullets: GeneratedBullet[] }
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in response')
      }
      parsedResponse = JSON.parse(jsonMatch[0])
    } catch (parseError) {
      console.error('Failed to parse AI response:', responseText)
      return NextResponse.json({ 
        error: 'Failed to parse AI response. Please try again.' 
      }, { status: 500 })
    }

    // Generate titles
    const coverLetterTitle = `${jobTitle} at ${companyName}`
    const bulletsTitle = `Bullets for ${jobTitle} at ${companyName}`

    const response: SmartApplyResponse = {
      coverLetter: parsedResponse.coverLetter,
      coverLetterTitle,
      bullets: parsedResponse.bullets,
      bulletsTitle,
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Smart apply generation error:', error)
    
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

