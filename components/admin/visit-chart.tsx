'use client'

interface DailyVisit {
  date: string
  count: number
}

export function VisitChart({ data }: { data: DailyVisit[] }) {
  const maxCount = Math.max(...data.map((d) => d.count), 1)

  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <h2 className="text-base font-semibold text-card-foreground">
        Visitas por día (últimos 30 días)
      </h2>
      <div className="mt-4 flex items-end gap-1" style={{ height: 160 }}>
        {data.map((day) => {
          const height = maxCount > 0 ? (day.count / maxCount) * 100 : 0
          const date = new Date(day.date)
          const label = `${date.getDate()}/${date.getMonth() + 1}`
          return (
            <div
              key={day.date}
              className="group flex flex-1 flex-col items-center gap-1"
            >
              <span className="hidden text-[10px] text-muted-foreground group-hover:block">
                {day.count}
              </span>
              <div
                className="w-full rounded-t-sm bg-primary/60 transition-colors hover:bg-primary"
                style={{ height: `${Math.max(height, 2)}%` }}
                title={`${label}: ${day.count} visitas`}
              />
              <span className="text-[9px] text-muted-foreground">{label}</span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
