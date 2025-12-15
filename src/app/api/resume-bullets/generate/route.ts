import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/db/supabase-server'
import Anthropic from '@anthropic-ai/sdk'
import type { GenerateResumeBulletsRequest, GeneratedBullet } from '@/types/resume-bullets'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verify authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json() as GenerateResumeBulletsRequest
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

    const systemPrompt = `You are an expert career coach and resume writer specializing in creating impactful resume bullet points. Your task is to analyze a job description and a candidate's resume, then generate powerful, tailored bullet points that:

1. Use the STAR method (Situation, Task, Action, Result) implicitly
2. Start with strong action verbs
3. Include quantifiable achievements and metrics whenever possible
4. Are directly relevant to the target job requirements
5. Highlight transferable skills that match the job description
6. Are concise but impactful (1-2 lines each)
7. Avoid generic phrases and buzzwords without substance
8. Showcase the candidate's unique value proposition

For each bullet point, also provide:
- A category (e.g., "Technical Skills", "Leadership", "Problem Solving", "Communication", "Project Management", etc.)
- A brief explanation of why this bullet is relevant to the job

You MUST respond with valid JSON only. Do not include any text before or after the JSON.

Response format:
{
  "bullets": [
    {
      "bullet": "The bullet point text starting with an action verb",
      "category": "Category name",
      "relevance": "Brief explanation of why this is relevant to the job"
    }
  ]
}`

    const userPrompt = `Analyze the following job description and resume, then generate 8-12 tailored resume bullet points that would be highly effective for this specific role.

${companyName ? `Company: ${companyName}` : ''}
${jobTitle ? `Target Position: ${jobTitle}` : ''}

JOB DESCRIPTION:
${jobDescription}

CANDIDATE'S RESUME:
${resume}

Generate bullet points that bridge the gap between the candidate's experience and the job requirements. Focus on achievements and skills that directly address what this employer is looking for.

Respond with valid JSON only.`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 3000,
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
    let parsedResponse: { bullets: GeneratedBullet[] }
    try {
      // Try to extract JSON from the response (in case there's any extra text)
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

    // Generate a title for this bullet set
    const title = companyName && jobTitle 
      ? `${jobTitle} at ${companyName}`
      : companyName 
        ? `Bullets for ${companyName}`
        : jobTitle 
          ? `Bullets for ${jobTitle}`
          : `Resume Bullets - ${new Date().toLocaleDateString()}`

    return NextResponse.json({ 
      bullets: parsedResponse.bullets,
      title: title,
    })

  } catch (error) {
    console.error('Resume bullet generation error:', error)
    
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

