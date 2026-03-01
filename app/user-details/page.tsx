import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import AppShell from "@/components/layout/AppShell";
import UserDetailsClient from "./UserDetailsClient";

export default async function UserDetailsPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");
  return (
    <AppShell user={session}>
      <UserDetailsClient />
    </AppShell>
  );
}
