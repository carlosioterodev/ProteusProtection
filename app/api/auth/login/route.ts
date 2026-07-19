import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { comparePassword, signToken, authResponse } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Correo y contraseña son obligatorios' }, { status: 400 })
    }

    const result = await pool.query('SELECT id, name, email, password_hash FROM users WHERE email = $1', [
      email.toLowerCase(),
    ])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Correo o contraseña incorrectos' }, { status: 401 })
    }

    const user = result.rows[0]
    const valid = await comparePassword(password, user.password_hash)
    if (!valid) {
      return NextResponse.json({ error: 'Correo o contraseña incorrectos' }, { status: 401 })
    }

    const token = signToken(user.id, user.email)
    return authResponse({ id: user.id, name: user.name, email: user.email }, token)
  } catch {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
