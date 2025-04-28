import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

interface User {
  username: string;
  password: string;
  role: string;
}

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    // Baca file credentials.json
    const credentialsPath = join(process.cwd(), 'lib', 'auth', 'credentials.json')
    const credentialsRaw = readFileSync(credentialsPath, 'utf-8')
    const credentials = JSON.parse(credentialsRaw)

    // Cari user yang sesuai
    const user = credentials.users.find(
      (u: User) => u.username === username && u.password === password
    )

    if (!user) {
      return NextResponse.json(
        { message: 'Username atau password salah' },
        { status: 401 }
      )
    }

    // Set cookie untuk session
    const response = NextResponse.json({ success: true })
    response.cookies.set('admin-token', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 // 24 jam
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan pada server' },
      { status: 500 }
    )
  }
} 