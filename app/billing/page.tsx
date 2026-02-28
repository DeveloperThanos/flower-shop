import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import AppShell from "@/components/layout/AppShell";
import BillingClient from "./BillingClient";

interface UserDetails {
  name: string;
  phone: string;
  address: string;
}

export default async function BillingPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const sql = getDb();
  const result =
    await sql`SELECT name, phone, address FROM users WHERE id = ${session.id}`;

  const userDetails: UserDetails = {
    name: result[0]?.name ?? "",
    phone: result[0]?.phone ?? "",
    address: result[0]?.address ?? "",
  };

  return (
    <AppShell user={session}>
      <BillingClient defaultUser={userDetails} />
    </AppShell>
  );
}
