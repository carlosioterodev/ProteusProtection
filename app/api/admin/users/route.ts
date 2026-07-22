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

export async function GET(request: Request) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || ''
  const plan = searchParams.get('plan') || ''
  const page = Math.max(1, Number(searchParams.get('page')) || 1)
  const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit')) || 20))
  const offset = (page - 1) * limit

  try {
    let whereClause = 'WHERE 1=1'
    const params: unknown[] = []
    let paramIndex = 1

    if (search) {
      whereClause += ` AND (u.name ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex})`
      params.push(`%${search}%`)
      paramIndex++
    }

    if (plan) {
      whereClause += ` AND p.slug = $${paramIndex}`
      params.push(plan)
      paramIndex++
    }

    const countResult = await pool.query(
      `SELECT COUNT(*) as count
       FROM users u
       LEFT JOIN subscriptions s ON s.user_id = u.id AND s.status IN ('trialing', 'active')
       LEFT JOIN plans p ON p.id = s.plan_id
       ${whereClause}`,
      params
    )

    const usersResult = await pool.query(
      `SELECT u.id, u.name, u.email, u.created_at,
              p.name as plan_name, p.slug as plan_slug,
              s.status as subscription_status, s.trial_ends_at, s.current_period_end,
              (SELECT COUNT(*) FROM saved_passwords sp WHERE sp.user_id = u.id) as password_count
       FROM users u
       LEFT JOIN subscriptions s ON s.user_id = u.id AND s.status IN ('trialing', 'active')
       LEFT JOIN plans p ON p.id = s.plan_id
       ${whereClause}
       ORDER BY u.created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    )

    const total = Number(countResult.rows[0].count)

    return NextResponse.json({
      users: usersResult.rows,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
