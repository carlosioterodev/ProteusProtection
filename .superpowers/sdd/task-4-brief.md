# Task 4: Client-Side Tracking Component

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
