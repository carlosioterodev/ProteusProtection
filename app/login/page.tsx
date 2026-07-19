'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { animate, createTimeline } from 'animejs'
import { Shield, Mail, Lock, User, Eye, EyeOff, Loader2 } from 'lucide-react'
import { sileo } from 'sileo'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const cardRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (cardRef.current) {
      animate(cardRef.current, { opacity: [0, 1], translateY: [30, 0], duration: 700, ease: 'out(3)' })
    }
    if (logoRef.current) {
      const tl = createTimeline({ defaults: { ease: 'out(3)' } })
      tl.add(logoRef.current, { rotate: [-15, 0], scale: [0.7, 1], opacity: [0, 1], duration: 800 })
    }
  }, [])

  useEffect(() => {
    setErrors({})
  }, [mode])

  function validate(): boolean {
    const e: Record<string, string> = {}

    if (mode === 'register' && name.trim().length < 2) {
      e.name = 'El nombre debe tener al menos 2 caracteres'
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      e.email = 'Ingresa un correo electrónico válido'
    }

    if (password.length < 6) {
      e.password = 'La contraseña debe tener al menos 6 caracteres'
    }

    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register'
    const body = mode === 'login' ? { email, password } : { name, email, password }

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) {
        sileo.error({ title: data.error || 'Error', position: 'top-right' })
        setLoading(false)
        return
      }

      sileo.success({ title: mode === 'login' ? '¡Bienvenido de vuelta!' : '¡Cuenta creada!', position: 'top-right' })
      setTimeout(() => { window.location.href = '/dashboard' }, 600)
    } catch {
      sileo.error({ title: 'Error de conexión', description: 'No se pudo conectar al servidor', position: 'top-right' })
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="cyber-grid pointer-events-none fixed inset-0 opacity-30" />
      <div className="pointer-events-none fixed left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/8 blur-3xl" />

      <div ref={cardRef} className="relative z-10 w-full max-w-md opacity-0">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-2xl">
          <div className="flex flex-col items-center">
            <span
              ref={logoRef}
              className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground opacity-0"
            >
              <Shield className="size-7" />
            </span>
            <h1 className="mt-4 text-xl font-semibold text-foreground">Proteus Protection</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {mode === 'login' ? 'Inicia sesión en tu cuenta' : 'Crea tu cuenta gratuita'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {mode === 'register' && (
              <div>
                <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-foreground">
                  Nombre completo
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tu nombre"
                    className={`h-11 w-full rounded-lg border bg-background pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${errors.name ? 'border-destructive' : 'border-input'}`}
                  />
                </div>
                {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
              </div>
            )}

            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-foreground">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className={`h-11 w-full rounded-lg border bg-background pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${errors.email ? 'border-destructive' : 'border-input'}`}
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-foreground">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`h-11 w-full rounded-lg border bg-background pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${errors.password ? 'border-destructive' : 'border-input'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground shadow-[0_0_20px_-4px_var(--primary)] transition-all hover:bg-primary/90 hover:shadow-[0_0_28px_-2px_var(--primary)] disabled:pointer-events-none disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : mode === 'login' ? (
                'Iniciar sesión'
              ) : (
                'Crear cuenta'
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">o</span>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
            <button
              type="button"
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="font-medium text-primary hover:text-primary/80"
            >
              {mode === 'login' ? 'Crear cuenta gratis' : 'Iniciar sesión'}
            </button>
          </p>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-xs text-muted-foreground hover:text-foreground">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
