import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Cek apakah request menuju halaman admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const token = request.cookies.get('admin-token')

    // Jika mengakses halaman login dan sudah ada token, redirect ke admin
    if (request.nextUrl.pathname === '/admin/login' && token) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }

    // Jika mengakses halaman admin (selain login) dan tidak ada token, redirect ke login
    if (request.nextUrl.pathname !== '/admin/login' && !token) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*'
} 