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
