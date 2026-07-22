'use client'

import { useEffect, useState, useCallback } from 'react'
import { UsersTable } from '@/components/admin/users-table'
import { UserDetailModal } from '@/components/admin/user-detail-modal'

interface UserRow {
  id: number
  name: string
  email: string
  created_at: string
  plan_name: string | null
  subscription_status: string | null
  password_count: number
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)

  const fetchUsers = useCallback(async () => {
    const params = new URLSearchParams({
      page: String(page),
      limit: '20',
    })
    if (search) params.set('search', search)

    const res = await fetch(`/api/admin/users?${params}`)
    if (res.ok) {
      const data = await res.json()
      setUsers(data.users)
      setTotal(data.total)
      setTotalPages(data.totalPages)
    }
  }, [page, search])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleSearch = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex items-center gap-3">
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="flex-1 rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <span className="shrink-0 text-sm text-muted-foreground">
          {total} usuario{total !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <UsersTable
        users={users}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        onSelectUser={setSelectedUserId}
      />

      {/* Detail modal */}
      {selectedUserId !== null && (
        <UserDetailModal
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
        />
      )}
    </div>
  )
}
