import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getDb } from '@/lib/db'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const sql = getDb()
  
  const totalBills = await sql`SELECT COUNT(*) as count, COALESCE(SUM(total_amount),0) as total FROM bills WHERE user_id = ${session.id}`
  const todayBills = await sql`SELECT COUNT(*) as count, COALESCE(SUM(total_amount),0) as total FROM bills WHERE user_id = ${session.id} AND DATE(created_at) = CURRENT_DATE`
  const paidBills = await sql`SELECT COUNT(*) as count FROM bills WHERE user_id = ${session.id} AND payment_status = true`
  const recentBills = await sql`SELECT * FROM bills WHERE user_id = ${session.id} ORDER BY created_at DESC LIMIT 5`
  
  const flowerStats = await sql`
    SELECT item->>'name' as flower, COUNT(*) as count
    FROM bills, jsonb_array_elements(items) as item
    WHERE user_id = ${session.id}
    GROUP BY item->>'name'
    ORDER BY count DESC
    LIMIT 5
  `

  return NextResponse.json({
    totalBills: totalBills[0],
    todayBills: todayBills[0],
    paidBills: paidBills[0],
    recentBills,
    flowerStats
  })
}
