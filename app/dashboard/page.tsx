'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ProteusDashboard } from '@/components/dashboard/proteus-dashboard'
import { sileo } from 'sileo'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ id: number; name: string; email: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => {
        if (!res.ok) throw new Error()
        return res.json()
      })
      .then((data) => {
        setUser(data.user)
        setLoading(false)
      })
      .catch(() => {
        sileo.error({ title: 'Sesión expirada', description: 'Inicia sesión nuevamente' })
        router.push('/login')
      })
  }, [router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="mt-3 text-sm text-muted-foreground">Cargando panel...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return <ProteusDashboard user={user} />
}
