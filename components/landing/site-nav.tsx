'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Shield, Menu, X } from 'lucide-react'
import { ActionButton } from '@/components/ui/action-button'
import { cn } from '@/lib/utils'

const links = [
  { href: '#productos', label: 'Productos' },
  { href: '#caracteristicas', label: 'Características' },
  { href: '#precios', label: 'Precios' },
]

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-colors duration-300',
        scrolled
          ? 'border-b border-border bg-background/85 backdrop-blur-xl'
          : 'border-b border-transparent',
      )}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/30">
            <Shield className="h-5 w-5" />
          </span>
          <span className="text-base font-semibold tracking-tight">
            Proteus <span className="text-primary">Protection</span>
          </span>
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/dashboard">
            <ActionButton variant="ghost" size="sm">
              Iniciar sesión
            </ActionButton>
          </Link>
          <Link href="/dashboard">
            <ActionButton variant="primary" size="sm">
              Prueba gratis
            </ActionButton>
          </Link>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="grid h-9 w-9 place-items-center rounded-md border border-border text-foreground md:hidden"
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-border bg-background/95 backdrop-blur-xl md:hidden">
          <ul className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  {l.label}
                </a>
              </li>
            ))}
            <li className="mt-2 flex flex-col gap-2">
              <Link href="/dashboard" onClick={() => setOpen(false)}>
                <ActionButton variant="ghost" size="md" className="w-full">
                  Iniciar sesión
                </ActionButton>
              </Link>
              <Link href="/dashboard" onClick={() => setOpen(false)}>
                <ActionButton variant="primary" size="md" className="w-full">
                  Prueba gratis
                </ActionButton>
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  )
}
