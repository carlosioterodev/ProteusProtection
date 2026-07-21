'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, Info } from 'lucide-react'
import { plans } from '@/lib/landing-data'
import { ActionButton } from '@/components/ui/action-button'
import { Reveal } from '@/components/landing/reveal'
import { cn } from '@/lib/utils'

export function Pricing() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [showTrialInfo, setShowTrialInfo] = useState<string | null>(null)

  const handlePlanSelect = (planName: string) => {
    setSelectedPlan((prev) => (prev === planName ? null : planName))
  }

  return (
    <section id="precios" className="relative py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-medium text-primary">Precios</span>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight md:text-4xl">
            Planes simples y transparentes
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
            Sin costos ocultos. Cancela cuando quieras. Todos los planes
            incluyen 14 días de prueba gratis.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {plans.map((plan, i) => (
            <Reveal
              key={plan.name}
              delay={i * 100}
              className={cn(
                'relative flex flex-col rounded-2xl border bg-card p-6 transition-all duration-300',
                plan.featured
                  ? 'border-primary/50 shadow-[0_0_40px_-12px_var(--primary)]'
                  : 'border-border',
                selectedPlan === plan.name && 'border-primary/70 ring-2 ring-primary/20'
              )}
            >
              {plan.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-[11px] font-semibold text-primary-foreground">
                  Recomendado
                </span>
              )}

              <h3 className="text-lg font-semibold">{plan.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {plan.description}
              </p>

              <div className="mt-5 flex items-baseline gap-1">
                <span className="text-4xl font-semibold tracking-tight">
                  {plan.price}
                </span>
                <span className="text-sm text-muted-foreground">
                  {plan.period}
                </span>
              </div>

              {/* Trial info toggle */}
              <div className="mt-3">
                <button
                  onClick={() => setShowTrialInfo((prev) => (prev === plan.name ? null : plan.name))}
                  className="inline-flex items-center gap-1 text-xs text-primary/80 transition-colors hover:text-primary"
                >
                  <Info className="h-3 w-3" />
                  {plan.trialDays} días de prueba gratis
                </button>
                {showTrialInfo === plan.name && (
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    Prueba gratuita de {plan.trialDays} días. Sin tarjeta de crédito requerida.
                    Cancela en cualquier momento durante el periodo de prueba.
                  </p>
                )}
              </div>

              {/* Detailed description */}
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {plan.detailedDescription}
              </p>

              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-7 space-y-2">
                <Link href="/dashboard" className="block">
                  <ActionButton
                    variant={plan.featured ? 'primary' : 'secondary'}
                    size="lg"
                    className="w-full"
                    onClick={() => handlePlanSelect(plan.name)}
                  >
                    {selectedPlan === plan.name ? 'Seleccionado' : plan.cta}
                  </ActionButton>
                </Link>
                {selectedPlan === plan.name && (
                  <p className="text-center text-xs text-muted-foreground">
                    Prueba de {plan.trialDays} días iniciada
                  </p>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
