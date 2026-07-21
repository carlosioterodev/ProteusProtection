import { NextResponse } from 'next/server'
import { startTrial } from '@/lib/plans'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    const { planSlug } = await request.json()

    if (!planSlug) {
      return NextResponse.json({ error: 'planSlug requerido' }, { status: 400 })
    }

    const subscription = await startTrial(decoded.userId, planSlug)
    return NextResponse.json({ subscription })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error del servidor'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
