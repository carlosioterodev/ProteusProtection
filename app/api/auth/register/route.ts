import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { hashPassword, signToken, authResponse } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Todos los campos son obligatorios' }, { status: 400 })
    }

    if (name.trim().length < 2) {
      return NextResponse.json({ error: 'El nombre debe tener al menos 2 caracteres' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'El correo electrónico no es válido' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres' }, { status: 400 })
    }

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()])
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: 'Este correo ya está registrado' }, { status: 409 })
    }

    const passwordHash = await hashPassword(password)
    const result = await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name.trim(), email.toLowerCase(), passwordHash]
    )

    const user = result.rows[0]
    const token = signToken(user.id, user.email)
    return authResponse(user, token)
  } catch {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
