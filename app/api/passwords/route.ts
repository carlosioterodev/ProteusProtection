import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { verifyToken, getTokenFromRequest } from '@/lib/auth'

function getUserId(request: Request): number | null {
  const token = getTokenFromRequest(request)
  if (!token) return null
  try {
    const decoded = verifyToken(token)
    return decoded.userId
  } catch {
    return null
  }
}

export async function GET(request: Request) {
  const userId = getUserId(request)
  if (!userId) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const result = await pool.query(
    'SELECT id, service, username, password, category, strength, updated_at FROM saved_passwords WHERE user_id = $1 ORDER BY updated_at DESC',
    [userId]
  )
  return NextResponse.json({ passwords: result.rows })
}

export async function POST(request: Request) {
  const userId = getUserId(request)
  if (!userId) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { service, username, password, category, strength } = await request.json()
  if (!service || !username || !password) {
    return NextResponse.json({ error: 'Servicio, usuario y contraseña son obligatorios' }, { status: 400 })
  }

  const result = await pool.query(
    'INSERT INTO saved_passwords (user_id, service, username, password, category, strength) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [userId, service, username, password, category || 'Personal', strength || 'media']
  )
  return NextResponse.json({ password: result.rows[0] }, { status: 201 })
}

export async function PUT(request: Request) {
  const userId = getUserId(request)
  if (!userId) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { id, service, username, password, category, strength } = await request.json()
  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })

  const result = await pool.query(
    'UPDATE saved_passwords SET service = COALESCE($1, service), username = COALESCE($2, username), password = COALESCE($3, password), category = COALESCE($4, category), strength = COALESCE($5, strength), updated_at = NOW() WHERE id = $6 AND user_id = $7 RETURNING *',
    [service, username, password, category, strength, id, userId]
  )

  if (result.rows.length === 0) {
    return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  }
  return NextResponse.json({ password: result.rows[0] })
}

export async function DELETE(request: Request) {
  const userId = getUserId(request)
  if (!userId) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { id } = await request.json()
  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })

  await pool.query('DELETE FROM saved_passwords WHERE id = $1 AND user_id = $2', [id, userId])
  return NextResponse.json({ ok: true })
}
