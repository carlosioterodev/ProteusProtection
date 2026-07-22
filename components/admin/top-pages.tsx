'use client'

interface PageStat {
  label: string
  count: number
  percentage: number
}

export function TopPages({ data }: { data: PageStat[] }) {
  const top5 = data.slice(0, 5)

  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <h2 className="text-base font-semibold text-card-foreground">
        Páginas más visitadas
      </h2>
      <div className="mt-4 space-y-3">
        {top5.length === 0 && (
          <p className="text-sm text-muted-foreground">Sin datos aún</p>
        )}
        {top5.map((page) => (
          <div key={page.label} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-mono text-card-foreground">{page.label}</span>
              <span className="text-muted-foreground">{page.count}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary/60"
                style={{ width: `${page.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
