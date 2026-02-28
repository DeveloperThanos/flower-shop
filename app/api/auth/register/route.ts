import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getDb } from '@/lib/db'
import { signToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { name, phone, address, password } = await req.json()
    if (!name || !phone || !password) {
      return NextResponse.json({ error: 'Name, phone and password required' }, { status: 400 })
    }
    const sql = getDb()
    const existing = await sql`SELECT id FROM users WHERE phone = ${phone}`
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Phone number already registered' }, { status: 400 })
    }
    const hash = await bcrypt.hash(password, 10)
    const result = await sql`
      INSERT INTO users (name, phone, address, password_hash)
      VALUES (${name}, ${phone}, ${address || ''}, ${hash})
      RETURNING id, name, phone
    `
    const user = result[0]
    const token = signToken({ id: user.id, name: user.name, phone: user.phone })
    const response = NextResponse.json({ success: true, user: { id: user.id, name: user.name, phone: user.phone } })
    response.cookies.set('token', token, { httpOnly: true, maxAge: 60 * 60 * 24 * 7, path: '/' })
    return response
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
