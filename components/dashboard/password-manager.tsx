'use client'

import { useMemo, useState } from 'react'
import {
  Search,
  Copy,
  Pencil,
  Eye,
  EyeOff,
  Check,
  X,
  KeyRound,
  Plus,
  Trash2,
} from 'lucide-react'
import { ActionButton } from '@/components/ui/action-button'
import { sileo } from 'sileo'
import type { PasswordEntry } from '@/lib/proteus-data'
import { cn } from '@/lib/utils'

const strengthStyles: Record<PasswordEntry['strength'], string> = {
  fuerte: 'bg-success/15 text-success',
  media: 'bg-warning/15 text-warning',
  debil: 'bg-destructive/15 text-destructive',
}

interface PasswordManagerProps {
  passwords: PasswordEntry[]
  onUpdate: (id: string, patch: Partial<PasswordEntry>) => void
  onAdd: (entry: { service: string; username: string; password: string; category: string }) => void
  onDelete: (id: string) => void
}

export function PasswordManager({ passwords, onUpdate, onAdd, onDelete }: PasswordManagerProps) {
  const [query, setQuery] = useState('')
  const [revealed, setRevealed] = useState<Set<string>>(new Set())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [newEntry, setNewEntry] = useState({ service: '', username: '', password: '', category: 'Personal' })

  const handleAdd = () => {
    if (!newEntry.service || !newEntry.username || !newEntry.password) {
      sileo.warning({ title: 'Campos obligatorios', description: 'Servicio, usuario y contraseña son requeridos' })
      return
    }
    if (newEntry.password.length < 4) {
      sileo.warning({ title: 'Contraseña demasiado corta', description: 'Usa al menos 4 caracteres' })
      return
    }
    onAdd(newEntry)
    setNewEntry({ service: '', username: '', password: '', category: 'Personal' })
    setShowAdd(false)
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return passwords
    return passwords.filter(
      (p) =>
        p.service.toLowerCase().includes(q) ||
        p.username.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q),
    )
  }, [passwords, query])

  const toggleReveal = (id: string) => {
    setRevealed((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleCopy = async (entry: PasswordEntry) => {
    try {
      await navigator.clipboard.writeText(entry.password)
      sileo.success({
        title: 'Contraseña copiada',
        description: `La contraseña de ${entry.service} está en tu portapapeles.`,
      })
    } catch {
      sileo.error({
        title: 'No se pudo copiar',
        description: 'Tu navegador bloqueó el acceso al portapapeles.',
      })
    }
  }

  const startEdit = (entry: PasswordEntry) => {
    setEditingId(entry.id)
    setDraft(entry.password)
    setRevealed((prev) => new Set(prev).add(entry.id))
  }

  const saveEdit = (entry: PasswordEntry) => {
    if (draft.trim().length < 4) {
      sileo.warning({
        title: 'Contraseña demasiado corta',
        description: 'Usa al menos 4 caracteres para mayor seguridad.',
      })
      return
    }
    const strength: PasswordEntry['strength'] =
      draft.length >= 12 && /[^a-zA-Z0-9]/.test(draft)
        ? 'fuerte'
        : draft.length >= 8
          ? 'media'
          : 'debil'
    onUpdate(entry.id, { password: draft, strength })
    setEditingId(null)
    sileo.success({
      title: 'Contraseña actualizada',
      description: `Se guardaron los cambios para ${entry.service}.`,
    })
  }

  return (
    <section
      aria-labelledby="pm-heading"
      className="rounded-xl border border-border bg-card"
    >
      <header className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <KeyRound className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2 id="pm-heading" className="text-base font-semibold text-card-foreground">
              Gestor de contraseñas
            </h2>
            <p className="text-xs text-muted-foreground">
              Bóveda cifrada · {passwords.length} credenciales
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative sm:w-64">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar servicio o usuario..."
            aria-label="Buscar contraseñas"
            className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          </div>
          <ActionButton variant="primary" size="sm" onClick={() => setShowAdd(!showAdd)}>
            <Plus className="size-4" /> Agregar
          </ActionButton>
        </div>
      </header>

      {showAdd && (
        <div className="border-b border-border bg-muted/20 p-5">
          <h3 className="mb-3 text-sm font-medium text-foreground">Nueva contraseña</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <input
              value={newEntry.service}
              onChange={(e) => setNewEntry({ ...newEntry, service: e.target.value })}
              placeholder="Servicio"
              className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <input
              value={newEntry.username}
              onChange={(e) => setNewEntry({ ...newEntry, username: e.target.value })}
              placeholder="Usuario"
              className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <input
              value={newEntry.password}
              onChange={(e) => setNewEntry({ ...newEntry, password: e.target.value })}
              placeholder="Contraseña"
              type="password"
              className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <div className="flex gap-2">
              <select
                value={newEntry.category}
                onChange={(e) => setNewEntry({ ...newEntry, category: e.target.value })}
                className="h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="Personal">Personal</option>
                <option value="Trabajo">Trabajo</option>
                <option value="Finanzas">Finanzas</option>
                <option value="Social">Social</option>
              </select>
              <ActionButton variant="primary" size="sm" onClick={handleAdd}>
                <Check className="size-4" /> Guardar
              </ActionButton>
            </div>
          </div>
        </div>
      )}

      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
              <th scope="col" className="px-5 py-3 font-medium">Servicio</th>
              <th scope="col" className="px-5 py-3 font-medium">Usuario</th>
              <th scope="col" className="px-5 py-3 font-medium">Contraseña</th>
              <th scope="col" className="px-5 py-3 font-medium">Seguridad</th>
              <th scope="col" className="px-5 py-3 text-right font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((entry) => {
              const isRevealed = revealed.has(entry.id)
              const isEditing = editingId === entry.id
              return (
                <tr
                  key={entry.id}
                  className="border-b border-border/60 transition-colors last:border-0 hover:bg-muted/40"
                >
                  <td className="px-5 py-3">
                    <span className="font-medium text-card-foreground">{entry.service}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {entry.category}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-mono text-muted-foreground">
                    {entry.username}
                  </td>
                  <td className="px-5 py-3">
                    {isEditing ? (
                      <input
                        autoFocus
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.nativeEvent.isComposing || e.keyCode === 229) return
                          if (e.key === 'Enter') saveEdit(entry)
                          if (e.key === 'Escape') setEditingId(null)
                        }}
                        aria-label={`Editar contraseña de ${entry.service}`}
                        className="h-8 w-40 rounded-md border border-input bg-background px-2 font-mono text-sm text-foreground focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    ) : (
                      <span className="font-mono text-card-foreground">
                        {isRevealed ? entry.password : '••••••••••'}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={cn(
                        'inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize',
                        strengthStyles[entry.strength],
                      )}
                    >
                      {entry.strength}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      {isEditing ? (
                        <>
                          <ActionButton
                            size="sm"
                            variant="primary"
                            onClick={() => saveEdit(entry)}
                            aria-label="Guardar"
                          >
                            <Check className="size-4" /> Guardar
                          </ActionButton>
                          <ActionButton
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingId(null)}
                            aria-label="Cancelar edición"
                          >
                            <X className="size-4" />
                          </ActionButton>
                        </>
                      ) : (
                        <>
                          <ActionButton
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleReveal(entry.id)}
                            aria-label={isRevealed ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                          >
                            {isRevealed ? (
                              <EyeOff className="size-4" />
                            ) : (
                              <Eye className="size-4" />
                            )}
                          </ActionButton>
                          <ActionButton
                            size="sm"
                            variant="secondary"
                            onClick={() => handleCopy(entry)}
                            aria-label={`Copiar contraseña de ${entry.service}`}
                          >
                            <Copy className="size-4" /> Copiar
                          </ActionButton>
                          <ActionButton
                            size="sm"
                            variant="ghost"
                            onClick={() => startEdit(entry)}
                            aria-label={`Editar contraseña de ${entry.service}`}
                          >
                            <Pencil className="size-4" />
                          </ActionButton>
                          <ActionButton
                            size="sm"
                            variant="danger"
                            onClick={() => onDelete(entry.id)}
                            aria-label={`Eliminar contraseña de ${entry.service}`}
                          >
                            <Trash2 className="size-4" />
                          </ActionButton>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <ul className="divide-y divide-border/60 md:hidden">
        {filtered.map((entry) => {
          const isRevealed = revealed.has(entry.id)
          const isEditing = editingId === entry.id
          return (
            <li key={entry.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-card-foreground">{entry.service}</p>
                  <p className="font-mono text-xs text-muted-foreground">{entry.username}</p>
                </div>
                <span
                  className={cn(
                    'inline-flex shrink-0 rounded-full px-2 py-0.5 text-xs font-medium capitalize',
                    strengthStyles[entry.strength],
                  )}
                >
                  {entry.strength}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-2">
                {isEditing ? (
                  <input
                    autoFocus
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    aria-label={`Editar contraseña de ${entry.service}`}
                    className="h-9 flex-1 rounded-md border border-input bg-background px-2 font-mono text-sm text-foreground focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                ) : (
                  <span className="flex-1 font-mono text-sm text-card-foreground">
                    {isRevealed ? entry.password : '••••••••••'}
                  </span>
                )}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {isEditing ? (
                  <>
                    <ActionButton size="sm" variant="primary" onClick={() => saveEdit(entry)}>
                      <Check className="size-4" /> Guardar
                    </ActionButton>
                    <ActionButton size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                      <X className="size-4" /> Cancelar
                    </ActionButton>
                  </>
                ) : (
                  <>
                    <ActionButton
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleReveal(entry.id)}
                    >
                      {isRevealed ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      {isRevealed ? 'Ocultar' : 'Mostrar'}
                    </ActionButton>
                    <ActionButton size="sm" variant="secondary" onClick={() => handleCopy(entry)}>
                      <Copy className="size-4" /> Copiar
                    </ActionButton>
                    <ActionButton size="sm" variant="ghost" onClick={() => startEdit(entry)}>
                      <Pencil className="size-4" /> Editar
                    </ActionButton>
                    <ActionButton size="sm" variant="danger" onClick={() => onDelete(entry.id)}>
                      <Trash2 className="size-4" /> Eliminar
                    </ActionButton>
                  </>
                )}
              </div>
            </li>
          )
        })}
      </ul>

      {filtered.length === 0 ? (
        <div className="p-10 text-center text-sm text-muted-foreground">
          No se encontraron credenciales para{' '}
          <span className="font-medium text-foreground">{query}</span>.
        </div>
      ) : null}
    </section>
  )
}
