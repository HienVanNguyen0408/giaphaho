import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const token = req.cookies.get('platform_token')
  const { pathname } = req.nextUrl

  const isLoginPage = pathname === '/login'
  const isDashboard = pathname === '/' || pathname.startsWith('/(dashboard)') ||
    (!isLoginPage && !pathname.startsWith('/_next') && !pathname.startsWith('/api'))

  if (isDashboard && !token) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isLoginPage && token) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|login).*)',
  ],
}
