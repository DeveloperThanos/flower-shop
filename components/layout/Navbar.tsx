'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface NavbarProps {
  user: { name: string; phone: string }
  onMenuToggle: () => void
}

export default function Navbar({ user, onMenuToggle }: NavbarProps) {
  const router = useRouter()
  const [showUser, setShowUser] = useState(false)

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    toast.success('Logged out')
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-4 md:px-6"
      style={{ background: 'rgba(10,0,16,0.9)', borderBottom: '1px solid rgba(139,92,246,0.2)', backdropFilter: 'blur(10px)' }}>
      
      <div className="flex items-center gap-3">
        <button onClick={onMenuToggle} className="md:hidden p-2 rounded-lg hover:bg-purple-900/30">
          <div className="w-5 h-0.5 bg-white mb-1"></div>
          <div className="w-5 h-0.5 bg-white mb-1"></div>
          <div className="w-5 h-0.5 bg-white"></div>
        </button>
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-2xl">{/*🌸*/}</span>
          <span className="font-bold text-white text-lg hidden sm:block">Flower Shop</span>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        {/*<button className="relative p-2 rounded-lg hover:bg-purple-900/30 text-purple-300">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>*/}

        <div className="relative">
          <button onClick={() => setShowUser(!showUser)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-purple-900/30 transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-purple-900 flex items-center justify-center text-sm font-bold">
              {user.name[0].toUpperCase()}
            </div>
            <span className="text-white text-sm hidden sm:block max-w-[120px] truncate">{user.name}</span>
          </button>
          {showUser && (
            <div className="absolute right-0 mt-1 w-48 card p-2 z-50">
              <div className="px-3 py-2 border-b border-purple-900/50 mb-1">
                <p className="text-white text-sm font-medium truncate">{user.name}</p>
                <p className="text-purple-400 text-xs">{user.phone}</p>
              </div>
              <button onClick={logout} className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-900/20 rounded-lg transition-colors">
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
