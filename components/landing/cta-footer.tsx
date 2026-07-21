'use client'

import Link from 'next/link'
import { Shield, ShieldCheck } from 'lucide-react'
import { ActionButton } from '@/components/ui/action-button'
import { Reveal } from '@/components/landing/reveal'

const footerLinks = [
  {
    title: 'Producto',
    links: [
      { name: 'Proteus Shield', href: '#productos' },
      { name: 'Proteus Vault', href: '#productos' },
      { name: 'Proteus Tune', href: '#productos' },
      { name: 'Proteus Guard', href: '#productos' },
    ],
  },
  {
    title: 'Empresa',
    links: [
      { name: 'Sobre nosotros', href: '/empresa/sobre-nosotros' },
      { name: 'Blog', href: '#' },
      { name: 'Carreras', href: '/empresa/carreras' },
      { name: 'Prensa', href: '#' },
    ],
  },
  {
    title: 'Soporte',
    links: [
      { name: 'Centro de ayuda', href: '#' },
      { name: 'Contacto', href: 'mailto:carlosivanoteroespinosa@gmail.com' },
      { name: 'Estado del servicio', href: '#' },
      { name: 'Comunidad', href: '#' },
    ],
  },
]

export function CtaFooter() {
  return (
    <>
      <section className="relative py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <Reveal className="relative overflow-hidden rounded-3xl border border-primary/30 bg-card px-6 py-14 text-center md:px-12 md:py-20">
            <div className="cyber-grid pointer-events-none absolute inset-0 opacity-40" />
            <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
            <div className="relative">
              <span className="grid h-14 w-14 mx-auto place-items-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/30">
                <Shield className="h-7 w-7" />
              </span>
              <h2 className="mt-6 text-balance text-3xl font-semibold tracking-tight md:text-4xl">
                Empieza a proteger tus dispositivos hoy
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-pretty leading-relaxed text-muted-foreground">
                Únete a más de 2.4 millones de personas que confían en Proteus
                Protection. Sin tarjeta de crédito para empezar.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link href="/dashboard">
                  <ActionButton variant="primary" size="lg" className="w-full sm:w-auto">
                    <ShieldCheck className="h-4 w-4" />
                    Prueba gratis 14 días
                  </ActionButton>
                </Link>
                <a href="#precios">
                  <ActionButton variant="ghost" size="lg" className="w-full sm:w-auto">
                    Ver planes
                  </ActionButton>
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-14 md:px-6">
          <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
            <div>
              <Link href="/" className="flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/30">
                  <Shield className="h-5 w-5" />
                </span>
                <span className="text-base font-semibold tracking-tight">
                  Proteus <span className="text-primary">Protection</span>
                </span>
              </Link>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
                Soluciones de seguridad y mantenimiento digital para proteger lo
                que más importa.
              </p>
            </div>

            {footerLinks.map((col) => (
              <div key={col.title}>
                <h3 className="text-sm font-semibold">{col.title}</h3>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.name}>
                      {link.href.startsWith('/') ? (
                        <Link
                          href={link.href}
                          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {link.name}
                        </Link>
                      ) : link.href.startsWith('mailto:') ? (
                        <a
                          href={link.href}
                          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {link.name}
                        </a>
                      ) : (
                        <a
                          href={link.href}
                          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {link.name}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Proteus Protection. Todos los derechos
              reservados.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-xs text-muted-foreground hover:text-foreground">
                Privacidad
              </a>
              <a href="#" className="text-xs text-muted-foreground hover:text-foreground">
                Términos
              </a>
              <a href="#" className="text-xs text-muted-foreground hover:text-foreground">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
