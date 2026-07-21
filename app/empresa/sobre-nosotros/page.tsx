'use client'

import Link from 'next/link'
import { Shield, Users, Target, Heart } from 'lucide-react'
import { Reveal } from '@/components/landing/reveal'

const values = [
  {
    icon: Shield,
    title: 'Seguridad primero',
    description:
      'Cada decisión que tomamos prioriza la protección de nuestros usuarios. No hay atajos cuando se trata de seguridad.',
  },
  {
    icon: Users,
    title: 'Orientados al usuario',
    description:
      'Diseñamos soluciones simples pero poderosas. La seguridad no debería ser complicada.',
  },
  {
    icon: Target,
    title: 'Innovación constante',
    description:
      'Nuestro equipo de investigación trabaja 24/7 para anticipar nuevas amenazas y desarrollar soluciones de vanguardia.',
  },
  {
    icon: Heart,
    title: 'Compromiso social',
    description:
      'Creemos que la seguridad digital es un derecho. Por eso ofrecemos planes gratuitos para instituciones educativas.',
  },
]

const team = [
  { name: 'Carlos I. Otero E.', role: 'Co-fundador & Desarrollador' },
  { name: 'Aaron Perez', role: 'Co-fundador & Desarrollador' },
  { name: 'Enrique Lopez', role: 'Co-fundador & Desarrollador' },
  { name: 'Yasdany Espinosa', role: 'Co-fundador & Desarrollador' },
]

export default function SobreNosotrosPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/30">
              <Shield className="h-5 w-5" />
            </span>
            <span className="text-base font-semibold tracking-tight">
              Proteus <span className="text-primary">Protection</span>
            </span>
          </Link>
          <Link
            href="/"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Volver al inicio
          </Link>
        </nav>
      </header>

      <main>
        {/* Hero */}
        <section className="relative py-20 md:py-28">
          <div className="mx-auto max-w-4xl px-4 md:px-6">
            <Reveal>
              <span className="text-sm font-medium text-primary">Sobre nosotros</span>
              <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight md:text-5xl">
                Protegiendo el mundo digital, una amenaza a la vez
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                Proteus Protection nació de la pasión de cuatro desarrolladores
                convencidos de que la seguridad digital debería ser accesible para
                todos. Desde nuestros inicios, hemos trabajado para crear soluciones
                que combinan potencia y simplicidad.
              </p>
            </Reveal>
          </div>
        </section>

        {/* Mission */}
        <section className="border-t border-border py-20 md:py-28">
          <div className="mx-auto max-w-4xl px-4 md:px-6">
            <Reveal>
              <h2 className="text-3xl font-semibold tracking-tight">Nuestra misión</h2>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                Hacer que la protección digital sea simple, accesible y efectiva para
                personas y empresas en todo el mundo. Creemos que nadie debería
                preocuparse por amenazas cibernéticas cuando puede enfocarse en lo que
                más le importa.
              </p>
            </Reveal>
          </div>
        </section>

        {/* Values */}
        <section className="border-t border-border py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <Reveal>
              <h2 className="text-center text-3xl font-semibold tracking-tight">
                Nuestros valores
              </h2>
            </Reveal>
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {values.map((value, i) => {
                const Icon = value.icon
                return (
                  <Reveal key={value.title} delay={i * 100}>
                    <div className="flex flex-col items-center text-center">
                      <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
                        <Icon className="h-6 w-6" />
                      </span>
                      <h3 className="mt-4 text-lg font-semibold">{value.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {value.description}
                      </p>
                    </div>
                  </Reveal>
                )
              })}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="border-t border-border py-20 md:py-28">
          <div className="mx-auto max-w-4xl px-4 md:px-6">
            <Reveal>
              <h2 className="text-center text-3xl font-semibold tracking-tight">
                Nuestro equipo
              </h2>
              <p className="mt-4 text-center text-muted-foreground">
                Cuatro desarrolladores apasionados por la seguridad y la tecnología.
              </p>
            </Reveal>
            <div className="mt-12 grid gap-6 sm:grid-cols-2">
              {team.map((member, i) => (
                <Reveal key={member.name} delay={i * 100}>
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <h3 className="text-lg font-semibold">{member.name}</h3>
                    <p className="mt-1 text-sm text-primary">{member.role}</p>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      Desarrollador full-stack con experiencia en seguridad
                      informática y arquitectura de software.
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="border-t border-border py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <div className="grid gap-8 text-center sm:grid-cols-3">
              <Reveal>
                <div>
                  <span className="text-4xl font-semibold text-primary">2024</span>
                  <p className="mt-2 text-sm text-muted-foreground">Año de fundación</p>
                </div>
              </Reveal>
              <Reveal delay={100}>
                <div>
                  <span className="text-4xl font-semibold text-primary">4</span>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Co-fundadores dedicados
                  </p>
                </div>
              </Reveal>
              <Reveal delay={200}>
                <div>
                  <span className="text-4xl font-semibold text-primary">2.4M+</span>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Usuarios protegidos
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Proteus Protection. Todos los derechos
              reservados.
            </p>
            <Link
              href="/"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
