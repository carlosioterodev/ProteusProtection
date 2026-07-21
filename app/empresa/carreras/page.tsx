'use client'

import Link from 'next/link'
import { Shield, Code, Users, Globe, Mail } from 'lucide-react'
import { Reveal } from '@/components/landing/reveal'
import { ActionButton } from '@/components/ui/action-button'

const benefits = [
  {
    icon: Code,
    title: 'Trabajo remoto',
    description: 'Trabaja desde cualquier lugar del mundo. Valoramos los resultados, no la oficina.',
  },
  {
    icon: Users,
    title: 'Equipo colaborativo',
    description: 'Forma parte de un equipo joven y dinámico que comparte pasión por la tecnología.',
  },
  {
    icon: Globe,
    title: 'Impacto global',
    description: 'Tus contribuciones protegerán a millones de usuarios en todo el mundo.',
  },
]

const positions = [
  {
    title: 'Ingeniero de Seguridad',
    department: 'Tecnología',
    type: 'Tiempo completo',
    description:
      'Buscamos un ingeniero de seguridad con experiencia en análisis de malware y desarrollo de herramientas de protección.',
    requirements: [
      'Experiencia en análisis de amenazas',
      'Conocimiento de técnicas de ofuscación',
      'Programación en C/C++ o Rust',
    ],
  },
  {
    title: 'Desarrollador Full-Stack',
    department: 'Producto',
    type: 'Tiempo completo',
    description:
      'Únete al equipo de producto para desarrollar nuevas funcionalidades y mejorar la experiencia de usuario.',
    requirements: [
      'Experiencia con React y Next.js',
      'Conocimiento de bases de datos',
      'APIs REST y GraphQL',
    ],
  },
  {
    title: 'Diseñador UX/UI',
    department: 'Diseño',
    type: 'Tiempo completo',
    description:
      'Diseña interfaces intuitivas y atractivas para nuestros productos de seguridad.',
    requirements: [
      'Portafolio de proyectos de diseño',
      'Experiencia con Figma',
      'Conocimiento de accesibilidad',
    ],
  },
]

export default function CarrerasPage() {
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
              <span className="text-sm font-medium text-primary">Carreras</span>
              <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight md:text-5xl">
                Únete al equipo que protege el mundo digital
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                Estamos buscando talento apasionado por la seguridad y la
                tecnología. Si quieres hacer la diferencia y proteger a millones
                de usuarios, este es tu lugar.
              </p>
            </Reveal>
          </div>
        </section>

        {/* Benefits */}
        <section className="border-t border-border py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <Reveal>
              <h2 className="text-center text-3xl font-semibold tracking-tight">
                Por qué trabajar con nosotros
              </h2>
            </Reveal>
            <div className="mt-12 grid gap-8 sm:grid-cols-3">
              {benefits.map((benefit, i) => {
                const Icon = benefit.icon
                return (
                  <Reveal key={benefit.title} delay={i * 100}>
                    <div className="flex flex-col items-center text-center">
                      <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
                        <Icon className="h-6 w-6" />
                      </span>
                      <h3 className="mt-4 text-lg font-semibold">{benefit.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {benefit.description}
                      </p>
                    </div>
                  </Reveal>
                )
              })}
            </div>
          </div>
        </section>

        {/* Open Positions */}
        <section className="border-t border-border py-20 md:py-28">
          <div className="mx-auto max-w-4xl px-4 md:px-6">
            <Reveal>
              <h2 className="text-center text-3xl font-semibold tracking-tight">
                Posiciones abiertas
              </h2>
              <p className="mt-4 text-center text-muted-foreground">
                Encuentra el puesto perfecto para ti.
              </p>
            </Reveal>
            <div className="mt-12 space-y-6">
              {positions.map((position, i) => (
                <Reveal key={position.title} delay={i * 100}>
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold">{position.title}</h3>
                        <div className="mt-1 flex flex-wrap gap-2">
                          <span className="rounded-full bg-primary/15 px-2.5 py-1 text-[11px] font-medium text-primary">
                            {position.department}
                          </span>
                          <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                            {position.type}
                          </span>
                        </div>
                      </div>
                      <Link href={`mailto:carlosivanoteroespinosa@gmail.com?subject=Aplicación: ${position.title}`}>
                        <ActionButton variant="primary" size="sm">
                          <Mail className="h-4 w-4" />
                          Aplicar
                        </ActionButton>
                      </Link>
                    </div>
                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                      {position.description}
                    </p>
                    <div className="mt-4">
                      <h4 className="text-sm font-medium">Requisitos:</h4>
                      <ul className="mt-2 space-y-1">
                        {position.requirements.map((req) => (
                          <li key={req} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border py-20 md:py-28">
          <div className="mx-auto max-w-4xl px-4 md:px-6 text-center">
            <Reveal>
              <h2 className="text-3xl font-semibold tracking-tight">
                ¿No ves tu posición?
              </h2>
              <p className="mt-4 text-muted-foreground">
                Envíanos tu CV y cuéntanos por qué quieres formar parte del equipo.
              </p>
              <div className="mt-8">
                <a href="mailto:carlosivanoteroespinosa@gmail.com">
                  <ActionButton variant="primary" size="lg">
                    <Mail className="h-4 w-4" />
                    Enviar CV general
                  </ActionButton>
                </a>
              </div>
            </Reveal>
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
