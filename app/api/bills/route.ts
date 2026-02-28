import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getDb } from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const sql = getDb()
  const bills = await sql`
    SELECT * FROM bills WHERE user_id = ${session.id} ORDER BY created_at DESC
  `
  return NextResponse.json(bills)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { customer_name, customer_phone, customer_address, items, total_amount, payment_status } = await req.json()
    const sql = getDb()
    const result = await sql`
      INSERT INTO bills (user_id, customer_name, customer_phone, customer_address, items, total_amount, payment_status)
      VALUES (${session.id}, ${customer_name}, ${customer_phone}, ${customer_address || ''}, ${JSON.stringify(items)}, ${total_amount}, ${payment_status})
      RETURNING *
    `
    return NextResponse.json(result[0])
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
