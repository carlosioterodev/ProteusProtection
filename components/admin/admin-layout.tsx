'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  Shield,
  LayoutDashboard,
  BarChart3,
  Users,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { sileo } from 'sileo'

const navItems = [
  { id: '/admin', label: 'Overview', icon: LayoutDashboard },
  { id: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { id: '/admin/users', label: 'Usuarios', icon: Users },
]

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    sileo.success({ title: 'Sesión cerrada' })
    router.push('/login')
  }

  const sidebar = (
    <nav className="flex h-full flex-col gap-1 p-4">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.id || (item.id !== '/admin' && pathname.startsWith(item.id))
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              router.push(item.id)
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
        <div className="flex items-center gap-2 border-t border-border pt-3">
          <span className="truncate text-xs text-muted-foreground">Admin</span>
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
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Shield className="size-5" aria-hidden="true" />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-sidebar-foreground">Proteus</p>
              <p className="text-xs text-muted-foreground">Admin Panel</p>
            </div>
          </div>
          {sidebar}
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
                    <Shield className="size-5" />
                  </span>
                  <p className="text-sm font-semibold text-sidebar-foreground">Admin</p>
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
              {sidebar}
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
                  Admin Panel
                </h1>
                <p className="hidden text-xs text-muted-foreground sm:block">
                  Gestión y analytics de Proteus Protection
                </p>
              </div>
            </div>
          </header>

          <main className="flex-1 space-y-6 p-4 sm:p-6">
            {children}
            <footer className="pt-2 text-center text-xs text-muted-foreground">
              Proteus Protection · Admin Panel
            </footer>
          </main>
        </div>
      </div>
    </div>
  )
}
