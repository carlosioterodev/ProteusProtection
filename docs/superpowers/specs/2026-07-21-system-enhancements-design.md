# Design Spec: ProteusProtection System Enhancements

**Date**: 2026-07-21
**Status**: Approved
**Author**: opencode + Carlos Otero

## Overview

Enhance ProteusProtection with four interconnected subsystems:
1. Dynamic plan processing and adaptive dashboard
2. Multi-factor authentication (MFA) via SuperTokens
3. Security improvements (RS256, token rotation)
4. Email engine via Resend

**Approach**: Incremental migration - preserve existing JWT auth, add SuperTokens for MFA, Resend for email.

---

## 1. Database Schema & Plan Logic

### New Tables

```sql
-- Available subscription plans
CREATE TABLE plans (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,        -- 'personal', 'familiar', 'empresas'
  price_monthly DECIMAL(10,2) NOT NULL,
  trial_days INTEGER DEFAULT 14,
  features JSONB NOT NULL,                  -- [{id, name, enabled}]
  created_at TIMESTAMP DEFAULT NOW()
);

-- User subscriptions
CREATE TABLE subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  plan_id INTEGER NOT NULL REFERENCES plans(id),
  status VARCHAR(20) DEFAULT 'trialing',   -- 'trialing', 'active', 'canceled', 'expired'
  trial_ends_at TIMESTAMP,
  current_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Features available per plan
CREATE TABLE plan_features (
  id SERIAL PRIMARY KEY,
  plan_id INTEGER NOT NULL REFERENCES plans(id),
  feature_key VARCHAR(50) NOT NULL,        -- 'shield', 'vault', 'tune', 'guard', 'vpn', 'admin_panel'
  enabled BOOLEAN DEFAULT true,
  UNIQUE(plan_id, feature_key)
);
```

### Seed Data

**Plan Personal ($4.99/mes)**:
- shield: true
- tune: true
- vault: true (básico)
- guard: false
- vpn: false
- admin_panel: false

**Plan Familiar ($9.99/mes)**:
- shield: true
- tune: true
- vault: true
- guard: true
- vpn: true
- admin_panel: false

**Plan Empresas ($24.99/mes)**:
- shield: true
- tune: true
- vault: true
- guard: true
- vpn: true
- admin_panel: true

### API Endpoints

```
GET /api/user/plan
  → { plan: Plan, features: Feature[], subscription: Subscription }

POST /api/subscriptions/trial
  → Starts trial for user with specified plan

PUT /api/subscriptions/change
  → Changes user's plan
```

---

## 2. Adaptive Dashboard

### PlanProvider Context

```typescript
// components/dashboard/plan-provider.tsx
interface PlanContext {
  plan: Plan | null
  features: Feature[]
  isFeatureEnabled: (key: string) => boolean
  isLoading: boolean
}

// Provides plan context to all dashboard components
```

### Dashboard Adaptations

| Component | Personal | Familiar | Empresas |
|-----------|----------|----------|----------|
| StatusCards | Basic stats | Full stats | Full + admin |
| PasswordManager | 5 entries max | Unlimited | Unlimited |
| OptimizationPanel | ✓ | ✓ | ✓ |
| ShieldPanel | ✓ | ✓ | ✓ |
| GuardPanel (VPN) | ✗ | ✓ | ✓ |
| AdminPanel | ✗ | ✗ | ✓ |

### Sidebar Dynamic Filtering

```typescript
// Filter nav items based on plan features
const navItems = allNavItems.filter(item => 
  planFeatures.includes(item.featureKey)
)
```

---

## 3. Authentication & MFA (SuperTokens)

### Integration Strategy

Incremental integration - SuperTokens handles MFA, existing JWT remains for API auth.

### Configuration

- **Service**: SuperTokens Cloud (free tier: 5000 MAU)
- **Backend SDK**: `supertokens-node`
- **Frontend SDK**: `supertokens-auth-react`
- **Features**: Email/password + TOTP MFA

### Database Changes

```sql
-- MFA configuration per user
ALTER TABLE users ADD COLUMN mfa_enabled BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN mfa_secret VARCHAR(255); -- Encrypted TOTP secret
```

### Auth Flow

```
1. User logs in → Standard JWT issued
2. If MFA enabled → Redirect to TOTP verification
3. SuperTokens manages MFA session
4. JWT maintained for internal APIs
5. If no MFA → Dashboard direct access
```

### Security Improvements

- **RS256**: Asymmetric JWT signing (public/private key pair)
- **Token Rotation**: Refresh every 24 hours
- **Refresh Tokens**: Managed by SuperTokens

### Environment Variables

```
SUPERTOKENS_API_KEY=xxxxx
SUPERTOKENS_CONNECTION_URI=https://app.supertokens.com
SUPERTOKENS_APP_NAME=ProteusProtection
```

---

## 4. Email Engine (Resend)

### Integration

```typescript
import { Resend } from 'resend'
const resend = new Resend(process.env.RESEND_API_KEY)
```

### Email Types

**Transactional (automatic)**:
- Email verification
- Password reset
- Subscription confirmation
- Security alerts (threats blocked)

**Marketing (periodic)**:
- Monthly newsletter
- Product updates
- Plan promotions

### Templates

```typescript
// lib/email/templates.ts
export const templates = {
  welcome: { subject: 'Bienvenido a Proteus Protection', component: WelcomeEmail },
  trialEnding: { subject: 'Tu prueba termina en 3 días', component: TrialEndingEmail },
  threatAlert: { subject: 'Amenaza bloqueada en tu dispositivo', component: ThreatAlertEmail },
}
```

### Automations

- Welcome on registration
- Trial ending reminder (3 days before)
- Threat blocked alert (when Shield is implemented)
- Plan change confirmation

### Environment Variables

```
RESEND_API_KEY=re_xxxxx
RESEND_DOMAIN=proteusprotection.com
```

---

## Implementation Order

### Phase 1: Database & Plans (Week 1)
1. Create migration for new tables
2. Seed plan data
3. Build API endpoints for plan management
4. Update dashboard to use plan context

### Phase 2: Auth & MFA (Week 2)
1. Integrate SuperTokens backend SDK
2. Add TOTP MFA to login flow
3. Implement RS256 JWT signing
4. Add token rotation

### Phase 3: Email (Week 3)
1. Integrate Resend SDK
2. Create email templates
3. Set up transactional emails
4. Add marketing email automation

### Phase 4: Polish & Testing (Week 4)
1. End-to-end testing
2. Performance optimization
3. Documentation
4. Deployment configuration

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| SuperTokens free tier limit | Medium | Monitor usage, upgrade path ready |
| Resend free tier limit | Low | 100k emails/month is generous |
| JWT migration complexity | Medium | Incremental approach, fallback to old JWT |
| DB migration downtime | Low | Use transactional migrations |

---

## Open Questions

- None - all requirements clarified with user

---

## Approval

- [x] Database Schema & Plans
- [x] Adaptive Dashboard
- [x] Auth & MFA (SuperTokens)
- [x] Email Engine (Resend)

**Status**: Ready for implementation planning
