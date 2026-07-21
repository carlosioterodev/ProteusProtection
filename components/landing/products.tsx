'use client'

import { useState } from 'react'
import { ArrowRight, ChevronDown, ChevronUp } from 'lucide-react'
import { products } from '@/lib/landing-data'
import { Reveal } from '@/components/landing/reveal'
import { cn } from '@/lib/utils'

export function Products() {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  return (
    <section id="productos" className="relative py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-medium text-primary">Nuestra suite</span>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight md:text-4xl">
            Soluciones de seguridad para cada necesidad
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
            Cuatro productos que trabajan juntos para blindar tus dispositivos,
            tu identidad y tu rendimiento.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2">
          {products.map((product, i) => {
            const Icon = product.icon
            const isExpanded = expandedId === product.id
            return (
              <Reveal
                key={product.id}
                as="article"
                delay={i * 90}
                className={cn(
                  'group relative flex flex-col rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/40',
                  isExpanded && 'border-primary/50 sm:col-span-2'
                )}
              >
                {product.tag && (
                  <span className="absolute right-5 top-5 rounded-full bg-primary/15 px-2.5 py-1 text-[11px] font-medium text-primary ring-1 ring-primary/30">
                    {product.tag}
                  </span>
                )}
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20 transition-transform duration-300 group-hover:scale-110">
                  <Icon className="h-6 w-6" />
                </span>

                <h3 className="mt-5 text-lg font-semibold">{product.name}</h3>
                <p className="mt-0.5 text-sm font-medium text-primary/90">
                  {product.tagline}
                </p>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {product.description}
                </p>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="mt-4 border-t border-border pt-4">
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {product.detailedDescription}
                    </p>
                    <ul className="mt-4 space-y-2">
                      {product.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                  <span className="text-xs font-medium text-foreground">
                    {product.highlight}
                  </span>
                  <button
                    onClick={() => toggleExpand(product.id)}
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
                  >
                    {isExpanded ? 'Cerrar' : 'Explorar'}
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 transition-transform duration-200" />
                    ) : (
                      <ChevronDown className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                    )}
                  </button>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
