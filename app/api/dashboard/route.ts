import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sql = getDb();

  const totalBills = await sql`
    SELECT COUNT(*) as count, COALESCE(SUM(total_amount),0) as total
    FROM bills WHERE user_id = ${session.id}`;

  const todayBills = await sql`
    SELECT COUNT(*) as count, COALESCE(SUM(total_amount),0) as total
    FROM bills WHERE user_id = ${session.id} AND DATE(created_at) = CURRENT_DATE`;

  const paidBills = await sql`
    SELECT COUNT(*) as count, COALESCE(SUM(total_amount),0) as total
    FROM bills WHERE user_id = ${session.id} AND payment_status = true`;

  const pendingBills = await sql`
    SELECT COUNT(*) as count, COALESCE(SUM(total_amount),0) as total
    FROM bills WHERE user_id = ${session.id} AND payment_status = false`;

  const thisMonthBills = await sql`
    SELECT COUNT(*) as count, COALESCE(SUM(total_amount),0) as total
    FROM bills WHERE user_id = ${session.id}
    AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)`;

  const lastMonthBills = await sql`
    SELECT COUNT(*) as count, COALESCE(SUM(total_amount),0) as total
    FROM bills WHERE user_id = ${session.id}
    AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')`;

  // Monthly revenue for last 12 months
  const monthlyRevenue = await sql`
    SELECT
      TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YY') as month,
      TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') as month_key,
      COALESCE(SUM(total_amount), 0) as revenue,
      COUNT(*) as count,
      COUNT(*) FILTER (WHERE payment_status = true) as paid_count
    FROM bills
    WHERE user_id = ${session.id}
      AND created_at >= CURRENT_DATE - INTERVAL '12 months'
    GROUP BY DATE_TRUNC('month', created_at)
    ORDER BY DATE_TRUNC('month', created_at) ASC`;

  const recentBills = await sql`
    SELECT id, customer_name, customer_phone, total_amount, payment_status, created_at, items
    FROM bills WHERE user_id = ${session.id}
    ORDER BY created_at DESC LIMIT 10`;

  const flowerStats = await sql`
    SELECT item->>'name' as flower,
           COUNT(*) as count,
           COALESCE(SUM((item->>'amount')::numeric), 0) as total_revenue
    FROM bills, jsonb_array_elements(items) as item
    WHERE user_id = ${session.id}
    GROUP BY item->>'name'
    ORDER BY count DESC
    LIMIT 6`;

  // Seller info for PDF generation
  const sellerInfo = await sql`
    SELECT name, phone, address FROM users WHERE id = ${session.id}`;

  return NextResponse.json({
    totalBills: totalBills[0],
    todayBills: todayBills[0],
    paidBills: paidBills[0],
    pendingBills: pendingBills[0],
    thisMonthBills: thisMonthBills[0],
    lastMonthBills: lastMonthBills[0],
    monthlyRevenue,
    recentBills,
    flowerStats,
    seller: sellerInfo[0] || { name: "", phone: "", address: "" },
  });
}
