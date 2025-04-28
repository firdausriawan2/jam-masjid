import { NextResponse } from 'next/server'
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

export async function POST(request: Request) {
  try {
    const { name, currentPassword, newPassword } = await request.json()

    // Baca file credentials.json
    const credentialsPath = join(process.cwd(), 'lib', 'auth', 'credentials.json')
    const credentialsRaw = readFileSync(credentialsPath, 'utf-8')
    const credentials = JSON.parse(credentialsRaw)

    // Cek password saat ini
    const user = credentials.users[0]
    if (user.password !== currentPassword) {
      return NextResponse.json(
        { message: 'Password saat ini tidak sesuai' },
        { status: 401 }
      )
    }

    // Update kredensial
    credentials.users[0] = {
      ...user,
      name,
      ...(newPassword ? { password: newPassword } : {})
    }

    // Simpan perubahan
    writeFileSync(credentialsPath, JSON.stringify(credentials, null, 2))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating credentials:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan saat memperbarui kredensial' },
      { status: 500 }
    )
  }
} 