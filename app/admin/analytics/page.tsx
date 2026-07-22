'use client'

import { useEffect, useState, useCallback } from 'react'
import { AnalyticsTable } from '@/components/admin/analytics-table'
import { cn } from '@/lib/utils'

const periods = [
  { key: '24h', label: '24 horas' },
  { key: '7d', label: '7 días' },
  { key: '30d', label: '30 días' },
  { key: 'all', label: 'Todo' },
] as const

const groups = [
  { key: 'browser', label: 'Navegadores' },
  { key: 'os', label: 'Sistemas operativos' },
  { key: 'device', label: 'Dispositivos' },
  { key: 'country', label: 'Países' },
  { key: 'page', label: 'Páginas' },
] as const

export default function AdminAnalyticsPage() {
  const [period, setPeriod] = useState<string>('7d')
  const [group, setGroup] = useState<string>('browser')
  const [data, setData] = useState<{ label: string; count: number; percentage: number }[]>([])

  const fetchData = useCallback(async () => {
    const res = await fetch(`/api/admin/analytics?period=${period}&group=${group}`)
    if (res.ok) {
      const json = await res.json()
      setData(json.grouped)
    }
  }, [period, group])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <div className="space-y-6">
      {/* Period selector */}
      <div className="flex flex-wrap gap-2">
        {periods.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => setPeriod(p.key)}
            className={cn(
              'rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
              period === p.key
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Group tabs */}
      <div className="flex flex-wrap gap-2">
        {groups.map((g) => (
          <button
            key={g.key}
            type="button"
            onClick={() => setGroup(g.key)}
            className={cn(
              'rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
              group === g.key
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            {g.label}
          </button>
        ))}
      </div>

      {/* Data table */}
      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-base font-semibold text-card-foreground">
          {groups.find((g) => g.key === group)?.label}
        </h2>
        <div className="mt-4">
          <AnalyticsTable data={data} />
        </div>
      </section>
    </div>
  )
}
