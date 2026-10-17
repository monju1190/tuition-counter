import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { getSession } from '@/actions/auth'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Gemini API key not configured. Please add GEMINI_API_KEY to your .env file.' },
      { status: 500 }
    )
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const instruction = formData.get('instruction') as string
    const outputType = formData.get('outputType') as string || 'questions'

    if (!instruction) {
      return NextResponse.json({ error: 'Instruction is required.' }, { status: 400 })
    }

    const ai = new GoogleGenAI({ apiKey })
    const systemPrompt = buildSystemPrompt(outputType)

    const contentParts: any[] = []

    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer()
      const base64 = Buffer.from(bytes).toString('base64')
      const mimeType = file.type || 'application/octet-stream'

      contentParts.push({
        inlineData: {
          data: base64,
          mimeType,
        },
      })
    }

    contentParts.push({
      text: `Instruction: ${instruction}\n\n${systemPrompt}`,
    })

    // Try models in order — fall back if one is overloaded
    const MODELS = ['gemini-3.8-flash', 'gemini-2.5-flash', 'gemini-2.0-flash-exp']
    const MAX_RETRIES = 3
    const RETRY_DELAY_MS = 1500

    let text = ''
    let lastError: any = null

    outer: for (const modelName of MODELS) {
      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: [{ role: 'user', parts: contentParts }],
          })
          text = response.text ?? ''
          break outer // success — exit both loops
        } catch (err: any) {
          lastError = err
          const is503 = err?.message?.includes('503') || err?.message?.includes('UNAVAILABLE') || err?.status === 503
          const isModelGone = err?.message?.includes('404') || err?.message?.includes('NOT_FOUND') || err?.message?.includes('no longer available')

          if (isModelGone) {
            // This model doesn't exist — try the next one immediately
            break
          }
          if (is503 && attempt < MAX_RETRIES) {
            // Overloaded — wait and retry same model
            await new Promise(r => setTimeout(r, RETRY_DELAY_MS * attempt))
            continue
          }
          // Any other error — try next model
          break
        }
      }
    }

    if (!text) {
      const msg = lastError?.message || 'Failed to generate content.'
      const isOverloaded = msg.includes('503') || msg.includes('UNAVAILABLE') || msg.includes('high demand')
      return NextResponse.json(
        { error: isOverloaded ? 'The AI is very busy right now. Please wait a few seconds and try again.' : msg },
        { status: 503 }
      )
    }

    return NextResponse.json({ result: text })
  } catch (err: any) {
    console.error('Gemini API error:', err)
    return NextResponse.json(
      { error: err.message || 'Failed to generate content. Please try again.' },
      { status: 500 }
    )
  }
}

function buildSystemPrompt(outputType: string): string {
  switch (outputType) {
    case 'mcq':
      return `Generate well-structured multiple choice questions (MCQs) based on the content above.
Format each question as:
**Q[number]. [Question text]**
A) [Option]
B) [Option]
C) [Option]
D) [Option]
✅ Answer: [Correct option letter]) [Correct answer text]

Make questions test real understanding, not just memory. Vary difficulty.`

    case 'notes':
      return `Create clear, concise study notes from the content above.
Format as:
## [Main Topic]
### [Subtopic]
- Key point
- Key point
  - Sub-detail

Use **bold** for important terms. Include a "Key Takeaways" section at the end.`

    case 'flashcards':
      return `Generate flashcard-style Q&A pairs from the content above.
Format each flashcard as:
---
🃏 **FRONT:** [Concept or question]
**BACK:** [Answer or definition]
---

Aim for 10–20 flashcards covering the most important concepts.`

    case 'summary':
      return `Write a comprehensive summary of the content above.
Structure it as:
## Overview
[2-3 sentence overview]

## Key Points
[Bullet points of main ideas]

## Details
[Organized breakdown of important details]

## Conclusion
[Wrap-up]`

    default:
      return `Generate helpful study material based on the instruction. Format the output clearly with headings, bullet points, and bold text where appropriate.`
  }
}
