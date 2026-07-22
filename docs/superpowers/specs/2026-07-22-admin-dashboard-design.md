# Admin Dashboard — Design Spec

**Date:** 2026-07-22
**Status:** Approved
**Project:** ProteusProtection

## Overview

Add an admin dashboard at `/admin` that provides web analytics (browser, OS, device, country, page views) and user management (list users, plans, subscriptions). Admin is identified by a single hardcoded email via environment variable — no role system needed.

## Goals

- Visualize which devices/browsers/countries visit the site
- Manage and view all registered users and their subscriptions
- Keep it simple: hardcoded admin, no granular permissions
- Match existing cyberpunk aesthetic (shadcn/ui, Tailwind, Lucide icons)

## Non-Goals

- Granular role/permission system
- Real-time analytics (polling every ~30s is fine)
- Third-party analytics integration
- User impersonation or session management

---

## Database Schema

### New table: `page_views`

```sql
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

No changes to existing tables. Admin identification is via `ADMIN_EMAIL` env var.

---

## Admin Identification

- **Environment variable**: `ADMIN_EMAIL` in `.env`
- **Middleware check**: Parse JWT token from `proteus_token` cookie, decode email, compare to `ADMIN_EMAIL`
- **No DB changes**: No `role` column added to `users` table
- **API guard**: Every `/api/admin/*` route verifies the caller's email matches `ADMIN_EMAIL`

---

## Client-Side Tracking

### Component: `<Analytics />`

Added to `app/layout.tsx`. On mount, sends a beacon to `/api/analytics/track` with:

```typescript
{
  path: window.location.pathname,
  userAgent: navigator.userAgent,
  screenWidth: screen.width,
  screenHeight: screen.height,
  referrer: document.referrer || null,
}
```

- Uses `navigator.sendBeacon` for reliability (sends even on page unload)
- Fires once per page load (not on route changes within SPA — but since this is App Router with server components, each navigation triggers a new mount)

### User-Agent Parsing

- Parse browser name + version from UA string using a lightweight regex helper in `lib/analytics.ts`
- Extract OS name from UA string
- Determine device type from screen width: `< 768` = mobile, `< 1024` = tablet, else desktop

### Geolocation

- Use the `ip` column with a lightweight IP-to-country lookup
- For v1: use a simple HTTP call to `ip-api.com` (free, no key needed, rate limit 45 req/min) on the server side when recording the page view
- Alternative: skip geolocation initially and add later — the schema supports it regardless

---

## API Routes

### POST `/api/analytics/track`

**Public** (no auth required). Rate-limited to 10 requests per IP per minute.

Receives beacon data, parses user-agent, resolves IP from `x-forwarded-for`, inserts into `page_views`.

### GET `/api/admin/analytics`

**Admin only.** Query params:

| Param | Values | Default |
|-------|--------|---------|
| `period` | `24h`, `7d`, `30d`, `all` | `7d` |
| `group` | `browser`, `os`, `device`, `country`, `page` | `browser` |

Returns: `{ label: string, count: number, percentage: number }[]`

Also returns summary KPIs: `totalVisits`, `uniqueVisitors`, `visitsToday`.

### GET `/api/admin/users`

**Admin only.** Query params:

| Param | Description |
|-------|-------------|
| `search` | Filter by name or email (ILIKE) |
| `plan` | Filter by plan slug |
| `page` | Pagination (default 1) |
| `limit` | Results per page (default 20) |

Returns: `{ users: UserSummary[], total: number, page: number, totalPages: number }`

Where `UserSummary` includes: id, name, email, plan name, subscription status, created_at.

### GET `/api/admin/users/[id]`

**Admin only.** Returns full user detail: profile, plan, subscription, password count, last page views.

---

## Routes and Pages

### `/admin` — Overview

- **KPI cards row**: Visitas hoy, Visitas 7d, Usuarios únicos, Usuarios registrados, Suscripciones activas
- **Line chart**: Visitas por día (últimos 30 días) — built with CSS/SVG bars (no chart library needed for simple bar chart)
- **Top pages table**: Top 5 most visited paths

### `/admin/analytics` — Detailed Analytics

- **Period selector**: Button group (24h / 7d / 30d / Todo)
- **Category tabs**: Navegadores / SO / Dispositivos / Países / Páginas
- **Data table**: Each tab shows label, count, percentage bar

### `/admin/users` — User Management

- **Search bar**: Filter by name/email
- **Plan filter dropdown**: All / Personal / Premium / Enterprise
- **Paginated table**: Name, Email, Plan, Status, Registered date
- **Row click**: Opens detail modal with full user info

---

## Middleware Changes

```typescript
// middleware.ts additions:

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || ''
const isAdminPath = request.nextUrl.pathname.startsWith('/admin')
const isAdminApi = request.nextUrl.pathname.startsWith('/api/admin')

// Protect admin routes
if ((isAdminPath || isAdminApi) && token) {
  // Decode JWT to get email, compare to ADMIN_EMAIL
  // If not admin → redirect to /dashboard (pages) or 403 (API)
}

// Also protect /api/analytics/track from abuse (rate limit in route handler)
```

---

## File Structure (new/modified)

```
app/
├── admin/
│   ├── layout.tsx              # Admin sidebar layout
│   ├── page.tsx                # Overview
│   ├── analytics/page.tsx      # Detailed analytics
│   └── users/page.tsx          # User management
├── api/
│   ├── analytics/
│   │   └── track/route.ts      # POST - beacon receiver
│   └── admin/
│       ├── analytics/route.ts  # GET - analytics data
│       └── users/
│           ├── route.ts        # GET - user list
│           └── [id]/route.ts   # GET - user detail
├── layout.tsx                  # Modified: add <Analytics />
components/
├── admin/
│   ├── admin-layout.tsx        # Sidebar + header for admin
│   ├── kpi-cards.tsx           # Summary stat cards
│   ├── analytics-charts.tsx    # Bar chart components
│   ├── analytics-table.tsx     # Data table with percentage bars
│   ├── users-table.tsx         # Paginated user table
│   └── user-detail-modal.tsx   # Modal with user detail
├── dashboard/
│   └── (existing files)
lib/
├── analytics.ts                # UA parsing, helper functions
└── (existing files)
middleware.ts                   # Modified: admin route protection
init-db/
└── 002_analytics.sql           # New: page_views table
```

---

## Libraries

No new external dependencies. UA parsing done with regex helpers. Charts built with CSS + Tailwind (simple bar charts don't need a charting library).

---

## Security Considerations

- Admin routes double-checked: middleware + each API route handler
- `ADMIN_EMAIL` env var never exposed to client
- Analytics tracking endpoint rate-limited (10 req/IP/min)
- IP addresses stored but not displayed in the admin UI (only country/city)
- User detail endpoint does not expose password hashes

---

## Migration Path

1. Create `002_analytics.sql` schema file
2. Add `ADMIN_EMAIL` to `.env.example`
3. Add `<Analytics />` to layout — starts tracking immediately
4. Build admin routes and pages
5. Update middleware for admin protection
6. No data migration needed (new table only)
