'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/billing', label: 'New Bill', icon: '🧾' },
  { href: '/bills', label: 'All Bills', icon: '📋' },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-30 bg-black/60 md:hidden" onClick={onClose} />
      )}
      <aside className={`fixed top-16 left-0 bottom-0 z-40 w-60 transition-transform duration-300 
        ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
        style={{ background: 'rgba(10,0,16,0.95)', borderRight: '1px solid rgba(139,92,246,0.2)' }}>
        <nav className="p-4 space-y-1 mt-2">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                ${pathname === item.href
                  ? 'bg-purple-700/40 text-white border border-purple-600/40'
                  : 'text-purple-300 hover:bg-purple-900/30 hover:text-white'
                }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-6 left-0 right-0 px-4">
          <div className="card p-3 text-center">
            <div className="text-2xl mb-1">{/*🌸*/}</div>
            <p className="text-xs text-purple-400">Flower Shop v1.0</p>
          </div>
        </div>
      </aside>
    </>
  )
}
