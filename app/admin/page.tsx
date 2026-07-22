'use client'

import { useEffect, useState } from 'react'
import { KpiCards } from '@/components/admin/kpi-cards'
import { VisitChart } from '@/components/admin/visit-chart'
import { TopPages } from '@/components/admin/top-pages'

interface AdminAnalytics {
  kpis: {
    visitsToday: number
    uniqueVisitors: number
    totalVisits: number
    totalUsers: number
    activeSubscriptions: number
  }
  grouped: { label: string; count: number; percentage: number }[]
  daily: { date: string; count: number }[]
}

export default function AdminOverviewPage() {
  const [data, setData] = useState<AdminAnalytics | null>(null)

  useEffect(() => {
    fetch('/api/admin/analytics?period=30d&group=page')
      .then((res) => res.json())
      .then(setData)
      .catch(() => {})
  }, [])

  if (!data) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <KpiCards {...data.kpis} />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <VisitChart data={data.daily} />
        </div>
        <div className="xl:col-span-1">
          <TopPages data={data.grouped} />
        </div>
      </div>
    </div>
  )
}
