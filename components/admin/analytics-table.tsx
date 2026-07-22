'use client'

interface AnalyticsRow {
  label: string
  count: number
  percentage: number
}

export function AnalyticsTable({ data }: { data: AnalyticsRow[] }) {
  return (
    <div className="space-y-2">
      {data.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Sin datos para este período
        </p>
      )}
      {data.map((row) => (
        <div
          key={row.label}
          className="flex items-center gap-4 rounded-lg border border-border bg-background p-3"
        >
          <span className="min-w-[120px] font-mono text-sm text-card-foreground">
            {row.label}
          </span>
          <div className="flex-1">
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary/60"
                style={{ width: `${row.percentage}%` }}
              />
            </div>
          </div>
          <span className="min-w-[60px] text-right text-sm text-muted-foreground">
            {row.count}
          </span>
          <span className="min-w-[40px] text-right text-xs text-muted-foreground">
            {row.percentage}%
          </span>
        </div>
      ))}
    </div>
  )
}
