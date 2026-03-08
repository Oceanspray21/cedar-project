import { NextRequest, NextResponse } from 'next/server'
import { generateText, Output } from 'ai'
import { google } from '@ai-sdk/google'
import { z } from 'zod'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

/** Normalize color to 6-char hex (Gemini may return #fff, #FFF, "red", etc) */
function normalizeHex(val: string | number): string {
  const color = String(val).trim()
  const m = color.match(/^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/)
  if (!m) return '#FF6B35'
  let hex = m[1]
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
  }
  return '#' + hex
}

const voxelSchema = z.object({
  x: z.number().int().min(-32).max(32),
  y: z.number().int().min(0).max(32),
  z: z.number().int().min(-32).max(32),
  color: z.union([z.string(), z.number()]).transform(normalizeHex),
})

const voxelsOutputSchema = z.object({
  voxels: z.array(voxelSchema).max(300),
})

const MAX_PROMPT_LENGTH = 300

/** Sanitize user input: strip control chars, limit length, prevent injection patterns */
function sanitizePrompt(raw: string): string {
  return raw
    .replace(/[\x00-\x1F\x7F]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_PROMPT_LENGTH)
}

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  )
}

async function checkRateLimit(ip: string): Promise<{ allowed: boolean; message?: string }> {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!redisUrl || !redisToken) {
    return { allowed: true }
  }
  const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(20, '1 m'),
  })
  const { success } = await ratelimit.limit(`generate-voxels:${ip}`)
  if (!success) {
    return {
      allowed: false,
      message: 'Too many requests. Please wait a moment and try again.',
    }
  }
  return { allowed: true }
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'AI generation is not configured. Add GOOGLE_GENERATIVE_AI_API_KEY.' },
        { status: 503 }
      )
    }

    const ip = getClientIp(req)
    const rateCheck = await checkRateLimit(ip)
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: rateCheck.message },
        { status: 429 }
      )
    }

    const contentType = req.headers.get('content-type') ?? ''
    if (!contentType.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type must be application/json' },
        { status: 415 }
      )
    }

    const body = await req.json()
    const rawPrompt = typeof body?.prompt === 'string' ? body.prompt : ''
    const prompt = sanitizePrompt(rawPrompt)

    if (!prompt) {
      return NextResponse.json(
        { error: 'Missing or empty prompt' },
        { status: 400 }
      )
    }

    const { output } = await generateText({
      model: google('gemini-2.0-flash'),
      output: Output.object({
        name: 'VoxelStructure',
        description: 'Array of voxel coordinates and colors for a 3D voxel editor',
        schema: voxelsOutputSchema,
      }),
      prompt: `You are a voxel structure generator. Given a text description, output a list of voxels (3D blocks on a grid).

Rules:
- Each voxel has: x, y, z (integers) and color (hex like #FF6B35)
- Keep structures compact: x,z in range -16 to 16, y from 0 to 16
- Use max 300 voxels. Prefer simpler, recognizable shapes.
- Use varied colors when appropriate (e.g. house: brown roof, white walls)
- Place structures centered near origin (0,0,0) when possible

User description: ${JSON.stringify(prompt)}

Return ONLY valid JSON matching: { voxels: [{ x, y, z, color }, ...] }`,
    })

    const parsed = voxelsOutputSchema.safeParse(output)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'AI returned invalid voxel data. Try a simpler description.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ voxels: parsed.data.voxels })
  } catch (err) {
    const safeErr = err instanceof Error ? err.message : 'Unknown error'
    console.error('[generate-voxels]', safeErr.replace(/AIza[^\s]*/g, '[REDACTED]'))
    const isDev = process.env.NODE_ENV === 'development'
    let userMsg = 'Failed to generate voxels. Please try again.'
    if (err instanceof Error) {
      if (err.message.includes('structured') || err.message.includes('object'))
        userMsg = 'AI returned unexpected format. Try "a small house" or "pyramid".'
      else if (err.message.includes('API key') || err.message.includes('401') || err.message.includes('403'))
        userMsg = 'Invalid API key. Check GOOGLE_GENERATIVE_AI_API_KEY in .env.local'
      else if (isDev)
        userMsg = safeErr.replace(/AIza[^\s]*/g, '[KEY]').slice(0, 150)
    }
    return NextResponse.json(
      { error: userMsg },
      { status: 500 }
    )
  }
}
