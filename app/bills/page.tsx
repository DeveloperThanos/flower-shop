import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import AppShell from '@/components/layout/AppShell'
import BillsClient from './BillsClient'

export default async function BillsPage() {
  const session = await getSession()
  if (!session) redirect('/auth/login')
  return (
    <AppShell user={session}>
      <BillsClient />
    </AppShell>
  )
}
