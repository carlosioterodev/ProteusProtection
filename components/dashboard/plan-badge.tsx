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
