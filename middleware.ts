import { NextResponse, type NextRequest } from 'next/server'
import { isDevAdminBypassEnabled } from '@/lib/dev-admin'

const publicPaths = ['/', '/login', '/signup', '/stories', '/story', '/authors', '/genres', '/api', '/search']
const authPaths = ['/login', '/signup']

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  if (isDevAdminBypassEnabled) {
    return NextResponse.next()
  }

  const isPublicPath = publicPaths.some(path =>
    pathname === path || pathname.startsWith(path + '/') || pathname.startsWith('/api/')
  )
  const isAuthPath = authPaths.some(path => pathname === path || pathname.startsWith(path + '/'))

  // Check for session cookie (basic check - full auth happens client-side)
  const sessionCookie = request.cookies.get('sb-access-token') || request.cookies.get('supabase-auth-token')
  const hasSession = !!sessionCookie

  // Redirect to login if accessing protected route without session
  if (!hasSession && !isPublicPath) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // Redirect to dashboard if accessing auth pages with session
  if (hasSession && isAuthPath) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
