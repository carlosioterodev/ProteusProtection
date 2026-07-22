# Task 5: Middleware Admin Protection

**Files:**
- Modify: `middleware.ts`

**Interfaces:**
- Consumes: `verifyToken` from `@/lib/auth`

- [ ] **Step 1: Update middleware with admin protection**

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || ''

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

    try {
      const payload = verifyToken(token)
      if (payload.email !== ADMIN_EMAIL) {
        if (isAdmin) {
          return NextResponse.redirect(new URL('/dashboard', request.url))
        }
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    } catch {
      if (isAdmin) {
        return NextResponse.redirect(new URL('/login', request.url))
      }
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
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
```

- [ ] **Step 2: Commit**

```bash
git add middleware.ts
git commit -m "feat: add admin route protection to middleware"
```
