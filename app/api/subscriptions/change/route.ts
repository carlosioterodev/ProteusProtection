import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getPlanBySlug, getUserSubscription } from '@/lib/plans'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

export async function PUT(request: Request) {
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

    const newPlan = await getPlanBySlug(planSlug)
    if (!newPlan) {
      return NextResponse.json({ error: 'Plan no encontrado' }, { status: 404 })
    }

    const currentSub = await getUserSubscription(decoded.userId)
    if (!currentSub) {
      return NextResponse.json({ error: 'Sin suscripción activa' }, { status: 400 })
    }

    // Update subscription
    const result = await pool.query(
      `UPDATE subscriptions 
       SET plan_id = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [newPlan.id, currentSub.id]
    )

    return NextResponse.json({ subscription: result.rows[0] })
  } catch {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
