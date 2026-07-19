'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { animate, createTimeline } from 'animejs'
import { ShieldCheck, Sparkles } from 'lucide-react'
import { ActionButton } from '@/components/ui/action-button'
import { stats } from '@/lib/landing-data'

export function Hero() {
  const badgeRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const artRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const targets = [
      badgeRef.current,
      titleRef.current,
      subRef.current,
      ctaRef.current,
    ].filter(Boolean) as HTMLElement[]

    const tl = createTimeline({
      defaults: { ease: 'out(3)', duration: 750 },
    })
    tl.add(targets, {
      opacity: [0, 1],
      translateY: [26, 0],
      delay: (_, i) => 120 * i,
    })

    if (artRef.current) {
      animate(artRef.current, {
        opacity: [0, 1],
        scale: [0.92, 1],
        duration: 900,
        ease: 'out(4)',
      })
      animate(artRef.current, {
        translateY: [0, -14],
        duration: 3200,
        direction: 'alternate',
        loop: true,
        ease: 'inOut(2)',
      })
    }
  }, [])

  return (
    <section className="relative overflow-hidden pt-28 pb-16 md:pt-36 md:pb-24">
      <div className="cyber-grid pointer-events-none absolute inset-0 opacity-60" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 md:px-6 lg:grid-cols-2">
        <div>
          <div
            ref={badgeRef}
            className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary opacity-0"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Seguridad digital impulsada por IA
          </div>

          <h1
            ref={titleRef}
            className="mt-5 text-balance text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl opacity-0"
          >
            Protege lo que importa,{' '}
            <span className="text-primary">sin complicaciones</span>
          </h1>

          <p
            ref={subRef}
            className="mt-5 max-w-lg text-pretty text-base leading-relaxed text-muted-foreground md:text-lg opacity-0"
          >
            Proteus Protection reúne antivirus, gestor de contraseñas y
            optimización del sistema en una sola plataforma. Rápida, confiable y
            diseñada para darte tranquilidad total.
          </p>

          <div ref={ctaRef} className="mt-8 flex flex-col gap-3 sm:flex-row opacity-0">
            <Link href="/dashboard">
              <ActionButton variant="primary" size="lg" className="w-full sm:w-auto">
                <ShieldCheck className="h-4 w-4" />
                Comenzar prueba gratis
              </ActionButton>
            </Link>
            <a href="#productos">
              <ActionButton variant="ghost" size="lg" className="w-full sm:w-auto">
                Ver productos
              </ActionButton>
            </a>
          </div>

          <dl className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label}>
                <dt className="text-2xl font-semibold text-foreground">
                  {s.value}
                </dt>
                <dd className="mt-1 text-xs text-muted-foreground">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div ref={artRef} className="relative mx-auto max-w-md opacity-0 lg:max-w-none">
          <div className="absolute inset-0 -z-10 rounded-full bg-primary/15 blur-3xl" />
          <Image
            src="/images/hero-shield.png"
            alt="Escudo digital de seguridad de Proteus Protection"
            width={720}
            height={720}
            priority
            className="h-auto w-full select-none"
          />
        </div>
      </div>
    </section>
  )
}
