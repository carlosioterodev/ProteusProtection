// lib/plans.ts
import pool from '@/lib/db'

export interface Plan {
  id: number
  name: string
  slug: string
  price_monthly: number
  trial_days: number
}

export interface PlanFeature {
  id: number
  plan_id: number
  feature_key: string
  enabled: boolean
  config: Record<string, unknown>
}

export interface Subscription {
  id: number
  user_id: number
  plan_id: number
  status: 'trialing' | 'active' | 'canceled' | 'expired'
  trial_ends_at: Date | null
  current_period_end: Date | null
  created_at: Date
}

export interface UserPlan {
  plan: Plan
  features: PlanFeature[]
  subscription: Subscription | null
}

export async function getPlanBySlug(slug: string): Promise<Plan | null> {
  const result = await pool.query('SELECT * FROM plans WHERE slug = $1', [slug])
  return result.rows[0] || null
}

export async function getPlanFeatures(planId: number): Promise<PlanFeature[]> {
  const result = await pool.query('SELECT * FROM plan_features WHERE plan_id = $1', [planId])
  return result.rows
}

export async function getUserSubscription(userId: number): Promise<Subscription | null> {
  const result = await pool.query(
    `SELECT * FROM subscriptions 
     WHERE user_id = $1 AND status IN ('trialing', 'active')
     ORDER BY created_at DESC LIMIT 1`,
    [userId]
  )
  return result.rows[0] || null
}

export async function getUserPlan(userId: number): Promise<UserPlan | null> {
  const subscription = await getUserSubscription(userId)
  
  if (!subscription) {
    // No subscription - default to personal plan (free tier)
    const plan = await getPlanBySlug('personal')
    if (!plan) return null
    const features = await getPlanFeatures(plan.id)
    return { plan, features, subscription: null }
  }

  const plan = await pool.query('SELECT * FROM plans WHERE id = $1', [subscription.plan_id])
  if (plan.rows.length === 0) return null

  const features = await getPlanFeatures(subscription.plan_id)
  return { plan: plan.rows[0], features, subscription }
}

export async function startTrial(userId: number, planSlug: string): Promise<Subscription> {
  const plan = await getPlanBySlug(planSlug)
  if (!plan) throw new Error('Plan not found')

  // Check if user already has active subscription
  const existing = await getUserSubscription(userId)
  if (existing) throw new Error('User already has active subscription')

  const trialEndsAt = new Date()
  trialEndsAt.setDate(trialEndsAt.getDate() + plan.trial_days)

  const result = await pool.query(
    `INSERT INTO subscriptions (user_id, plan_id, status, trial_ends_at)
     VALUES ($1, $2, 'trialing', $3)
     RETURNING *`,
    [userId, plan.id, trialEndsAt]
  )

  return result.rows[0]
}

export function isFeatureEnabled(features: PlanFeature[], featureKey: string): boolean {
  const feature = features.find(f => f.feature_key === featureKey)
  return feature?.enabled ?? false
}

export function getFeatureConfig(features: PlanFeature[], featureKey: string): Record<string, unknown> {
  const feature = features.find(f => f.feature_key === featureKey)
  return (feature?.config as Record<string, unknown>) ?? {}
}
