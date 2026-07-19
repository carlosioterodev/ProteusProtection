import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import pool from '@/lib/db'
import { NextResponse } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret'

export function signToken(userId: number, email: string) {
  return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as { userId: number; email: string }
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12)
}

export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

export function getTokenFromRequest(request: Request): string | null {
  const cookie = request.headers.get('cookie') || ''
  const match = cookie.match(/proteus_token=([^;]+)/)
  return match ? match[1] : null
}

export function authResponse(user: { id: number; name: string; email: string }, token: string) {
  const res = NextResponse.json({ user: { id: user.id, name: user.name, email: user.email } })
  res.cookies.set('proteus_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  })
  return res
}
