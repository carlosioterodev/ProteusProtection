// app/api/user/plan/route.ts
import { NextResponse } from 'next/server'
import { getUserPlan } from '@/lib/plans'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    const userPlan = await getUserPlan(decoded.userId)

    if (!userPlan) {
      return NextResponse.json({ error: 'Plan no encontrado' }, { status: 404 })
    }

    return NextResponse.json({ userPlan })
  } catch {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
