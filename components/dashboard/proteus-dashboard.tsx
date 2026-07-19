'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { animate } from 'animejs'
import {
  Shield,
  LayoutDashboard,
  KeyRound,
  Gauge,
  Settings,
  Bell,
  Menu,
  X,
  ShieldCheck,
  LogOut,
  User,
} from 'lucide-react'
import { StatusCards } from './status-cards'
import { PasswordManager } from './password-manager'
import { OptimizationPanel } from './optimization-panel'
import { WhatsAppButton } from '@/components/whatsapp-button'
import { cn } from '@/lib/utils'
import { sileo } from 'sileo'

interface DashboardUser {
  id: number
  name: string
  email: string
}

interface PasswordEntry {
  id: string
  service: string
  username: string
  password: string
  category: 'Trabajo' | 'Personal' | 'Finanzas' | 'Social'
  strength: 'fuerte' | 'media' | 'debil'
  updatedAt: string
}

const navItems = [
  { id: 'resumen', label: 'Resumen', icon: LayoutDashboard },
  { id: 'contrasenas', label: 'Contraseñas', icon: KeyRound },
  { id: 'optimizacion', label: 'Optimización', icon: Gauge },
  { id: 'ajustes', label: 'Ajustes', icon: Settings },
]

function todayLabel() {
  return new Date().toLocaleDateString('es', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function ProteusDashboard({ user }: { user: DashboardUser }) {
  const router = useRouter()
  const [passwords, setPasswords] = useState<PasswordEntry[]>([])
  const [lastOptimization, setLastOptimization] = useState('Nunca')
  const [active, setActive] = useState('resumen')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [threatsBlocked, setThreatsBlocked] = useState(0)
  const logoRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (logoRef.current) {
      animate(logoRef.current, {
        rotate: [-12, 0],
        scale: [0.8, 1],
        opacity: [0, 1],
        duration: 700,
        ease: 'out(3)',
      })
    }
  }, [])

  const fetchPasswords = useCallback(async () => {
    try {
      const res = await fetch('/api/passwords')
      if (res.ok) {
        const data = await res.json()
        setPasswords(
          data.passwords.map((p: Record<string, unknown>) => ({
            id: String(p.id),
            service: p.service as string,
            username: p.username as string,
            password: p.password as string,
            category: (p.category as PasswordEntry['category']) || 'Personal',
            strength: (p.strength as PasswordEntry['strength']) || 'media',
            updatedAt: p.updated_at as string,
          })),
        )
      }
    } catch {
      sileo.error({ title: 'Error al cargar contraseñas' })
    }
  }, [])

  useEffect(() => {
    fetchPasswords()
  }, [fetchPasswords])

  const updatePassword = async (id: string, patch: Partial<PasswordEntry>) => {
    try {
      const res = await fetch('/api/passwords', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: Number(id), ...patch }),
      })
      if (res.ok) {
        setPasswords((prev) =>
          prev.map((p) => (p.id === id ? { ...p, ...patch, updatedAt: todayLabel() } : p)),
        )
      }
    } catch {
      sileo.error({ title: 'Error al actualizar' })
    }
  }

  const addPassword = async (entry: { service: string; username: string; password: string; category: string }) => {
    try {
      const res = await fetch('/api/passwords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      })
      if (res.ok) {
        const data = await res.json()
        setPasswords((prev) => [
          {
            id: String(data.password.id),
            service: data.password.service,
            username: data.password.username,
            password: data.password.password,
            category: data.password.category,
            strength: data.password.strength,
            updatedAt: data.password.updated_at,
          },
          ...prev,
        ])
        sileo.success({ title: 'Contraseña guardada' })
      }
    } catch {
      sileo.error({ title: 'Error al guardar' })
    }
  }

  const deletePassword = async (id: string) => {
    try {
      await fetch('/api/passwords', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: Number(id) }),
      })
      setPasswords((prev) => prev.filter((p) => p.id !== id))
      sileo.success({ title: 'Contraseña eliminada' })
    } catch {
      sileo.error({ title: 'Error al eliminar' })
    }
  }

  const handleOptimized = () => {
    setLastOptimization('Ahora mismo')
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    sileo.success({ title: 'Sesión cerrada' })
    router.push('/login')
  }

  const Sidebar = (
    <nav className="flex h-full flex-col gap-1 p-4">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = active === item.id
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setActive(item.id)
              setMobileOpen(false)
            }}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon className="size-4.5 shrink-0" aria-hidden="true" />
            {item.label}
          </button>
        )
      })}
      <div className="mt-auto rounded-lg border border-border bg-background/40 p-4">
        <div className="flex items-center gap-2 text-success">
          <ShieldCheck className="size-4" aria-hidden="true" />
          <span className="text-xs font-semibold">Plan Pro activo</span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Protección avanzada y respaldo cifrado incluidos.
        </p>
        <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
          <User className="size-3.5 text-muted-foreground" />
          <span className="truncate text-xs text-muted-foreground">{user.email}</span>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-2 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <LogOut className="size-3.5" />
          Cerrar sesión
        </button>
      </div>
    </nav>
  )

  return (
    <div className="min-h-screen cyber-grid">
      <div className="flex min-h-screen">
        {/* Desktop sidebar */}
        <aside className="hidden w-64 shrink-0 border-r border-border bg-sidebar lg:flex lg:flex-col">
          <div className="flex items-center gap-2.5 border-b border-border px-5 py-4">
            <span
              ref={logoRef}
              className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground"
            >
              <Shield className="size-5" aria-hidden="true" />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-sidebar-foreground">Proteus</p>
              <p className="text-xs text-muted-foreground">Protection Suite</p>
            </div>
          </div>
          {Sidebar}
        </aside>

        {/* Mobile drawer */}
        {mobileOpen ? (
          <div className="fixed inset-0 z-40 lg:hidden">
            <button
              type="button"
              aria-label="Cerrar menú"
              className="absolute inset-0 bg-background/70 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <aside className="absolute inset-y-0 left-0 flex w-64 flex-col border-r border-border bg-sidebar">
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Shield className="size-5" aria-hidden="true" />
                  </span>
                  <p className="text-sm font-semibold text-sidebar-foreground">Proteus</p>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Cerrar menú"
                  className="rounded-md p-1 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-5" />
                </button>
              </div>
              {Sidebar}
            </aside>
          </div>
        ) : null}

        {/* Main content */}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur sm:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                aria-label="Abrir menú"
                className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
              >
                <Menu className="size-5" />
              </button>
              <div>
                <h1 className="text-base font-semibold text-foreground sm:text-lg">
                  Hola, {user.name}
                </h1>
                <p className="hidden text-xs text-muted-foreground sm:block">
                  Tu sistema está protegido
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden items-center gap-2 rounded-full border border-success/30 bg-success/10 px-3 py-1.5 text-xs font-medium text-success sm:inline-flex">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-success" />
                </span>
                Protección activa
              </span>
              <button
                type="button"
                aria-label="Notificaciones"
                className="relative rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <Bell className="size-5" />
                <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-primary" />
              </button>
            </div>
          </header>

          <main className="flex-1 space-y-6 p-4 sm:p-6">
            {active === 'resumen' && (
              <>
                <StatusCards
                  passwordCount={passwords.length}
                  lastOptimization={lastOptimization}
                  protectionActive
                  threatsBlocked={threatsBlocked}
                />
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                  <div className="xl:col-span-2">
                    <PasswordManager
                      passwords={passwords}
                      onUpdate={updatePassword}
                      onAdd={addPassword}
                      onDelete={deletePassword}
                    />
                  </div>
                  <div className="xl:col-span-1">
                    <OptimizationPanel onOptimized={handleOptimized} />
                  </div>
                </div>
              </>
            )}

            {active === 'contrasenas' && (
              <PasswordManager
                passwords={passwords}
                onUpdate={updatePassword}
                onAdd={addPassword}
                onDelete={deletePassword}
              />
            )}

            {active === 'optimizacion' && (
              <OptimizationPanel onOptimized={handleOptimized} />
            )}

            {active === 'ajustes' && (
              <section className="rounded-xl border border-border bg-card p-6">
                <h2 className="text-base font-semibold text-card-foreground">Ajustes</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Panel de configuración — próximamente disponible.
                </p>
                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">Cuenta</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">Plan</p>
                      <p className="text-xs text-success">Pro — Activo</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/20"
                  >
                    <LogOut className="size-4" />
                    Cerrar sesión
                  </button>
                </div>
              </section>
            )}

            <footer className="pt-2 text-center text-xs text-muted-foreground">
              Proteus Protection · Seguridad y mantenimiento digital · {todayLabel()}
            </footer>
          </main>
        </div>
      </div>
      <WhatsAppButton />
    </div>
  )
}
