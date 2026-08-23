import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const ADMIN_SECRET = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET ?? '');

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- Área admin ---
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const token = request.cookies.get('zw_admin_token')?.value;
    if (!token) return NextResponse.redirect(new URL('/admin/login', request.url));
    try {
      await jwtVerify(token, ADMIN_SECRET);
    } catch {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // --- Área do walker ---
  if (pathname.startsWith('/dashboard')) {
    const accessToken = request.cookies.get('sb-access-token')?.value;
    if (!accessToken) return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};
