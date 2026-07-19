import { NextResponse } from 'next/server'
import { verifyToken, getTokenFromRequest } from '@/lib/auth'
import pool from '@/lib/db'

export async function GET(request: Request) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    const result = await pool.query('SELECT id, name, email FROM users WHERE id = $1', [decoded.userId])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 401 })
    }

    return NextResponse.json({ user: result.rows[0] })
  } catch {
    return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
  }
}
