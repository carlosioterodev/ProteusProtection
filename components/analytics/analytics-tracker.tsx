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
