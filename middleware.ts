import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || ''

function decodeJwtPayload(token: string): { userId?: number; email?: string } | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
    return payload
  } catch {
    return null
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get('proteus_token')?.value
  const pathname = request.nextUrl.pathname

  const isAuthPage = pathname === '/login'
  const isDashboard = pathname.startsWith('/dashboard')
  const isAdmin = pathname.startsWith('/admin')
  const isAdminApi = pathname.startsWith('/api/admin')
  const isApiAuth = pathname.startsWith('/api/auth')

  if (isApiAuth) return NextResponse.next()

  // Admin route protection
  if (isAdmin || isAdminApi) {
    if (!token) {
      if (isAdmin) {
        return NextResponse.redirect(new URL('/login', request.url))
      }
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = decodeJwtPayload(token)
    if (!payload || payload.email !== ADMIN_EMAIL) {
      if (isAdmin) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.next()
  }

  // Dashboard protection
  if (isDashboard && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/api/admin/:path*', '/login'],
}
