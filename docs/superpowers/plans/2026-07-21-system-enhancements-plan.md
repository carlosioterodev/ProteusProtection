# ProteusProtection System Enhancements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enhance ProteusProtection with dynamic plan processing, MFA authentication, RS256 JWT security, and email automation.

**Architecture:** Incremental migration preserving existing JWT auth. Add SuperTokens for MFA, Resend for email. New DB tables for plan management. Dashboard adapts features based on active plan.

**Tech Stack:** Next.js 16, PostgreSQL, SuperTokens, Resend, jsonwebtoken (RS256), bcryptjs

## Global Constraints

- Runtime: Node.js 18+ (Vercel)
- Database: PostgreSQL 14+ via `pg` driver
- Auth: HTTP-only cookies for token storage
- JWT: RS256 asymmetric signing (mandatory for security)
- Email: Resend API (free tier: 100k emails/month)
- MFA: SuperTokens Cloud (free tier: 5000 MAU)
- Package manager: pnpm

---

## File Structure

### New Files

```
lib/
  db/
    migrations/
      002_plans_schema.sql          # Plan/subscription tables
      003_add_mfa_columns.sql       # MFA columns to users
    seed/
      001_plans.sql                 # Seed plan data
  plans.ts                          # Plan types and helpers
  supertokens.ts                    # SuperTokens config
  resend.ts                         # Resend client
  email/
    templates/
      welcome.tsx                   # Welcome email template
      trial-ending.tsx              # Trial ending reminder
      threat-alert.tsx              # Security alert

components/
  dashboard/
    plan-provider.tsx               # Plan context provider
    plan-badge.tsx                  # Plan status display
    shield-panel.tsx                # Proteus Shield module
    guard-panel.tsx                 # VPN/Privacy module
    admin-panel.tsx                 # Admin panel (empresas)

app/
  api/
    user/
      plan/route.ts                 # GET user plan + features
    subscriptions/
      trial/route.ts                # POST start trial
      change/route.ts               # PUT change plan
    email/
      send/route.ts                 # POST send email (internal)

app/
  empresa/
    sobre-nosotros/page.tsx         # Already exists
    carreras/page.tsx               # Already exists
```

### Modified Files

```
lib/
  auth.ts                           # Add RS256 signing
  db.ts                             # No changes needed
init-db/
  001_schema.sql                    # Reference only
components/
  dashboard/
    proteus-dashboard.tsx           # Add PlanProvider, dynamic nav
    status-cards.tsx                # Adapt to plan features
    password-manager.tsx            # Add plan limits
middleware.ts                       # Add MFA check
app/
  api/
    auth/
      login/route.ts                # Add MFA flow
app/
  login/
    page.tsx                        # Add MFA verification step
.env.example                        # Add new env vars
package.json                        # Add dependencies
```

---

## Phase 1: Database & Plans

### Task 1: Create Plans Schema Migration

**Files:**
- Create: `lib/db/migrations/002_plans_schema.sql`

- [ ] **Step 1: Write migration file**

```sql
-- lib/db/migrations/002_plans_schema.sql
-- Plans table
CREATE TABLE IF NOT EXISTS plans (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  price_monthly DECIMAL(10,2) NOT NULL,
  trial_days INTEGER DEFAULT 14,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id INTEGER NOT NULL REFERENCES plans(id),
  status VARCHAR(20) DEFAULT 'trialing' CHECK (status IN ('trialing', 'active', 'canceled', 'expired')),
  trial_ends_at TIMESTAMP,
  current_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Plan features table
CREATE TABLE IF NOT EXISTS plan_features (
  id SERIAL PRIMARY KEY,
  plan_id INTEGER NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  feature_key VARCHAR(50) NOT NULL,
  enabled BOOLEAN DEFAULT true,
  config JSONB DEFAULT '{}',
  UNIQUE(plan_id, feature_key)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_plan_features_plan_id ON plan_features(plan_id);
```

- [ ] **Step 2: Verify migration syntax**

Run: `psql $DATABASE_URL -f lib/db/migrations/002_plans_schema.sql`
Expected: Tables created successfully

- [ ] **Step 3: Commit**

```bash
git add lib/db/migrations/002_plans_schema.sql
git commit -m "feat: add plans schema migration"
```

---

### Task 2: Seed Plan Data

**Files:**
- Create: `lib/db/seed/001_plans.sql`

- [ ] **Step 1: Write seed file**

```sql
-- lib/db/seed/001_plans.sql
-- Insert plans
INSERT INTO plans (name, slug, price_monthly, trial_days) VALUES
  ('Personal', 'personal', 4.99, 14),
  ('Familiar', 'familiar', 9.99, 14),
  ('Empresas', 'empresas', 24.99, 30)
ON CONFLICT (name) DO NOTHING;

-- Insert features for Personal plan
INSERT INTO plan_features (plan_id, feature_key, enabled, config) VALUES
  ((SELECT id FROM plans WHERE slug = 'personal'), 'shield', true, '{"max_devices": 1}'),
  ((SELECT id FROM plans WHERE slug = 'personal'), 'tune', true, '{}'),
  ((SELECT id FROM plans WHERE slug = 'personal'), 'vault', true, '{"max_entries": 50}'),
  ((SELECT id FROM plans WHERE slug = 'personal'), 'guard', false, '{}'),
  ((SELECT id FROM plans WHERE slug = 'personal'), 'vpn', false, '{}'),
  ((SELECT id FROM plans WHERE slug = 'personal'), 'admin_panel', false, '{}')
ON CONFLICT (plan_id, feature_key) DO NOTHING;

-- Insert features for Familiar plan
INSERT INTO plan_features (plan_id, feature_key, enabled, config) VALUES
  ((SELECT id FROM plans WHERE slug = 'familiar'), 'shield', true, '{"max_devices": 5}'),
  ((SELECT id FROM plans WHERE slug = 'familiar'), 'tune', true, '{}'),
  ((SELECT id FROM plans WHERE slug = 'familiar'), 'vault', true, '{"max_entries": -1}'),
  ((SELECT id FROM plans WHERE slug = 'familiar'), 'guard', true, '{}'),
  ((SELECT id FROM plans WHERE slug = 'familiar'), 'vpn', true, '{"unlimited": true}'),
  ((SELECT id FROM plans WHERE slug = 'familiar'), 'admin_panel', false, '{}')
ON CONFLICT (plan_id, feature_key) DO NOTHING;

-- Insert features for Empresas plan
INSERT INTO plan_features (plan_id, feature_key, enabled, config) VALUES
  ((SELECT id FROM plans WHERE slug = 'empresas'), 'shield', true, '{"max_devices": -1}'),
  ((SELECT id FROM plans WHERE slug = 'empresas'), 'tune', true, '{}'),
  ((SELECT id FROM plans WHERE slug = 'empresas'), 'vault', true, '{"max_entries": -1}'),
  ((SELECT id FROM plans WHERE slug = 'empresas'), 'guard', true, '{}'),
  ((SELECT id FROM plans WHERE slug = 'empresas'), 'vpn', true, '{"unlimited": true}'),
  ((SELECT id FROM plans WHERE slug = 'empresas'), 'admin_panel', true, '{}')
ON CONFLICT (plan_id, feature_key) DO NOTHING;
```

- [ ] **Step 2: Verify seed data**

Run: `psql $DATABASE_URL -f lib/db/seed/001_plans.sql`
Expected: 3 plans, 18 features inserted

- [ ] **Step 3: Commit**

```bash
git add lib/db/seed/001_plans.sql
git commit -m "feat: seed plan data"
```

---

### Task 3: Create Plan Types and Helpers

**Files:**
- Create: `lib/plans.ts`

- [ ] **Step 1: Write plan types and helpers**

```typescript
// lib/plans.ts
import pool from '@/lib/db'

export interface Plan {
  id: number
  name: string
  slug: string
  price_monthly: number
  trial_days: number
}

export interface PlanFeature {
  id: number
  plan_id: number
  feature_key: string
  enabled: boolean
  config: Record<string, unknown>
}

export interface Subscription {
  id: number
  user_id: number
  plan_id: number
  status: 'trialing' | 'active' | 'canceled' | 'expired'
  trial_ends_at: Date | null
  current_period_end: Date | null
  created_at: Date
}

export interface UserPlan {
  plan: Plan
  features: PlanFeature[]
  subscription: Subscription | null
}

export async function getPlanBySlug(slug: string): Promise<Plan | null> {
  const result = await pool.query('SELECT * FROM plans WHERE slug = $1', [slug])
  return result.rows[0] || null
}

export async function getPlanFeatures(planId: number): Promise<PlanFeature[]> {
  const result = await pool.query('SELECT * FROM plan_features WHERE plan_id = $1', [planId])
  return result.rows
}

export async function getUserSubscription(userId: number): Promise<Subscription | null> {
  const result = await pool.query(
    `SELECT * FROM subscriptions 
     WHERE user_id = $1 AND status IN ('trialing', 'active')
     ORDER BY created_at DESC LIMIT 1`,
    [userId]
  )
  return result.rows[0] || null
}

export async function getUserPlan(userId: number): Promise<UserPlan | null> {
  const subscription = await getUserSubscription(userId)
  
  if (!subscription) {
    // No subscription - default to personal plan (free tier)
    const plan = await getPlanBySlug('personal')
    if (!plan) return null
    const features = await getPlanFeatures(plan.id)
    return { plan, features, subscription: null }
  }

  const plan = await pool.query('SELECT * FROM plans WHERE id = $1', [subscription.plan_id])
  if (plan.rows.length === 0) return null

  const features = await getPlanFeatures(subscription.plan_id)
  return { plan: plan.rows[0], features, subscription }
}

export async function startTrial(userId: number, planSlug: string): Promise<Subscription> {
  const plan = await getPlanBySlug(planSlug)
  if (!plan) throw new Error('Plan not found')

  // Check if user already has active subscription
  const existing = await getUserSubscription(userId)
  if (existing) throw new Error('User already has active subscription')

  const trialEndsAt = new Date()
  trialEndsAt.setDate(trialEndsAt.getDate() + plan.trial_days)

  const result = await pool.query(
    `INSERT INTO subscriptions (user_id, plan_id, status, trial_ends_at)
     VALUES ($1, $2, 'trialing', $3)
     RETURNING *`,
    [userId, plan.id, trialEndsAt]
  )

  return result.rows[0]
}

export function isFeatureEnabled(features: PlanFeature[], featureKey: string): boolean {
  const feature = features.find(f => f.feature_key === featureKey)
  return feature?.enabled ?? false
}

export function getFeatureConfig(features: PlanFeature[], featureKey: string): Record<string, unknown> {
  const feature = features.find(f => f.feature_key === featureKey)
  return (feature?.config as Record<string, unknown>) ?? {}
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit lib/plans.ts`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add lib/plans.ts
git commit -m "feat: add plan types and helpers"
```

---

### Task 4: Create Plan API Endpoint

**Files:**
- Create: `app/api/user/plan/route.ts`

- [ ] **Step 1: Write GET endpoint**

```typescript
// app/api/user/plan/route.ts
import { NextResponse } from 'next/server'
import { getUserPlan } from '@/lib/plans'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    const userPlan = await getUserPlan(decoded.userId)

    if (!userPlan) {
      return NextResponse.json({ error: 'Plan no encontrado' }, { status: 404 })
    }

    return NextResponse.json({ userPlan })
  } catch {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
```

- [ ] **Step 2: Test endpoint**

Run: `curl -H "Cookie: proteus_token=$TOKEN" http://localhost:3000/api/user/plan`
Expected: `{ userPlan: { plan: {...}, features: [...], subscription: {...} } }`

- [ ] **Step 3: Commit**

```bash
git add app/api/user/plan/route.ts
git commit -m "feat: add user plan API endpoint"
```

---

### Task 5: Create Trial and Change Subscription Endpoints

**Files:**
- Create: `app/api/subscriptions/trial/route.ts`
- Create: `app/api/subscriptions/change/route.ts`

- [ ] **Step 1: Write trial endpoint**

```typescript
// app/api/subscriptions/trial/route.ts
import { NextResponse } from 'next/server'
import { startTrial } from '@/lib/plans'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    const { planSlug } = await request.json()

    if (!planSlug) {
      return NextResponse.json({ error: 'planSlug requerido' }, { status: 400 })
    }

    const subscription = await startTrial(decoded.userId, planSlug)
    return NextResponse.json({ subscription })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error del servidor'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
```

- [ ] **Step 2: Write change plan endpoint**

```typescript
// app/api/subscriptions/change/route.ts
import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getPlanBySlug, getUserSubscription } from '@/lib/plans'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

export async function PUT(request: Request) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    const { planSlug } = await request.json()

    if (!planSlug) {
      return NextResponse.json({ error: 'planSlug requerido' }, { status: 400 })
    }

    const newPlan = await getPlanBySlug(planSlug)
    if (!newPlan) {
      return NextResponse.json({ error: 'Plan no encontrado' }, { status: 404 })
    }

    const currentSub = await getUserSubscription(decoded.userId)
    if (!currentSub) {
      return NextResponse.json({ error: 'Sin suscripción activa' }, { status: 400 })
    }

    // Update subscription
    const result = await pool.query(
      `UPDATE subscriptions 
       SET plan_id = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [newPlan.id, currentSub.id]
    )

    return NextResponse.json({ subscription: result.rows[0] })
  } catch {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add app/api/subscriptions/trial/route.ts app/api/subscriptions/change/route.ts
git commit -m "feat: add trial and change subscription endpoints"
```

---

### Task 6: Create PlanProvider Component

**Files:**
- Create: `components/dashboard/plan-provider.tsx`

- [ ] **Step 1: Write PlanProvider**

```typescript
// components/dashboard/plan-provider.tsx
'use client'

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import type { UserPlan, PlanFeature } from '@/lib/plans'

interface PlanContextValue {
  plan: UserPlan['plan'] | null
  features: PlanFeature[]
  subscription: UserPlan['subscription'] | null
  isFeatureEnabled: (key: string) => boolean
  getFeatureConfig: (key: string) => Record<string, unknown>
  isLoading: boolean
  refresh: () => Promise<void>
}

const PlanContext = createContext<PlanContextValue | null>(null)

export function usePlan() {
  const context = useContext(PlanContext)
  if (!context) {
    throw new Error('usePlan must be used within PlanProvider')
  }
  return context
}

export function PlanProvider({ children }: { children: ReactNode }) {
  const [planData, setPlanData] = useState<UserPlan | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchPlan = useCallback(async () => {
    try {
      const res = await fetch('/api/user/plan')
      if (res.ok) {
        const data = await res.json()
        setPlanData(data.userPlan)
      }
    } catch {
      console.error('Failed to fetch plan')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPlan()
  }, [fetchPlan])

  const isFeatureEnabled = useCallback(
    (key: string) => {
      if (!planData) return false
      const feature = planData.features.find((f) => f.feature_key === key)
      return feature?.enabled ?? false
    },
    [planData]
  )

  const getFeatureConfig = useCallback(
    (key: string) => {
      if (!planData) return {}
      const feature = planData.features.find((f) => f.feature_key === key)
      return (feature?.config as Record<string, unknown>) ?? {}
    },
    [planData]
  )

  return (
    <PlanContext.Provider
      value={{
        plan: planData?.plan ?? null,
        features: planData?.features ?? [],
        subscription: planData?.subscription ?? null,
        isFeatureEnabled,
        getFeatureConfig,
        isLoading,
        refresh: fetchPlan,
      }}
    >
      {children}
    </PlanContext.Provider>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit components/dashboard/plan-provider.tsx`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add components/dashboard/plan-provider.tsx
git commit -m "feat: add PlanProvider component"
```

---

### Task 7: Create Plan Badge Component

**Files:**
- Create: `components/dashboard/plan-badge.tsx`

- [ ] **Step 1: Write PlanBadge**

```typescript
// components/dashboard/plan-badge.tsx
'use client'

import { usePlan } from './plan-provider'
import { ShieldCheck, Crown, Building2 } from 'lucide-react'

const planConfig = {
  personal: {
    label: 'Personal',
    icon: ShieldCheck,
    className: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
  },
  familiar: {
    label: 'Familiar',
    icon: Crown,
    className: 'bg-primary/10 text-primary border-primary/30',
  },
  empresas: {
    label: 'Empresas',
    icon: Building2,
    className: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
  },
}

export function PlanBadge() {
  const { plan, subscription, isLoading } = usePlan()

  if (isLoading || !plan) return null

  const config = planConfig[plan.slug as keyof typeof planConfig] || planConfig.personal
  const Icon = config.icon

  const statusText = subscription
    ? subscription.status === 'trialing'
      ? 'Prueba'
      : 'Activo'
    : 'Free'

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${config.className}`}>
      <Icon className="h-3 w-3" />
      {config.label}
      <span className="text-[10px] opacity-70">({statusText})</span>
    </span>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit components/dashboard/plan-badge.tsx`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add components/dashboard/plan-badge.tsx
git commit -m "feat: add PlanBadge component"
```

---

### Task 8: Integrate PlanProvider into Dashboard

**Files:**
- Modify: `components/dashboard/proteus-dashboard.tsx`

- [ ] **Step 1: Wrap dashboard with PlanProvider**

Find the export function and wrap with PlanProvider:

```typescript
// components/dashboard/proteus-dashboard.tsx
// Add import at top
import { PlanProvider, usePlan } from './plan-provider'
import { PlanBadge } from './plan-badge'

// Change export to wrap with PlanProvider
export function ProteusDashboard({ user }: { user: DashboardUser }) {
  return (
    <PlanProvider>
      <ProteusDashboardInner user={user} />
    </PlanProvider>
  )
}

// Rename original function
function ProteusDashboardInner({ user }: { user: DashboardUser }) {
  // Add usePlan hook
  const { isFeatureEnabled, plan } = usePlan()
  
  // ... rest of existing code
}
```

- [ ] **Step 2: Update navItems to filter by plan**

```typescript
// Inside ProteusDashboardInner, replace static navItems
const allNavItems = [
  { id: 'resumen', label: 'Resumen', icon: LayoutDashboard, featureKey: null },
  { id: 'contrasenas', label: 'Contraseñas', icon: KeyRound, featureKey: 'vault' },
  { id: 'optimizacion', label: 'Optimización', icon: Gauge, featureKey: 'tune' },
  { id: 'shield', label: 'Protección', icon: ShieldCheck, featureKey: 'shield' },
  { id: 'guard', label: 'Privacidad', icon: Shield, featureKey: 'guard' },
  { id: 'ajustes', label: 'Ajustes', icon: Settings, featureKey: null },
]

// Filter based on plan
const navItems = allNavItems.filter(item => 
  !item.featureKey || isFeatureEnabled(item.featureKey)
)
```

- [ ] **Step 3: Add PlanBadge to sidebar**

Find the sidebar plan section and replace hardcoded "Plan Pro":

```typescript
// Replace the hardcoded plan badge in sidebar
<div className="mt-auto rounded-lg border border-border bg-background/40 p-4">
  <PlanBadge />
  <p className="mt-1 text-xs text-muted-foreground">
    {plan?.name || 'Plan gratuito'}
  </p>
  {/* ... rest of sidebar */}
</div>
```

- [ ] **Step 4: Commit**

```bash
git add components/dashboard/proteus-dashboard.tsx
git commit -m "feat: integrate PlanProvider into dashboard"
```

---

## Checkpoint: Phase 1

- [ ] All migrations run successfully
- [ ] Seed data inserted
- [ ] Plan API returns correct data
- [ ] Dashboard displays plan badge
- [ ] Nav items filter by plan

---

## Phase 2: Auth & MFA (SuperTokens)

### Task 9: Install SuperTokens Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install dependencies**

Run: `pnpm add supertokens-node supertokens-auth-react supertokens-web-js`
Expected: Dependencies added to package.json

- [ ] **Step 2: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "deps: add supertokens dependencies"
```

---

### Task 10: Create SuperTokens Configuration

**Files:**
- Create: `lib/supertokens.ts`

- [ ] **Step 1: Write SuperTokens config**

```typescript
// lib/supertokens.ts
import SuperTokens from 'supertokens-node'
import EmailPassword from 'supertokens-node/recipe/emailpassword'
import TOTP from 'supertokens-node/recipe/totp'
import Session from 'supertokens-node/recipe/session'

// Initialize SuperTokens only if configured
export function initSuperTokens() {
  if (process.env.SUPERTOKENS_API_KEY) {
    SuperTokens.init({
      framework: 'custom',
      supertokens: {
        connectionURI: process.env.SUPERTOKENS_CONNECTION_URI || 'https://app.supertokens.com',
        apiKey: process.env.SUPERTOKENS_API_KEY,
      },
      appInfo: {
        appName: 'ProteusProtection',
        apiDomain: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        websiteDomain: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        apiBasePath: '/api/auth',
        websiteBasePath: '/auth',
      },
      recipeList: [
        EmailPassword.init(),
        TOTP.init(),
        Session.init(),
      ],
    })
  }
}

// Call init on module load
initSuperTokens()
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit lib/supertokens.ts`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add lib/supertokens.ts
git commit -m "feat: add SuperTokens configuration"
```

---

### Task 11: Add MFA Columns to Users Table

**Files:**
- Create: `lib/db/migrations/003_add_mfa_columns.sql`

- [ ] **Step 1: Write migration**

```sql
-- lib/db/migrations/003_add_mfa_columns.sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS mfa_enabled BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS mfa_secret VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS mfa_verified BOOLEAN DEFAULT false;
```

- [ ] **Step 2: Run migration**

Run: `psql $DATABASE_URL -f lib/db/migrations/003_add_mfa_columns.sql`
Expected: ALTER TABLE success

- [ ] **Step 3: Commit**

```bash
git add lib/db/migrations/003_add_mfa_columns.sql
git commit -m "feat: add MFA columns to users table"
```

---

### Task 12: Update Auth to Support RS256

**Files:**
- Modify: `lib/auth.ts`

- [ ] **Step 1: Update auth.ts for RS256**

```typescript
// lib/auth.ts
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import pool from '@/lib/db'
import { NextResponse } from 'next/server'
import * as fs from 'fs'
import * as path from 'path'

// RS256 key management
const PRIVATE_KEY_PATH = path.join(process.cwd(), 'keys', 'private.pem')
const PUBLIC_KEY_PATH = path.join(process.cwd(), 'keys', 'public.pem')

function getKey(): { privateKey: string; publicKey: string } {
  // In production, keys should be in environment variables or secret manager
  if (process.env.JWT_PRIVATE_KEY && process.env.JWT_PUBLIC_KEY) {
    return {
      privateKey: process.env.JWT_PRIVATE_KEY,
      publicKey: process.env.JWT_PUBLIC_KEY,
    }
  }
  
  // Fallback to HS256 for development
  return { privateKey: '', publicKey: '' }
}

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret'

export function signToken(userId: number, email: string) {
  const keys = getKey()
  
  if (keys.privateKey) {
    // RS256 signing
    return jwt.sign({ userId, email }, keys.privateKey, { 
      algorithm: 'RS256',
      expiresIn: '24h'  // Shorter expiry for rotation
    })
  }
  
  // Fallback to HS256
  return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '24h' })
}

export function verifyToken(token: string) {
  const keys = getKey()
  
  if (keys.publicKey) {
    return jwt.verify(token, keys.publicKey, { algorithms: ['RS256'] }) as { userId: number; email: string }
  }
  
  // Fallback to HS256
  return jwt.verify(token, JWT_SECRET) as { userId: number; email: string }
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12)
}

export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

export function getTokenFromRequest(request: Request): string | null {
  const cookie = request.headers.get('cookie') || ''
  const match = cookie.match(/proteus_token=([^;]+)/)
  return match ? match[1] : null
}

export function authResponse(user: { id: number; name: string; email: string }, token: string) {
  const res = NextResponse.json({ user: { id: user.id, name: user.name, email: user.email } })
  res.cookies.set('proteus_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60, // 24 hours for RS256 rotation
    path: '/',
  })
  return res
}
```

- [ ] **Step 2: Generate RS256 keys (for production)**

Create a script or document how to generate keys:
```bash
# Generate private key
openssl genpkey -algorithm RSA -out keys/private.pem -pkeyopt rsa_keygen_bits:2048

# Extract public key
openssl rsa -pubout -in keys/private.pem -out keys/public.pem
```

- [ ] **Step 3: Update .env.example**

```
# RS256 Keys (optional, falls back to HS256)
# JWT_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----
# JWT_PUBLIC_KEY=-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----
```

- [ ] **Step 4: Commit**

```bash
git add lib/auth.ts .env.example
git commit -m "feat: update auth to support RS256"
```

---

### Task 13: Add MFA Verification Step to Login

**Files:**
- Modify: `app/login/page.tsx`
- Create: `app/api/auth/mfa/verify/route.ts`

- [ ] **Step 1: Create MFA verification endpoint**

```typescript
// app/api/auth/mfa/verify/route.ts
import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { signToken, authResponse } from '@/lib/auth'
import { authenticator } from 'otplib'

export async function POST(request: Request) {
  try {
    const { userId, totpCode } = await request.json()

    if (!userId || !totpCode) {
      return NextResponse.json({ error: 'Código TOTP requerido' }, { status: 400 })
    }

    // Get user's MFA secret
    const result = await pool.query(
      'SELECT id, name, email, mfa_secret FROM users WHERE id = $1 AND mfa_enabled = true',
      [userId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'MFA no habilitado' }, { status: 400 })
    }

    const user = result.rows[0]
    
    // Verify TOTP code
    const isValid = authenticator.verify({
      token: totpCode,
      secret: user.mfa_secret,
    })

    if (!isValid) {
      return NextResponse.json({ error: 'Código inválido' }, { status: 401 })
    }

    // Issue JWT
    const token = signToken(user.id, user.email)
    return authResponse({ id: user.id, name: user.name, email: user.email }, token)
  } catch {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
```

- [ ] **Step 2: Update login page for MFA flow**

Add state for MFA verification step:

```typescript
// app/login/page.tsx
// Add new state
const [mfaRequired, setMfaRequired] = useState(false)
const [mfaUserId, setMfaUserId] = useState<number | null>(null)
const [totpCode, setTotpCode] = useState('')

// Update handleSubmit to handle MFA
async function handleSubmit(e: React.FormEvent) {
  e.preventDefault()
  if (!validate()) return

  setLoading(true)
  
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const data = await res.json()

    if (!res.ok) {
      sileo.error({ title: data.error || 'Error' })
      setLoading(false)
      return
    }

    // Check if MFA is required
    if (data.mfaRequired) {
      setMfaRequired(true)
      setMfaUserId(data.userId)
      setLoading(false)
      return
    }

    // No MFA - proceed to dashboard
    sileo.success({ title: '¡Bienvenido de vuelta!' })
    setTimeout(() => { window.location.href = '/dashboard' }, 600)
  } catch {
    sileo.error({ title: 'Error de conexión' })
    setLoading(false)
  }
}

// Add MFA verification handler
async function handleMfaVerify(e: React.FormEvent) {
  e.preventDefault()
  setLoading(true)

  try {
    const res = await fetch('/api/auth/mfa/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: mfaUserId, totpCode }),
    })

    const data = await res.json()

    if (!res.ok) {
      sileo.error({ title: data.error || 'Código inválido' })
      setLoading(false)
      return
    }

    sileo.success({ title: '¡Bienvenido de vuelta!' })
    setTimeout(() => { window.location.href = '/dashboard' }, 600)
  } catch {
    sileo.error({ title: 'Error de conexión' })
    setLoading(false)
  }
}
```

Add MFA form UI after the main form when `mfaRequired` is true:

```tsx
{mfaRequired && (
  <form onSubmit={handleMfaVerify} className="mt-4 space-y-4">
    <div>
      <label className="mb-1.5 block text-sm font-medium text-foreground">
        Código de verificación
      </label>
      <input
        type="text"
        value={totpCode}
        onChange={(e) => setTotpCode(e.target.value)}
        placeholder="000000"
        maxLength={6}
        className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <p className="mt-1 text-xs text-muted-foreground">
        Ingresa el código de tu app de autenticación
      </p>
    </div>
    <button
      type="submit"
      disabled={loading || totpCode.length !== 6}
      className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground shadow-[0_0_20px_-4px_var(--primary)] transition-all hover:bg-primary/90 hover:shadow-[0_0_28px_-2px_var(--primary)] disabled:pointer-events-none disabled:opacity-50"
    >
      {loading ? <Loader2 className="size-4 animate-spin" /> : 'Verificar'}
    </button>
  </form>
)}
```

- [ ] **Step 3: Update login API to detect MFA**

```typescript
// app/api/auth/login/route.ts
// After password validation, check if MFA is enabled
if (user.mfa_enabled) {
  return NextResponse.json({ mfaRequired: true, userId: user.id })
}
```

- [ ] **Step 4: Install otplib**

Run: `pnpm add otplib`
Expected: otplib added to package.json

- [ ] **Step 5: Commit**

```bash
git add app/login/page.tsx app/api/auth/mfa/verify/route.ts app/api/auth/login/route.ts package.json pnpm-lock.yaml
git commit -m "feat: add MFA verification flow"
```

---

### Task 14: Create MFA Setup Endpoint

**Files:**
- Create: `app/api/auth/mfa/setup/route.ts`

- [ ] **Step 1: Write MFA setup endpoint**

```typescript
// app/api/auth/mfa/setup/route.ts
import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'
import { authenticator } from 'otplib'

export async function POST(request: Request) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    const { action } = await request.json()

    if (action === 'generate') {
      // Generate new TOTP secret
      const secret = authenticator.generateSecret()
      const otpauth = authenticator.keyuri(decoded.email, 'ProteusProtection', secret)

      // Store secret temporarily (not enabled yet)
      await pool.query(
        'UPDATE users SET mfa_secret = $1 WHERE id = $2',
        [secret, decoded.userId]
      )

      return NextResponse.json({ secret, otpauth })
    }

    if (action === 'verify') {
      const { totpCode } = await request.json()
      
      // Get stored secret
      const result = await pool.query(
        'SELECT mfa_secret FROM users WHERE id = $1',
        [decoded.userId]
      )

      if (result.rows.length === 0 || !result.rows[0].mfa_secret) {
        return NextResponse.json({ error: 'Secret no encontrado' }, { status: 400 })
      }

      const secret = result.rows[0].mfa_secret
      const isValid = authenticator.verify({ token: totpCode, secret })

      if (!isValid) {
        return NextResponse.json({ error: 'Código inválido' }, { status: 400 })
      }

      // Enable MFA
      await pool.query(
        'UPDATE users SET mfa_enabled = true, mfa_verified = true WHERE id = $1',
        [decoded.userId]
      )

      return NextResponse.json({ success: true })
    }

    if (action === 'disable') {
      await pool.query(
        'UPDATE users SET mfa_enabled = false, mfa_secret = NULL, mfa_verified = false WHERE id = $1',
        [decoded.userId]
      )

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Acción inválida' }, { status: 400 })
  } catch {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit app/api/auth/mfa/setup/route.ts`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add app/api/auth/mfa/setup/route.ts
git commit -m "feat: add MFA setup endpoint"
```

---

### Task 15: Create MFA Settings UI

**Files:**
- Create: `components/dashboard/mfa-settings.tsx`

- [ ] **Step 1: Write MFA settings component**

```typescript
// components/dashboard/mfa-settings.tsx
'use client'

import { useState } from 'react'
import { Shield, ShieldCheck, Loader2 } from 'lucide-react'
import { usePlan } from './plan-provider'
import { sileo } from 'sileo'

export function MfaSettings() {
  const { plan } = usePlan()
  const [mfaEnabled, setMfaEnabled] = useState(false)
  const [setupStep, setSetupStep] = useState<'idle' | 'qr' | 'verify'>('idle')
  const [qrData, setQrData] = useState<{ secret: string; otpauth: string } | null>(null)
  const [totpCode, setTotpCode] = useState('')
  const [loading, setLoading] = useState(false)

  // Only show for Familiar+ plans
  if (!plan || plan.slug === 'personal') {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-lg font-semibold">Autenticación de dos factores</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Disponible en planes Familiar y Empresas.
        </p>
      </div>
    )
  }

  const handleSetup = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/mfa/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate' }),
      })
      const data = await res.json()
      setQrData(data)
      setSetupStep('qr')
    } catch {
      sileo.error({ title: 'Error al generar código' })
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/mfa/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify', totpCode }),
      })
      const data = await res.json()
      if (data.success) {
        setMfaEnabled(true)
        setSetupStep('idle')
        sileo.success({ title: 'MFA habilitado correctamente' })
      } else {
        sileo.error({ title: 'Código inválido' })
      }
    } catch {
      sileo.error({ title: 'Error al verificar' })
    } finally {
      setLoading(false)
    }
  }

  const handleDisable = async () => {
    setLoading(true)
    try {
      await fetch('/api/auth/mfa/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'disable' }),
      })
      setMfaEnabled(false)
      sileo.success({ title: 'MFA deshabilitado' })
    } catch {
      sileo.error({ title: 'Error al deshabilitar' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center gap-3">
        {mfaEnabled ? (
          <ShieldCheck className="h-6 w-6 text-success" />
        ) : (
          <Shield className="h-6 w-6 text-muted-foreground" />
        )}
        <div>
          <h3 className="text-lg font-semibold">Autenticación de dos factores</h3>
          <p className="text-sm text-muted-foreground">
            {mfaEnabled ? 'Protección adicional habilitada' : 'Añade una capa extra de seguridad'}
          </p>
        </div>
      </div>

      {setupStep === 'qr' && qrData && (
        <div className="mt-4 rounded-lg border border-border bg-background p-4">
          <p className="text-sm text-muted-foreground">
            Escanea este código con tu app de autenticación:
          </p>
          <div className="mt-2 flex justify-center">
            {/* QR Code would be rendered here */}
            <div className="rounded-lg bg-white p-4">
              <p className="text-xs text-black font-mono break-all">{qrData.otpauth}</p>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium">Código de verificación</label>
            <input
              type="text"
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value)}
              placeholder="000000"
              maxLength={6}
              className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
            />
          </div>
          <button
            onClick={handleVerify}
            disabled={loading || totpCode.length !== 6}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verificar y activar'}
          </button>
        </div>
      )}

      <div className="mt-4">
        {mfaEnabled ? (
          <button
            onClick={handleDisable}
            disabled={loading}
            className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive"
          >
            Deshabilitar MFA
          </button>
        ) : (
          <button
            onClick={handleSetup}
            disabled={loading}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Habilitar MFA'}
          </button>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Add MFA Settings to Dashboard Settings tab**

```typescript
// components/dashboard/proteus-dashboard.tsx
// Add import
import { MfaSettings } from './mfa-settings'

// In the ajuestes (settings) section, add MfaSettings
{active === 'ajustes' && (
  <div className="space-y-6">
    <section className="rounded-xl border border-border bg-card p-6">
      {/* Existing account settings */}
    </section>
    <MfaSettings />
  </div>
)}
```

- [ ] **Step 3: Commit**

```bash
git add components/dashboard/mfa-settings.tsx components/dashboard/proteus-dashboard.tsx
git commit -m "feat: add MFA settings UI"
```

---

## Checkpoint: Phase 2

- [ ] SuperTokens installed and configured
- [ ] RS256 auth working (with fallback)
- [ ] MFA columns added to DB
- [ ] MFA setup flow working
- [ ] MFA verification on login working
- [ ] MFA settings UI in dashboard

---

## Phase 3: Email Engine (Resend)

### Task 16: Install Resend Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install dependencies**

Run: `pnpm add resend @react-email/render`
Expected: Dependencies added to package.json

- [ ] **Step 2: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "deps: add resend dependencies"
```

---

### Task 17: Create Resend Configuration

**Files:**
- Create: `lib/resend.ts`

- [ ] **Step 1: Write Resend config**

```typescript
// lib/resend.ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export interface SendEmailParams {
  to: string | string[]
  subject: string
  from?: string
  react?: React.ReactNode
  html?: string
}

export async function sendEmail({ to, subject, from, react, html }: SendEmailParams) {
  const fromAddress = from || `Proteus Protection <no-reply@${process.env.RESEND_DOMAIN || 'proteusprotection.com'}>`

  try {
    const result = await resend.emails.send({
      from: fromAddress,
      to: Array.isArray(to) ? to : [to],
      subject,
      react,
      html,
    })
    return { success: true, id: result.data?.id }
  } catch (error) {
    console.error('Email send error:', error)
    return { success: false, error }
  }
}

export default resend
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit lib/resend.ts`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add lib/resend.ts
git commit -m "feat: add Resend configuration"
```

---

### Task 18: Create Email Templates

**Files:**
- Create: `lib/email/templates/welcome.tsx`
- Create: `lib/email/templates/trial-ending.tsx`
- Create: `lib/email/templates/threat-alert.tsx`
- Create: `lib/email/templates/index.ts`

- [ ] **Step 1: Write welcome template**

```tsx
// lib/email/templates/welcome.tsx
import { Heading, Text, Button, Container, Section } from '@react-email/components'

interface WelcomeEmailProps {
  name: string
}

export function WelcomeEmail({ name }: WelcomeEmailProps) {
  return (
    <Container style={{ fontFamily: 'sans-serif', padding: '20px' }}>
      <Section>
        <Heading style={{ fontSize: '24px', fontWeight: 'bold' }}>
          Bienvenido a Proteus Protection
        </Heading>
        <Text style={{ fontSize: '16px', lineHeight: '1.5' }}>
          Hola {name},
        </Text>
        <Text style={{ fontSize: '16px', lineHeight: '1.5' }}>
          Gracias por unirte a Proteus Protection. Tu dispositivo ya está siendo
          protegido por nuestra suite de seguridad.
        </Text>
        <Text style={{ fontSize: '16px', lineHeight: '1.5' }}>
          Tu prueba gratuita de 14 días ha comenzado. Tienes acceso a todas las
          funcionalidades de tu plan.
        </Text>
        <Button
          href={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`}
          style={{
            backgroundColor: '#0070f3',
            color: '#ffffff',
            padding: '12px 24px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 'bold',
          }}
        >
          Acceder al Dashboard
        </Button>
      </Section>
    </Container>
  )
}

export default WelcomeEmail
```

- [ ] **Step 2: Write trial ending template**

```tsx
// lib/email/templates/trial-ending.tsx
import { Heading, Text, Button, Container, Section } from '@react-email/components'

interface TrialEndingEmailProps {
  name: string
  daysRemaining: number
  planName: string
}

export function TrialEndingEmail({ name, daysRemaining, planName }: TrialEndingEmailProps) {
  return (
    <Container style={{ fontFamily: 'sans-serif', padding: '20px' }}>
      <Section>
        <Heading style={{ fontSize: '24px', fontWeight: 'bold' }}>
          Tu prueba termina pronto
        </Heading>
        <Text style={{ fontSize: '16px', lineHeight: '1.5' }}>
          Hola {name},
        </Text>
        <Text style={{ fontSize: '16px', lineHeight: '1.5' }}>
          Tu prueba gratuita del plan {planName} termina en {daysRemaining} día{daysRemaining !== 1 ? 's' : ''}.
        </Text>
        <Text style={{ fontSize: '16px', lineHeight: '1.5' }}>
          Para seguir disfrutando de la protección completa, elige un plan de pago.
        </Text>
        <Button
          href={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`}
          style={{
            backgroundColor: '#0070f3',
            color: '#ffffff',
            padding: '12px 24px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 'bold',
          }}
        >
          Ver planes
        </Button>
      </Section>
    </Container>
  )
}

export default TrialEndingEmail
```

- [ ] **Step 3: Write threat alert template**

```tsx
// lib/email/templates/threat-alert.tsx
import { Heading, Text, Container, Section } from '@react-email/components'

interface ThreatAlertEmailProps {
  name: string
  threatType: string
  deviceName: string
  timestamp: string
}

export function ThreatAlertEmail({ name, threatType, deviceName, timestamp }: ThreatAlertEmailProps) {
  return (
    <Container style={{ fontFamily: 'sans-serif', padding: '20px' }}>
      <Section>
        <Heading style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626' }}>
          ⚠️ Amenaza bloqueada
        </Heading>
        <Text style={{ fontSize: '16px', lineHeight: '1.5' }}>
          Hola {name},
        </Text>
        <Text style={{ fontSize: '16px', lineHeight: '1.5' }}>
          Hemos detectado y bloqueado una amenaza en tu dispositivo {deviceName}.
        </Text>
        <Section style={{ backgroundColor: '#fef2f2', padding: '16px', borderRadius: '8px' }}>
          <Text style={{ fontSize: '14px', margin: '0' }}>
            <strong>Tipo de amenaza:</strong> {threatType}
          </Text>
          <Text style={{ fontSize: '14px', margin: '8px 0 0 0' }}>
            <strong>Hora:</strong> {timestamp}
          </Text>
        </Section>
        <Text style={{ fontSize: '16px', lineHeight: '1.5' }}>
          Tu protección está funcionando correctamente. No se realizó ningún daño.
        </Text>
      </Section>
    </Container>
  )
}

export default ThreatAlertEmail
```

- [ ] **Step 4: Create index file**

```typescript
// lib/email/templates/index.ts
export { WelcomeEmail } from './welcome'
export { TrialEndingEmail } from './trial-ending'
export { ThreatAlertEmail } from './threat-alert'
```

- [ ] **Step 5: Commit**

```bash
git add lib/email/templates/
git commit -m "feat: add email templates"
```

---

### Task 19: Create Email API Endpoint

**Files:**
- Create: `app/api/email/send/route.ts`

- [ ] **Step 1: Write email send endpoint**

```typescript
// app/api/email/send/route.ts
import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/resend'
import { WelcomeEmail, TrialEndingEmail, ThreatAlertEmail } from '@/lib/email/templates'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

// Internal API - requires auth
export async function POST(request: Request) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    verifyToken(token) // Verify token is valid

    const { type, to, data } = await request.json()

    if (!type || !to || !data) {
      return NextResponse.json({ error: 'Parámetros requeridos' }, { status: 400 })
    }

    let subject = ''
    let react = null

    switch (type) {
      case 'welcome':
        subject = 'Bienvenido a Proteus Protection'
        react = WelcomeEmail(data)
        break
      case 'trial-ending':
        subject = `Tu prueba termina en ${data.daysRemaining} días`
        react = TrialEndingEmail(data)
        break
      case 'threat-alert':
        subject = '⚠️ Amenaza bloqueada en tu dispositivo'
        react = ThreatAlertEmail(data)
        break
      default:
        return NextResponse.json({ error: 'Tipo de email inválido' }, { status: 400 })
    }

    const result = await sendEmail({ to, subject, react })
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit app/api/email/send/route.ts`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add app/api/email/send/route.ts
git commit -m "feat: add email send API endpoint"
```

---

### Task 20: Add Welcome Email to Registration

**Files:**
- Modify: `app/api/auth/register/route.ts`

- [ ] **Step 1: Add welcome email after registration**

```typescript
// app/api/auth/register/route.ts
// Add import
import { sendEmail } from '@/lib/resend'
import { WelcomeEmail } from '@/lib/email/templates'

// After successful registration, before return
// Send welcome email (don't await - fire and forget)
sendEmail({
  to: user.email,
  subject: 'Bienvenido a Proteus Protection',
  react: WelcomeEmail({ name: user.name }),
}).catch(console.error)
```

- [ ] **Step 2: Commit**

```bash
git add app/api/auth/register/route.ts
git commit -m "feat: send welcome email on registration"
```

---

### Task 21: Update Environment Variables

**Files:**
- Modify: `.env.example`

- [ ] **Step 1: Add new env vars**

```
# Resend Email
RESEND_API_KEY=re_xxxxx
RESEND_DOMAIN=proteusprotection.com

# SuperTokens (optional)
SUPERTOKENS_API_KEY=
SUPERTOKENS_CONNECTION_URI=https://app.supertokens.com

# RS256 Keys (optional, falls back to HS256)
# JWT_PRIVATE_KEY=
# JWT_PUBLIC_KEY=

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

- [ ] **Step 2: Commit**

```bash
git add .env.example
git commit -m "feat: update environment variables"
```

---

## Checkpoint: Phase 3

- [ ] Resend installed and configured
- [ ] Email templates created
- [ ] Email API endpoint working
- [ ] Welcome email sent on registration
- [ ] Environment variables documented

---

## Phase 4: Polish & Testing

### Task 22: End-to-End Testing

- [ ] **Step 1: Test plan flow**

1. Register new user
2. Check default plan is Personal
3. Start trial for Familiar plan
4. Verify dashboard shows Familiar features
5. Change to Empresas plan
6. Verify admin panel appears

- [ ] **Step 2: Test MFA flow**

1. Login without MFA
2. Enable MFA in settings
3. Logout
4. Login again - should require TOTP
5. Enter valid code - should work
6. Enter invalid code - should fail

- [ ] **Step 3: Test email flow**

1. Register new user
2. Check welcome email received
3. Manually trigger trial ending email
4. Verify email content

- [ ] **Step 4: Commit test results**

```bash
git add .
git commit -m "test: add e2e test documentation"
```

---

### Task 23: Performance Optimization

- [ ] **Step 1: Add caching for plan data**

```typescript
// lib/plans.ts
// Add simple in-memory cache
const planCache = new Map<string, { data: UserPlan; expiry: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export async function getUserPlanCached(userId: number): Promise<UserPlan | null> {
  const cached = planCache.get(`user:${userId}`)
  if (cached && cached.expiry > Date.now()) {
    return cached.data
  }

  const plan = await getUserPlan(userId)
  if (plan) {
    planCache.set(`user:${userId}`, { data: plan, expiry: Date.now() + CACHE_TTL })
  }
  return plan
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/plans.ts
git commit -m "perf: add plan cache"
```

---

### Task 24: Documentation

- [ ] **Step 1: Update README with new features**

Add sections for:
- Plan system
- MFA setup
- Email configuration
- RS256 setup

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: update README with new features"
```

---

## Final Checkpoint

- [ ] All migrations run successfully
- [ ] Plan system working end-to-end
- [ ] MFA setup and verification working
- [ ] Emails sending correctly
- [ ] RS256 signing working (with HS256 fallback)
- [ ] Dashboard adapts to plan features
- [ ] All tests passing
- [ ] Documentation updated

---

## Environment Setup Summary

```bash
# 1. Run migrations
psql $DATABASE_URL -f lib/db/migrations/002_plans_schema.sql
psql $DATABASE_URL -f lib/db/migrations/003_add_mfa_columns.sql

# 2. Seed plan data
psql $DATABASE_URL -f lib/db/seed/001_plans.sql

# 3. Install dependencies
pnpm add supertokens-node supertokens-auth-react supertokens-web-js otplib resend @react-email/render

# 4. Generate RS256 keys (optional)
mkdir -p keys
openssl genpkey -algorithm RSA -out keys/private.pem -pkeyopt rsa_keygen_bits:2048
openssl rsa -pubout -in keys/private.pem -out keys/public.pem

# 5. Update .env with new variables
# See .env.example for required vars

# 6. Start dev server
pnpm dev
```
