import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { extractClanCode, fetchClanTheme, buildCssVars } from './lib/theme';

function redirectToLogin(request: NextRequest): NextResponse {
  const loginUrl = new URL('/admin/login', request.url);
  loginUrl.searchParams.set('from', request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

function decodeJwtPayload(token: string): { exp?: number } | null {
  const [, payload] = token.split('.');
  if (!payload) return null;

  try {
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(normalized);
    return JSON.parse(decoded) as { exp?: number };
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const token = request.cookies.get('token')?.value;

    if (!token || token.split('.').length !== 3) {
      return redirectToLogin(request);
    }

    const payload = decodeJwtPayload(token);
    if (!payload) {
      return redirectToLogin(request);
    }

    if (payload.exp && payload.exp * 1000 < Date.now()) {
      const response = redirectToLogin(request);
      response.cookies.delete('token');
      return response;
    }
  }

  const response = NextResponse.next();
  const clanCode = extractClanCode(request.headers.get('host') ?? '');

  if (clanCode) {
    const theme = await fetchClanTheme(clanCode);

    if (theme) {
      response.headers.set('x-clan-css-vars', buildCssVars(theme));
      response.headers.set('x-clan-code', clanCode);

      if (theme.fontFamily) {
        response.headers.set('x-clan-font', theme.fontFamily);
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
