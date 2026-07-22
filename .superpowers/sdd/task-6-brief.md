# Task 6: Admin API Routes

**Files:**
- Create: `app/api/admin/analytics/route.ts`
- Create: `app/api/admin/users/route.ts`
- Create: `app/api/admin/users/[id]/route.ts`

**Interfaces:**
- Consumes: `pool` from `@/lib/db`
- Consumes: `verifyToken`, `getTokenFromRequest` from `@/lib/auth`
- Consumes: `ADMIN_EMAIL` env var

- [ ] **Step 1: Create admin analytics endpoint**

```typescript
// app/api/admin/analytics/route.ts
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
```

- [ ] **Step 2: Create admin users list endpoint**

```typescript
// app/api/admin/users/route.ts
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
```

- [ ] **Step 3: Create admin user detail endpoint**

```typescript
// app/api/admin/users/[id]/route.ts
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
```

- [ ] **Step 4: Commit**

```bash
git add app/api/admin/
git commit -m "feat: add admin API routes for analytics and users"
```
