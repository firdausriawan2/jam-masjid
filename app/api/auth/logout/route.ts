import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // Hapus cookie admin-token dengan mengatur maxAge ke 0
    const response = NextResponse.json({ success: true })
    response.cookies.set('admin-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0 // Hapus cookie dengan mengatur maxAge ke 0
    })

    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan saat logout' },
      { status: 500 }
    )
  }
} 