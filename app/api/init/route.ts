import { NextResponse } from 'next/server'
import { initDb } from '@/lib/db'

export async function GET() {
  try {
    await initDb()
    return NextResponse.json({ success: true, message: 'Database initialized' })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
