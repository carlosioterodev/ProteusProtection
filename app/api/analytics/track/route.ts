import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { parseUserAgent } from '@/lib/analytics'

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 10
const RATE_WINDOW = 60_000

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW })
    return true
  }

  if (entry.count >= RATE_LIMIT) return false
  entry.count++
  return true
}

export async function POST(request: Request) {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() || '127.0.0.1'

  if (!checkRateLimit(ip)) {
    return NextResponse.json({ ok: true })
  }

  try {
    const body = await request.json()
    const { path, userAgent, screenWidth, screenHeight, referrer, userId } = body

    if (!path || !userAgent) {
      return NextResponse.json({ ok: true })
    }

    const { browser, os, deviceType } = parseUserAgent(userAgent)

    await pool.query(
      `INSERT INTO page_views (path, browser, os, device_type, screen_width, screen_height, ip_address, user_id, referrer)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        path,
        browser,
        os,
        deviceType,
        screenWidth || null,
        screenHeight || null,
        ip,
        userId || null,
        referrer || null,
      ]
    )
  } catch {
    // Silently ignore tracking errors — don't break the user experience
  }

  return NextResponse.json({ ok: true })
}
