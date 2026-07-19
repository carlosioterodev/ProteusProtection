'use client'

import { useEffect, useRef } from 'react'
import { animate, createTimeline } from 'animejs'
import { ShieldCheck, Clock3, KeyRound, Activity } from 'lucide-react'

interface StatusCardsProps {
  passwordCount: number
  lastOptimization: string
  protectionActive: boolean
  threatsBlocked: number
}

export function StatusCards({
  passwordCount,
  lastOptimization,
  protectionActive,
  threatsBlocked,
}: StatusCardsProps) {
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
    {
      label: 'Estado de protección',
      value: protectionActive ? 'Activa' : 'Inactiva',
      hint: 'Monitoreo en tiempo real',
      icon: ShieldCheck,
      tone: protectionActive ? 'text-success' : 'text-destructive',
      glow: protectionActive ? 'bg-success/10' : 'bg-destructive/10',
      pulse: protectionActive,
    },
    {
      label: 'Última optimización',
      value: lastOptimization,
      hint: 'Sistema depurado',
      icon: Clock3,
      tone: 'text-primary',
      glow: 'bg-primary/10',
      pulse: false,
    },
    {
      label: 'Contraseñas guardadas',
      value: String(passwordCount),
      hint: 'Bóveda cifrada AES-256',
      icon: KeyRound,
      tone: 'text-warning',
      glow: 'bg-warning/10',
      pulse: false,
    },
    {
      label: 'Amenazas bloqueadas',
      value: String(threatsBlocked),
      hint: 'Últimos 30 días',
      icon: Activity,
      tone: 'text-primary',
      glow: 'bg-primary/10',
      pulse: false,
    },
  ]

  return (
    <div
      ref={gridRef}
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
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
                  {card.value}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{card.hint}</p>
              </div>
              <span
                className={`relative flex size-11 shrink-0 items-center justify-center rounded-lg ${card.glow}`}
              >
                <Icon className={`size-5 ${card.tone}`} aria-hidden="true" />
                {card.pulse ? (
                  <span className="absolute right-1 top-1 flex size-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                    <span className="relative inline-flex size-2 rounded-full bg-success" />
                  </span>
                ) : null}
              </span>
            </div>
          </article>
        )
      })}
    </div>
  )
}
