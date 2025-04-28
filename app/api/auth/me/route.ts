import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

export async function GET() {
  try {
    // Baca file credentials.json
    const credentialsPath = join(process.cwd(), 'lib', 'auth', 'credentials.json')
    const credentialsRaw = readFileSync(credentialsPath, 'utf-8')
    const credentials = JSON.parse(credentialsRaw)

    // Ambil data user pertama (karena hanya ada 1 admin)
    const user = credentials.users[0]

    // Pisahkan password dari data user
    const userWithoutPassword = Object.fromEntries(
      Object.entries(user).filter(([key]) => key !== 'password')
    )

    return NextResponse.json({
      success: true,
      user: userWithoutPassword
    })
  } catch (error) {
    console.error('Error getting user:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan saat mengambil data user' },
      { status: 500 }
    )
  }
} 