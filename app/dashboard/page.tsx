import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import AppShell from '@/components/layout/AppShell'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) redirect('/auth/login')
  return (
    <AppShell user={session}>
      <DashboardClient />
    </AppShell>
  )
}
