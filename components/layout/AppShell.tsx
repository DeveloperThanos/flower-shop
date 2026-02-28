'use client'
import { useState } from 'react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

interface AppShellProps {
  user: { name: string; phone: string }
  children: React.ReactNode
}

export default function AppShell({ user, children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  return (
    <div className="min-h-screen gradient-bg">
      <Navbar user={user} onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="pt-16 md:pl-60 min-h-screen">
        <div className="p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
