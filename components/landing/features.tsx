'use client'

import { features } from '@/lib/landing-data'
import { Reveal } from '@/components/landing/reveal'

export function Features() {
  return (
    <section id="caracteristicas" className="relative py-20 md:py-28">
      <div className="cyber-grid pointer-events-none absolute inset-0 opacity-30" />
      <div className="relative mx-auto max-w-6xl px-4 md:px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <span className="text-sm font-medium text-primary">
              Por qué Proteus
            </span>
            <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight md:text-4xl">
              Tecnología de nivel empresarial, simple para todos
            </h2>
            <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
              Combinamos inteligencia artificial, cifrado militar y una interfaz
              minimalista para que tu seguridad funcione sin que tengas que
              pensar en ella.
            </p>

            <ul className="mt-8 space-y-4">
              {[
                'Instalación en menos de 2 minutos',
                'Sin ralentizar tus equipos',
                'Panel único para todos tus dispositivos',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span className="text-sm text-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-2">
            {features.map((feature, i) => {
              const Icon = feature.icon
              return (
                <Reveal
                  key={feature.title}
                  delay={i * 90}
                  className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-sm font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </Reveal>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
