# Admin Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an admin dashboard at `/admin` with web analytics tracking and user management for a single hardcoded admin user.

**Architecture:** Client-side beacon sends page view data to a server API route, which parses user-agent and stores in PostgreSQL. Admin routes are protected by middleware + API guards checking `ADMIN_EMAIL` env var. No role system — just a single admin email.

**Tech Stack:** Next.js 16 App Router, PostgreSQL (pg), shadcn/ui (Button), Tailwind CSS 4, Lucide Icons, anime.js (existing), class-variance-authority

## Global Constraints

- Node.js >= 22, pnpm >= 9
- Next.js 16 App Router with `'use client'` for interactive components
- PostgreSQL via `pg` Pool from `@/lib/db`
- JWT auth via `proteus_token` cookie, verified with `jsonwebtoken`
- UI: shadcn/ui Button component, Tailwind CSS, Lucide icons
- Spanish language for all UI text
- No new external dependencies (UA parsing via regex, charts via CSS)
- Existing aesthetic: `cyber-grid` class, `bg-card`, `border-border`, `text-card-foreground`

---

## File Map

| Action | File | Purpose |
|--------|------|---------|
| Create | `init-db/002_analytics.sql` | page_views table schema |
| Create | `lib/analytics.ts` | User-agent parsing helpers |
| Create | `app/api/analytics/track/route.ts` | POST endpoint for beacon |
| Create | `components/analytics/analytics-tracker.tsx` | Client component sending beacons |
| Modify | `app/layout.tsx` | Add AnalyticsTracker |
| Modify | `middleware.ts` | Admin route protection |
| Modify | `.env.example` | Add ADMIN_EMAIL |
| Create | `app/api/admin/analytics/route.ts` | GET analytics summary |
| Create | `app/api/admin/users/route.ts` | GET user list |
| Create | `app/api/admin/users/[id]/route.ts` | GET user detail |
| Create | `components/admin/admin-layout.tsx` | Admin sidebar layout |
| Create | `app/admin/layout.tsx` | Admin layout wrapper |
| Create | `app/admin/page.tsx` | Overview page |
| Create | `components/admin/kpi-cards.tsx` | Summary stat cards |
| Create | `components/admin/visit-chart.tsx` | Bar chart for daily visits |
| Create | `components/admin/top-pages.tsx` | Top pages table |
| Create | `app/admin/analytics/page.tsx` | Detailed analytics page |
| Create | `components/admin/analytics-table.tsx` | Data table with bars |
| Create | `app/admin/users/page.tsx` | User management page |
| Create | `components/admin/users-table.tsx` | Paginated user table |
| Create | `components/admin/user-detail-modal.tsx` | User detail modal |

---

### Task 1: Database Schema + Environment Config

**Files:**
- Create: `init-db/002_analytics.sql`
- Modify: `.env.example`

- [ ] **Step 1: Create analytics migration file**

```sql
-- init-db/002_analytics.sql
CREATE TABLE IF NOT EXISTS page_views (
  id SERIAL PRIMARY KEY,
  path VARCHAR(500) NOT NULL,
  browser VARCHAR(100),
  os VARCHAR(100),
  device_type VARCHAR(20) CHECK (device_type IN ('desktop', 'mobile', 'tablet')),
  screen_width INTEGER,
  screen_height INTEGER,
  ip_address INET,
  country VARCHAR(100),
  city VARCHAR(100),
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  referrer VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_page_views_created_at ON page_views(created_at);
CREATE INDEX idx_page_views_path ON page_views(path);
CREATE INDEX idx_page_views_user_id ON page_views(user_id);
```

- [ ] **Step 2: Add ADMIN_EMAIL to .env.example**

Add at the end of `.env.example`:

```
# Admin Dashboard
ADMIN_EMAIL=admin@proteus.com
```

- [ ] **Step 3: Run migration**

```bash
psql $DATABASE_URL -f init-db/002_analytics.sql
```

Expected: Commands succeed, table `page_views` created.

- [ ] **Step 4: Commit**

```bash
git add init-db/002_analytics.sql .env.example
git commit -m "feat: add page_views schema and admin email config"
```

---

### Task 2: Analytics Helper Library

**Files:**
- Create: `lib/analytics.ts`

**Interfaces:**
- Produces: `parseUserAgent(ua: string): { browser: string, os: string, deviceType: 'desktop' | 'mobile' | 'tablet' }`
- Produces: `getDeviceType(screenWidth: number): 'desktop' | 'mobile' | 'tablet'`

- [ ] **Step 1: Create analytics helpers**

```typescript
// lib/analytics.ts

export interface ParsedUA {
  browser: string
  os: string
  deviceType: 'desktop' | 'mobile' | 'tablet'
}

export function parseUserAgent(ua: string): ParsedUA {
  return {
    browser: extractBrowser(ua),
    os: extractOS(ua),
    deviceType: detectDeviceType(ua),
  }
}

function extractBrowser(ua: string): string {
  if (ua.includes('Firefox/')) return 'Firefox'
  if (ua.includes('Edg/')) return 'Edge'
  if (ua.includes('OPR/') || ua.includes('Opera')) return 'Opera'
  if (ua.includes('Chrome/') && !ua.includes('Edg/')) return 'Chrome'
  if (ua.includes('Safari/') && ua.includes('Version/')) return 'Safari'
  return 'Other'
}

function extractOS(ua: string): string {
  if (ua.includes('Windows NT 10.0')) return 'Windows 10/11'
  if (ua.includes('Windows NT 6.3')) return 'Windows 8.1'
  if (ua.includes('Windows NT 6.1')) return 'Windows 7'
  if (ua.includes('Windows')) return 'Windows'
  if (ua.includes('Mac OS X')) return 'macOS'
  if (ua.includes('Android')) return 'Android'
  if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS'
  if (ua.includes('Linux')) return 'Linux'
  return 'Other'
}

function detectDeviceType(ua: string): 'desktop' | 'mobile' | 'tablet' {
  if (ua.includes('Mobile') || ua.includes('Android') && !ua.includes('Tablet')) return 'mobile'
  if (ua.includes('iPad') || ua.includes('Tablet')) return 'tablet'
  return 'desktop'
}

export function getDeviceType(screenWidth: number): 'desktop' | 'mobile' | 'tablet' {
  if (screenWidth < 768) return 'mobile'
  if (screenWidth < 1024) return 'tablet'
  return 'desktop'
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/analytics.ts
git commit -m "feat: add user-agent parsing helpers"
```

---

### Task 3: Tracking API Endpoint

**Files:**
- Create: `app/api/analytics/track/route.ts`

**Interfaces:**
- Consumes: `parseUserAgent` from `@/lib/analytics`
- Consumes: `pool` from `@/lib/db`

- [ ] **Step 1: Create the track endpoint**

```typescript
// app/api/analytics/track/route.ts
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
```

- [ ] **Step 2: Commit**

```bash
git add app/api/analytics/track/route.ts
git commit -m "feat: add analytics tracking API endpoint"
```

---

### Task 4: Client-Side Tracking Component

**Files:**
- Create: `components/analytics/analytics-tracker.tsx`
- Modify: `app/layout.tsx`

**Interfaces:**
- Consumes: POST `/api/analytics/track`

- [ ] **Step 1: Create the tracker component**

```typescript
// components/analytics/analytics-tracker.tsx
'use client'

import { useEffect } from 'react'

export function AnalyticsTracker() {
  useEffect(() => {
    const sendBeacon = async () => {
      try {
        const res = await fetch('/api/auth/me')
        let userId: number | null = null
        if (res.ok) {
          const data = await res.json()
          userId = data.user?.id ?? null
        }

        const payload = {
          path: window.location.pathname,
          userAgent: navigator.userAgent,
          screenWidth: screen.width,
          screenHeight: screen.height,
          referrer: document.referrer || null,
          userId,
        }

        if (navigator.sendBeacon) {
          const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' })
          navigator.sendBeacon('/api/analytics/track', blob)
        } else {
          await fetch('/api/analytics/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            keepalive: true,
          })
        }
      } catch {
        // Silently ignore — tracking should never break the app
      }
    }

    sendBeacon()
  }, [])

  return null
}
```

- [ ] **Step 2: Add AnalyticsTracker to root layout**

In `app/layout.tsx`, import and add the component inside `<body>`, after `<SileoToaster />`:

```typescript
import { AnalyticsTracker } from '@/components/analytics/analytics-tracker'

// ... inside <body>:
<body className="font-sans antialiased">
  {children}
  <SileoToaster />
  <AnalyticsTracker />
  {process.env.NODE_ENV === 'production' && <Analytics />}
</body>
```

- [ ] **Step 3: Commit**

```bash
git add components/analytics/analytics-tracker.tsx app/layout.tsx
git commit -m "feat: add client-side analytics tracker to layout"
```

---

### Task 5: Middleware Admin Protection

**Files:**
- Modify: `middleware.ts`

**Interfaces:**
- Consumes: `verifyToken` from `@/lib/auth`

- [ ] **Step 1: Update middleware with admin protection**

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || ''

export function middleware(request: NextRequest) {
  const token = request.cookies.get('proteus_token')?.value
  const pathname = request.nextUrl.pathname

  const isAuthPage = pathname === '/login'
  const isDashboard = pathname.startsWith('/dashboard')
  const isAdmin = pathname.startsWith('/admin')
  const isAdminApi = pathname.startsWith('/api/admin')
  const isApiAuth = pathname.startsWith('/api/auth')

  if (isApiAuth) return NextResponse.next()

  // Admin route protection
  if (isAdmin || isAdminApi) {
    if (!token) {
      if (isAdmin) {
        return NextResponse.redirect(new URL('/login', request.url))
      }
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
      const payload = verifyToken(token)
      if (payload.email !== ADMIN_EMAIL) {
        if (isAdmin) {
          return NextResponse.redirect(new URL('/dashboard', request.url))
        }
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    } catch {
      if (isAdmin) {
        return NextResponse.redirect(new URL('/login', request.url))
      }
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    return NextResponse.next()
  }

  // Dashboard protection
  if (isDashboard && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/api/admin/:path*', '/login'],
}
```

- [ ] **Step 2: Commit**

```bash
git add middleware.ts
git commit -m "feat: add admin route protection to middleware"
```

---

### Task 6: Admin API Routes

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
    // Summary KPIs
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

    // Grouped data
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

    // Daily visits for chart (last 30 days)
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

---

### Task 7: Admin Layout + Overview Page

**Files:**
- Create: `components/admin/admin-layout.tsx`
- Create: `app/admin/layout.tsx`
- Create: `app/admin/page.tsx`
- Create: `components/admin/kpi-cards.tsx`
- Create: `components/admin/visit-chart.tsx`
- Create: `components/admin/top-pages.tsx`

**Interfaces:**
- Consumes: GET `/api/admin/analytics`

- [ ] **Step 1: Create admin layout component**

```typescript
// components/admin/admin-layout.tsx
'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  Shield,
  LayoutDashboard,
  BarChart3,
  Users,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { sileo } from 'sileo'

const navItems = [
  { id: '/admin', label: 'Overview', icon: LayoutDashboard },
  { id: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { id: '/admin/users', label: 'Usuarios', icon: Users },
]

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    sileo.success({ title: 'Sesión cerrada' })
    router.push('/login')
  }

  const sidebar = (
    <nav className="flex h-full flex-col gap-1 p-4">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.id || (item.id !== '/admin' && pathname.startsWith(item.id))
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              router.push(item.id)
              setMobileOpen(false)
            }}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon className="size-4.5 shrink-0" aria-hidden="true" />
            {item.label}
          </button>
        )
      })}
      <div className="mt-auto rounded-lg border border-border bg-background/40 p-4">
        <div className="flex items-center gap-2 border-t border-border pt-3">
          <span className="truncate text-xs text-muted-foreground">Admin</span>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-2 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <LogOut className="size-3.5" />
          Cerrar sesión
        </button>
      </div>
    </nav>
  )

  return (
    <div className="min-h-screen cyber-grid">
      <div className="flex min-h-screen">
        {/* Desktop sidebar */}
        <aside className="hidden w-64 shrink-0 border-r border-border bg-sidebar lg:flex lg:flex-col">
          <div className="flex items-center gap-2.5 border-b border-border px-5 py-4">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Shield className="size-5" aria-hidden="true" />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-sidebar-foreground">Proteus</p>
              <p className="text-xs text-muted-foreground">Admin Panel</p>
            </div>
          </div>
          {sidebar}
        </aside>

        {/* Mobile drawer */}
        {mobileOpen ? (
          <div className="fixed inset-0 z-40 lg:hidden">
            <button
              type="button"
              aria-label="Cerrar menú"
              className="absolute inset-0 bg-background/70 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <aside className="absolute inset-y-0 left-0 flex w-64 flex-col border-r border-border bg-sidebar">
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Shield className="size-5" />
                  </span>
                  <p className="text-sm font-semibold text-sidebar-foreground">Admin</p>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Cerrar menú"
                  className="rounded-md p-1 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-5" />
                </button>
              </div>
              {sidebar}
            </aside>
          </div>
        ) : null}

        {/* Main content */}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur sm:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                aria-label="Abrir menú"
                className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
              >
                <Menu className="size-5" />
              </button>
              <div>
                <h1 className="text-base font-semibold text-foreground sm:text-lg">
                  Admin Panel
                </h1>
                <p className="hidden text-xs text-muted-foreground sm:block">
                  Gestión y analytics de Proteus Protection
                </p>
              </div>
            </div>
          </header>

          <main className="flex-1 space-y-6 p-4 sm:p-6">
            {children}
            <footer className="pt-2 text-center text-xs text-muted-foreground">
              Proteus Protection · Admin Panel
            </footer>
          </main>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create admin layout wrapper**

```typescript
// app/admin/layout.tsx
import { AdminLayout } from '@/components/admin/admin-layout'

export default function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  return <AdminLayout>{children}</AdminLayout>
}
```

- [ ] **Step 3: Create KPI cards component**

```typescript
// components/admin/kpi-cards.tsx
'use client'

import { useEffect, useRef } from 'react'
import { createTimeline } from 'animejs'
import { Eye, Users, UserCheck, Activity, BarChart3 } from 'lucide-react'

interface KpiCardsProps {
  visitsToday: number
  uniqueVisitors: number
  totalUsers: number
  activeSubscriptions: number
  totalVisits: number
}

export function KpiCards({
  visitsToday,
  uniqueVisitors,
  totalUsers,
  activeSubscriptions,
  totalVisits,
}: KpiCardsProps) {
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const grid = gridRef.current
    if (!grid) return
    const cards = grid.querySelectorAll('[data-card]')
    createTimeline({ defaults: { ease: 'out(3)' } }).add(cards, {
      translateY: [24, 0],
      opacity: [0, 1],
      duration: 620,
      delay: (_, i) => i * 90,
    })
  }, [])

  const cards = [
    { label: 'Visitas hoy', value: visitsToday, icon: Eye, tone: 'text-primary', glow: 'bg-primary/10' },
    { label: 'Visitantes únicos', value: uniqueVisitors, icon: Users, tone: 'text-success', glow: 'bg-success/10' },
    { label: 'Usuarios registrados', value: totalUsers, icon: UserCheck, tone: 'text-warning', glow: 'bg-warning/10' },
    { label: 'Suscripciones activas', value: activeSubscriptions, icon: Activity, tone: 'text-primary', glow: 'bg-primary/10' },
    { label: 'Visitas totales', value: totalVisits, icon: BarChart3, tone: 'text-muted-foreground', glow: 'bg-muted/50' },
  ]

  return (
    <div ref={gridRef} className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <article
            key={card.label}
            data-card
            className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 opacity-0 transition-colors hover:border-primary/40"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {card.label}
                </p>
                <p className="mt-2 font-mono text-2xl font-semibold text-card-foreground">
                  {card.value.toLocaleString('es')}
                </p>
              </div>
              <span className={`relative flex size-11 shrink-0 items-center justify-center rounded-lg ${card.glow}`}>
                <Icon className={`size-5 ${card.tone}`} aria-hidden="true" />
              </span>
            </div>
          </article>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 4: Create visit chart component**

```typescript
// components/admin/visit-chart.tsx
'use client'

interface DailyVisit {
  date: string
  count: number
}

export function VisitChart({ data }: { data: DailyVisit[] }) {
  const maxCount = Math.max(...data.map((d) => d.count), 1)

  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <h2 className="text-base font-semibold text-card-foreground">
        Visitas por día (últimos 30 días)
      </h2>
      <div className="mt-4 flex items-end gap-1" style={{ height: 160 }}>
        {data.map((day) => {
          const height = maxCount > 0 ? (day.count / maxCount) * 100 : 0
          const date = new Date(day.date)
          const label = `${date.getDate()}/${date.getMonth() + 1}`
          return (
            <div
              key={day.date}
              className="group flex flex-1 flex-col items-center gap-1"
            >
              <span className="hidden text-[10px] text-muted-foreground group-hover:block">
                {day.count}
              </span>
              <div
                className="w-full rounded-t-sm bg-primary/60 transition-colors hover:bg-primary"
                style={{ height: `${Math.max(height, 2)}%` }}
                title={`${label}: ${day.count} visitas`}
              />
              <span className="text-[9px] text-muted-foreground">{label}</span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
```

- [ ] **Step 5: Create top pages component**

```typescript
// components/admin/top-pages.tsx
'use client'

interface PageStat {
  label: string
  count: number
  percentage: number
}

export function TopPages({ data }: { data: PageStat[] }) {
  const top5 = data.slice(0, 5)

  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <h2 className="text-base font-semibold text-card-foreground">
        Páginas más visitadas
      </h2>
      <div className="mt-4 space-y-3">
        {top5.length === 0 && (
          <p className="text-sm text-muted-foreground">Sin datos aún</p>
        )}
        {top5.map((page) => (
          <div key={page.label} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-mono text-card-foreground">{page.label}</span>
              <span className="text-muted-foreground">{page.count}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary/60"
                style={{ width: `${page.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 6: Create overview page**

```typescript
// app/admin/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { KpiCards } from '@/components/admin/kpi-cards'
import { VisitChart } from '@/components/admin/visit-chart'
import { TopPages } from '@/components/admin/top-pages'

interface AdminAnalytics {
  kpis: {
    visitsToday: number
    uniqueVisitors: number
    totalVisits: number
    totalUsers: number
    activeSubscriptions: number
  }
  grouped: { label: string; count: number; percentage: number }[]
  daily: { date: string; count: number }[]
}

export default function AdminOverviewPage() {
  const [data, setData] = useState<AdminAnalytics | null>(null)

  useEffect(() => {
    fetch('/api/admin/analytics?period=30d&group=page')
      .then((res) => res.json())
      .then(setData)
      .catch(() => {})
  }, [])

  if (!data) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <KpiCards {...data.kpis} />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <VisitChart data={data.daily} />
        </div>
        <div className="xl:col-span-1">
          <TopPages data={data.grouped} />
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 7: Commit**

```bash
git add components/admin/ app/admin/
git commit -m "feat: add admin layout, overview page with KPIs, chart, and top pages"
```

---

### Task 8: Admin Analytics Page

**Files:**
- Create: `app/admin/analytics/page.tsx`
- Create: `components/admin/analytics-table.tsx`

**Interfaces:**
- Consumes: GET `/api/admin/analytics?period=...&group=...`

- [ ] **Step 1: Create analytics table component**

```typescript
// components/admin/analytics-table.tsx
'use client'

interface AnalyticsRow {
  label: string
  count: number
  percentage: number
}

export function AnalyticsTable({ data }: { data: AnalyticsRow[] }) {
  return (
    <div className="space-y-2">
      {data.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Sin datos para este período
        </p>
      )}
      {data.map((row) => (
        <div
          key={row.label}
          className="flex items-center gap-4 rounded-lg border border-border bg-background p-3"
        >
          <span className="min-w-[120px] font-mono text-sm text-card-foreground">
            {row.label}
          </span>
          <div className="flex-1">
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary/60"
                style={{ width: `${row.percentage}%` }}
              />
            </div>
          </div>
          <span className="min-w-[60px] text-right text-sm text-muted-foreground">
            {row.count}
          </span>
          <span className="min-w-[40px] text-right text-xs text-muted-foreground">
            {row.percentage}%
          </span>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Create analytics page**

```typescript
// app/admin/analytics/page.tsx
'use client'

import { useEffect, useState, useCallback } from 'react'
import { AnalyticsTable } from '@/components/admin/analytics-table'
import { cn } from '@/lib/utils'

const periods = [
  { key: '24h', label: '24 horas' },
  { key: '7d', label: '7 días' },
  { key: '30d', label: '30 días' },
  { key: 'all', label: 'Todo' },
] as const

const groups = [
  { key: 'browser', label: 'Navegadores' },
  { key: 'os', label: 'Sistemas operativos' },
  { key: 'device', label: 'Dispositivos' },
  { key: 'country', label: 'Países' },
  { key: 'page', label: 'Páginas' },
] as const

export default function AdminAnalyticsPage() {
  const [period, setPeriod] = useState<string>('7d')
  const [group, setGroup] = useState<string>('browser')
  const [data, setData] = useState<{ label: string; count: number; percentage: number }[]>([])

  const fetchData = useCallback(async () => {
    const res = await fetch(`/api/admin/analytics?period=${period}&group=${group}`)
    if (res.ok) {
      const json = await res.json()
      setData(json.grouped)
    }
  }, [period, group])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <div className="space-y-6">
      {/* Period selector */}
      <div className="flex flex-wrap gap-2">
        {periods.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => setPeriod(p.key)}
            className={cn(
              'rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
              period === p.key
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Group tabs */}
      <div className="flex flex-wrap gap-2">
        {groups.map((g) => (
          <button
            key={g.key}
            type="button"
            onClick={() => setGroup(g.key)}
            className={cn(
              'rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
              group === g.key
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            {g.label}
          </button>
        ))}
      </div>

      {/* Data table */}
      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-base font-semibold text-card-foreground">
          {groups.find((g) => g.key === group)?.label}
        </h2>
        <div className="mt-4">
          <AnalyticsTable data={data} />
        </div>
      </section>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add app/admin/analytics/ components/admin/analytics-table.tsx
git commit -m "feat: add admin analytics page with period and group filters"
```

---

### Task 9: Admin Users Page

**Files:**
- Create: `app/admin/users/page.tsx`
- Create: `components/admin/users-table.tsx`
- Create: `components/admin/user-detail-modal.tsx`

**Interfaces:**
- Consumes: GET `/api/admin/users?search=...&plan=...&page=...`
- Consumes: GET `/api/admin/users/[id]`

- [ ] **Step 1: Create user detail modal**

```typescript
// components/admin/user-detail-modal.tsx
'use client'

import { useEffect, useState } from 'react'
import { X, KeyRound, Eye } from 'lucide-react'

interface UserDetail {
  user: {
    id: number
    name: string
    email: string
    created_at: string
    plan_name: string | null
    subscription_status: string | null
    password_count: number
  }
  recentViews: {
    path: string
    browser: string
    os: string
    device_type: string
    country: string | null
    created_at: string
  }[]
}

export function UserDetailModal({
  userId,
  onClose,
}: {
  userId: number
  onClose: () => void
}) {
  const [data, setData] = useState<UserDetail | null>(null)

  useEffect(() => {
    fetch(`/api/admin/users/${userId}`)
      .then((res) => res.json())
      .then(setData)
      .catch(() => onClose())
  }, [userId, onClose])

  if (!data) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  const { user, recentViews } = data

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm">
      <div className="mx-4 max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-xl border border-border bg-card p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-card-foreground">{user.name}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-border p-3">
            <p className="text-xs text-muted-foreground">Plan</p>
            <p className="text-sm font-medium text-card-foreground">
              {user.plan_name || 'Sin plan'}
            </p>
          </div>
          <div className="rounded-lg border border-border p-3">
            <p className="text-xs text-muted-foreground">Estado</p>
            <p className="text-sm font-medium text-card-foreground">
              {user.subscription_status || 'N/A'}
            </p>
          </div>
          <div className="rounded-lg border border-border p-3">
            <p className="text-xs text-muted-foreground">Contraseñas</p>
            <p className="text-sm font-medium text-card-foreground">
              <KeyRound className="mr-1 inline size-3" />
              {user.password_count}
            </p>
          </div>
          <div className="rounded-lg border border-border p-3">
            <p className="text-xs text-muted-foreground">Registro</p>
            <p className="text-sm font-medium text-card-foreground">
              {new Date(user.created_at).toLocaleDateString('es')}
            </p>
          </div>
        </div>

        {recentViews.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-card-foreground">
              <Eye className="mr-1 inline size-3" />
              Actividad reciente
            </h3>
            <div className="mt-2 space-y-1">
              {recentViews.map((view, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded border border-border px-3 py-1.5 text-xs"
                >
                  <span className="font-mono text-card-foreground">{view.path}</span>
                  <span className="text-muted-foreground">
                    {view.browser} · {view.os}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create users table component**

```typescript
// components/admin/users-table.tsx
'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

interface UserRow {
  id: number
  name: string
  email: string
  created_at: string
  plan_name: string | null
  subscription_status: string | null
  password_count: number
}

interface UsersTableProps {
  users: UserRow[]
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  onSelectUser: (id: number) => void
}

export function UsersTable({
  users,
  page,
  totalPages,
  onPageChange,
  onSelectUser,
}: UsersTableProps) {
  return (
    <div>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Nombre
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Plan
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Estado
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Registro
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                onClick={() => onSelectUser(user.id)}
                className="cursor-pointer border-b border-border transition-colors hover:bg-muted/30"
              >
                <td className="px-4 py-3 font-medium text-card-foreground">{user.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                <td className="px-4 py-3 text-muted-foreground">{user.plan_name || 'Sin plan'}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      user.subscription_status === 'active'
                        ? 'bg-success/10 text-success'
                        : user.subscription_status === 'trialing'
                          ? 'bg-warning/10 text-warning'
                          : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {user.subscription_status || 'N/A'}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(user.created_at).toLocaleDateString('es')}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  No se encontraron usuarios
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="rounded-lg border border-border p-2 text-muted-foreground hover:bg-muted disabled:opacity-50"
          >
            <ChevronLeft className="size-4" />
          </button>
          <span className="text-sm text-muted-foreground">
            Página {page} de {totalPages}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="rounded-lg border border-border p-2 text-muted-foreground hover:bg-muted disabled:opacity-50"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Create users page**

```typescript
// app/admin/users/page.tsx
'use client'

import { useEffect, useState, useCallback } from 'react'
import { UsersTable } from '@/components/admin/users-table'
import { UserDetailModal } from '@/components/admin/user-detail-modal'

interface UserRow {
  id: number
  name: string
  email: string
  created_at: string
  plan_name: string | null
  subscription_status: string | null
  password_count: number
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)

  const fetchUsers = useCallback(async () => {
    const params = new URLSearchParams({
      page: String(page),
      limit: '20',
    })
    if (search) params.set('search', search)

    const res = await fetch(`/api/admin/users?${params}`)
    if (res.ok) {
      const data = await res.json()
      setUsers(data.users)
      setTotal(data.total)
      setTotalPages(data.totalPages)
    }
  }, [page, search])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleSearch = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex items-center gap-3">
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="flex-1 rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <span className="shrink-0 text-sm text-muted-foreground">
          {total} usuario{total !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <UsersTable
        users={users}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        onSelectUser={setSelectedUserId}
      />

      {/* Detail modal */}
      {selectedUserId !== null && (
        <UserDetailModal
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add app/admin/users/ components/admin/users-table.tsx components/admin/user-detail-modal.tsx
git commit -m "feat: add admin users page with search, pagination, and detail modal"
```

---

## Verification

After all tasks are complete:

1. Run `pnpm build` to verify no TypeScript errors
2. Run `pnpm lint` to verify no linting issues
3. Manual test:
   - Set `ADMIN_EMAIL` in `.env` to match your test user's email
   - Navigate to `/admin` — should see overview with KPIs
   - Navigate to `/admin/analytics` — should show data after some page views
   - Navigate to `/admin/users` — should list registered users
   - Click a user row — should open detail modal
   - Non-admin users should be redirected to `/dashboard` when accessing `/admin`
