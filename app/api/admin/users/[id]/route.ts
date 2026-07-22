import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { verifyToken, getTokenFromRequest } from '@/lib/auth'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || ''

function verifyAdmin(request: Request): boolean {
  const token = getTokenFromRequest(request)
  if (!token) return false
  try {
    const payload = verifyToken(token)
    return payload.email === ADMIN_EMAIL
  } catch {
    return false
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params

  try {
    const userResult = await pool.query(
      `SELECT u.id, u.name, u.email, u.created_at,
              p.name as plan_name, p.slug as plan_slug,
              s.status as subscription_status, s.trial_ends_at, s.current_period_end,
              (SELECT COUNT(*) FROM saved_passwords sp WHERE sp.user_id = u.id) as password_count
       FROM users u
       LEFT JOIN subscriptions s ON s.user_id = u.id AND s.status IN ('trialing', 'active')
       LEFT JOIN plans p ON p.id = s.plan_id
       WHERE u.id = $1`,
      [id]
    )

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const recentViews = await pool.query(
      `SELECT path, browser, os, device_type, country, city, created_at
       FROM page_views
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 20`,
      [id]
    )

    return NextResponse.json({
      user: userResult.rows[0],
      recentViews: recentViews.rows,
    })
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
