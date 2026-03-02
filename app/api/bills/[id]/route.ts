import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sql = getDb();
  const result =
    await sql`SELECT * FROM bills WHERE id = ${params.id} AND user_id = ${session.id}`;
  if (result.length === 0)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(result[0]);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const sql = getDb();

    // Support both simple payment_status toggle AND full update
    if (Object.keys(body).length === 1 && "payment_status" in body) {
      // Legacy simple toggle
      const result = await sql`
        UPDATE bills SET payment_status = ${body.payment_status}
        WHERE id = ${params.id} AND user_id = ${session.id}
        RETURNING *
      `;
      return NextResponse.json(result[0]);
    }

    // Full update
    const {
      customer_name,
      customer_phone,
      customer_address,
      items,
      total_amount,
      payment_status,
      payment_mode,
    } = body;

    const result = await sql`
      UPDATE bills SET
        customer_name = ${customer_name},
        customer_phone = ${customer_phone},
        customer_address = ${customer_address || ""},
        items = ${JSON.stringify(items)},
        total_amount = ${total_amount},
        payment_status = ${payment_status},
        payment_mode = ${payment_mode || null}
      WHERE id = ${params.id} AND user_id = ${session.id}
      RETURNING *
    `;
    return NextResponse.json(result[0]);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
