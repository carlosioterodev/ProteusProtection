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
