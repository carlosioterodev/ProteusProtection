'use client'

import { useEffect, useState } from 'react'
import { X, KeyRound, Eye } from 'lucide-react'

interface UserDetail {
  user: {
    id: number
    name: string
    email: string
    created_at: string
    plan_name: string | null
    subscription_status: string | null
    password_count: number
  }
  recentViews: {
    path: string
    browser: string
    os: string
    device_type: string
    country: string | null
    created_at: string
  }[]
}

export function UserDetailModal({
  userId,
  onClose,
}: {
  userId: number
  onClose: () => void
}) {
  const [data, setData] = useState<UserDetail | null>(null)

  useEffect(() => {
    fetch(`/api/admin/users/${userId}`)
      .then((res) => res.json())
      .then(setData)
      .catch(() => onClose())
  }, [userId, onClose])

  if (!data) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  const { user, recentViews } = data

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm">
      <div className="mx-4 max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-xl border border-border bg-card p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-card-foreground">{user.name}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-border p-3">
            <p className="text-xs text-muted-foreground">Plan</p>
            <p className="text-sm font-medium text-card-foreground">
              {user.plan_name || 'Sin plan'}
            </p>
          </div>
          <div className="rounded-lg border border-border p-3">
            <p className="text-xs text-muted-foreground">Estado</p>
            <p className="text-sm font-medium text-card-foreground">
              {user.subscription_status || 'N/A'}
            </p>
          </div>
          <div className="rounded-lg border border-border p-3">
            <p className="text-xs text-muted-foreground">Contraseñas</p>
            <p className="text-sm font-medium text-card-foreground">
              <KeyRound className="mr-1 inline size-3" />
              {user.password_count}
            </p>
          </div>
          <div className="rounded-lg border border-border p-3">
            <p className="text-xs text-muted-foreground">Registro</p>
            <p className="text-sm font-medium text-card-foreground">
              {new Date(user.created_at).toLocaleDateString('es')}
            </p>
          </div>
        </div>

        {recentViews.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-card-foreground">
              <Eye className="mr-1 inline size-3" />
              Actividad reciente
            </h3>
            <div className="mt-2 space-y-1">
              {recentViews.map((view, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded border border-border px-3 py-1.5 text-xs"
                >
                  <span className="font-mono text-card-foreground">{view.path}</span>
                  <span className="text-muted-foreground">
                    {view.browser} · {view.os}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
