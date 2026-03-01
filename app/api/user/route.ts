import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sql = getDb();
  const result =
    await sql`SELECT id, name, phone, address FROM users WHERE id = ${session.id}`;
  if (result.length === 0)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(result[0]);
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { name, phone, address } = await req.json();
    if (!name || !phone)
      return NextResponse.json(
        { error: "Name and phone required" },
        { status: 400 },
      );
    const sql = getDb();
    const result = await sql`
      UPDATE users SET name = ${name}, phone = ${phone}, address = ${address || ""}
      WHERE id = ${session.id}
      RETURNING id, name, phone, address
    `;
    return NextResponse.json(result[0]);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
