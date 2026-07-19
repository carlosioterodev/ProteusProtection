'use client'

import { useEffect, useRef, useState } from 'react'
import { animate } from 'animejs'
import { Gauge, Sparkles, Trash2, Cpu, HardDrive, Loader2 } from 'lucide-react'
import { ActionButton } from '@/components/ui/action-button'
import { sileo } from 'sileo'

const RADIUS = 84
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

interface OptimizationPanelProps {
  onOptimized: () => void
}

export function OptimizationPanel({ onOptimized }: OptimizationPanelProps) {
  const [health, setHealth] = useState(0)
  const [cleaning, setCleaning] = useState(false)
  const arcRef = useRef<SVGCircleElement>(null)
  const displayRef = useRef<HTMLSpanElement>(null)
  const progressObj = useRef({ value: 0 })

  const renderArc = (value: number) => {
    if (arcRef.current) {
      const offset = CIRCUMFERENCE - (value / 100) * CIRCUMFERENCE
      arcRef.current.style.strokeDashoffset = String(offset)
    }
    if (displayRef.current) {
      displayRef.current.textContent = String(Math.round(value))
    }
  }

  // Initial state at 0
  useEffect(() => {
    renderArc(0)
  }, [])

  const handleClean = () => {
    if (cleaning) return
    setCleaning(true)
    sileo.info({
      title: 'Optimización iniciada',
      description: 'Analizando archivos temporales y procesos en segundo plano...',
    })

    const from = progressObj.current.value
    animate(progressObj.current, {
      value: 100,
      duration: 2600,
      ease: 'inOut(2)',
      onUpdate: () => renderArc(progressObj.current.value),
      onComplete: () => {
        setHealth(100)
        setCleaning(false)
        onOptimized()
        sileo.success({
          title: 'Sistema optimizado',
          description: 'Se liberaron 2.4 GB y el rendimiento es óptimo (100%).',
        })
      },
    })
    // avoid unused warning while keeping intent explicit
    void from
  }

  const metrics = [
    { label: 'Uso de CPU', value: cleaning ? 'Optimizando' : '18%', icon: Cpu },
    { label: 'Almacenamiento', value: cleaning ? 'Limpiando' : '2.4 GB libres', icon: HardDrive },
    { label: 'Procesos', value: cleaning ? 'Depurando' : '112 activos', icon: Sparkles },
  ]

  const arcColor =
    health >= 85 ? 'var(--success)' : health >= 60 ? 'var(--primary)' : 'var(--warning)'

  return (
    <section
      aria-labelledby="opt-heading"
      className="flex h-full flex-col rounded-xl border border-border bg-card p-5"
    >
      <header className="flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Gauge className="size-5" aria-hidden="true" />
        </span>
        <div>
          <h2 id="opt-heading" className="text-base font-semibold text-card-foreground">
            Optimización del sistema
          </h2>
          <p className="text-xs text-muted-foreground">Salud y rendimiento</p>
        </div>
      </header>

      <div className="mt-6 flex flex-col items-center">
        <div className="relative">
          <svg width="200" height="200" viewBox="0 0 200 200" className="-rotate-90">
            <circle
              cx="100"
              cy="100"
              r={RADIUS}
              fill="none"
              stroke="var(--muted)"
              strokeWidth="14"
            />
            <circle
              ref={arcRef}
              cx="100"
              cy="100"
              r={RADIUS}
              fill="none"
              stroke={arcColor}
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={CIRCUMFERENCE}
              style={{ transition: 'stroke 0.4s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              ref={displayRef}
              className="font-mono text-4xl font-semibold text-card-foreground"
            >
              62
            </span>
            <span className="text-xs uppercase tracking-wide text-muted-foreground">
              Salud
            </span>
          </div>
        </div>
      </div>

      <dl className="mt-6 grid grid-cols-3 gap-2">
        {metrics.map((m) => {
          const Icon = m.icon
          return (
            <div
              key={m.label}
              className="rounded-lg border border-border bg-background/40 p-3 text-center"
            >
              <Icon className="mx-auto size-4 text-primary" aria-hidden="true" />
              <dt className="mt-1.5 text-[11px] text-muted-foreground">{m.label}</dt>
              <dd className="mt-0.5 text-xs font-medium text-card-foreground">{m.value}</dd>
            </div>
          )
        })}
      </dl>

      <ActionButton
        variant="primary"
        size="lg"
        onClick={handleClean}
        disabled={cleaning}
        className="mt-6 w-full"
      >
        {cleaning ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Limpiando sistema...
          </>
        ) : (
          <>
            <Trash2 className="size-4" aria-hidden="true" />
            Limpiar sistema
          </>
        )}
      </ActionButton>
    </section>
  )
}
