import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { verifyToken, getTokenFromRequest } from '@/lib/auth'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || ''

function verifyAdmin(request: Response | Request): boolean {
  const token = getTokenFromRequest(request as Request)
  if (!token) return false
  try {
    const payload = verifyToken(token)
    return payload.email === ADMIN_EMAIL
  } catch {
    return false
  }
}

function periodToInterval(period: string): string {
  switch (period) {
    case '24h': return "NOW() - INTERVAL '24 hours'"
    case '7d': return "NOW() - INTERVAL '7 days'"
    case '30d': return "NOW() - INTERVAL '30 days'"
    default: return "NOW() - INTERVAL '365 days'"
  }
}

export async function GET(request: Request) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const period = searchParams.get('period') || '7d'
  const group = searchParams.get('group') || 'browser'
  const since = periodToInterval(period)

  try {
    const todayResult = await pool.query(
      `SELECT COUNT(*) as count FROM page_views WHERE created_at >= NOW() - INTERVAL '1 day'`
    )
    const periodResult = await pool.query(
      `SELECT COUNT(DISTINCT ip_address) as unique_visitors, COUNT(*) as total
       FROM page_views WHERE created_at >= ${since}`
    )
    const usersResult = await pool.query(`SELECT COUNT(*) as count FROM users`)
    const subsResult = await pool.query(
      `SELECT COUNT(*) as count FROM subscriptions WHERE status IN ('trialing', 'active')`
    )

    let groupColumn: string
    switch (group) {
      case 'os': groupColumn = 'os'; break
      case 'device': groupColumn = 'device_type'; break
      case 'country': groupColumn = 'country'; break
      case 'page': groupColumn = 'path'; break
      default: groupColumn = 'browser'
    }

    const groupedResult = await pool.query(
      `SELECT ${groupColumn} as label, COUNT(*) as count
       FROM page_views
       WHERE created_at >= ${since} AND ${groupColumn} IS NOT NULL
       GROUP BY ${groupColumn}
       ORDER BY count DESC
       LIMIT 20`
    )

    const totalGrouped = groupedResult.rows.reduce(
      (sum, row) => sum + Number(row.count), 0
    )

    const grouped = groupedResult.rows.map((row) => ({
      label: row.label,
      count: Number(row.count),
      percentage: totalGrouped > 0
        ? Math.round((Number(row.count) / totalGrouped) * 100)
        : 0,
    }))

    const dailyResult = await pool.query(
      `SELECT DATE(created_at) as date, COUNT(*) as count
       FROM page_views
       WHERE created_at >= NOW() - INTERVAL '30 days'
       GROUP BY DATE(created_at)
       ORDER BY date ASC`
    )

    const daily = dailyResult.rows.map((row) => ({
      date: row.date,
      count: Number(row.count),
    }))

    return NextResponse.json({
      kpis: {
        visitsToday: Number(todayResult.rows[0].count),
        uniqueVisitors: Number(periodResult.rows[0].unique_visitors),
        totalVisits: Number(periodResult.rows[0].total),
        totalUsers: Number(usersResult.rows[0].count),
        activeSubscriptions: Number(subsResult.rows[0].count),
      },
      grouped,
      daily,
    })
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
