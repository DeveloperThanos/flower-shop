'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface DashboardData {
  totalBills: { count: string; total: string }
  todayBills: { count: string; total: string }
  paidBills: { count: string }
  recentBills: any[]
  flowerStats: any[]
}

export default function DashboardClient() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-purple-400 text-lg animate-pulse">Loading dashboard...</div>
    </div>
  )

  const stats = [
    { label: 'Total Bills', value: data?.totalBills.count || '0', sub: `₹${Number(data?.totalBills.total || 0).toFixed(2)}`, icon: '📋', color: 'from-purple-900/60 to-purple-800/40' },
    { label: "Today's Bills", value: data?.todayBills.count || '0', sub: `₹${Number(data?.todayBills.total || 0).toFixed(2)}`, icon: '📅', color: 'from-violet-900/60 to-violet-800/40' },
    { label: 'Paid Bills', value: data?.paidBills.count || '0', sub: 'Payments received', icon: '✅', color: 'from-green-900/60 to-green-800/40' },
    { label: 'Pending', value: String(Number(data?.totalBills.count || 0) - Number(data?.paidBills.count || 0)), sub: 'Awaiting payment', icon: '⏳', color: 'from-orange-900/60 to-orange-800/40' },
  ]

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-purple-400 text-sm mt-1">Welcome back to FlowerBill</p>
        </div>
        <Link href="/billing" className="btn-secondary text-sm px-4 py-2 rounded-xl inline-flex items-center gap-2">
          <span>+ New Bill</span>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        {stats.map(s => (
          <div key={s.label} className={`card card-hover p-4 bg-gradient-to-br ${s.color}`}>
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className="text-2xl font-bold text-white">{s.value}</div>
            <div className="text-xs text-purple-300 mt-0.5">{s.label}</div>
            <div className="text-xs text-purple-400 mt-1">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="card p-4 md:p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Top Flowers Sold</h2>
          {data?.flowerStats.length === 0 ? (
            <p className="text-purple-400 text-sm text-center py-8">No data yet</p>
          ) : (
            <div className="space-y-3">
              {data?.flowerStats.map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="text-xl">🌺</div>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-white font-medium">{f.flower}</span>
                      <span className="text-purple-400">{f.count} bills</span>
                    </div>
                    <div className="mt-1 h-1.5 bg-purple-900/50 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-600 to-violet-500 rounded-full"
                        style={{ width: `${Math.min(100, (Number(f.count) / Number(data.flowerStats[0].count)) * 100)}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-4 md:p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Bills</h2>
            <Link href="/bills" className="text-purple-400 text-sm hover:text-purple-300">View all</Link>
          </div>
          {data?.recentBills.length === 0 ? (
            <p className="text-purple-400 text-sm text-center py-8">No bills yet. <Link href="/billing" className="text-purple-400 underline">Create one!</Link></p>
          ) : (
            <div className="space-y-3">
              {data?.recentBills.map((bill) => (
                <div key={bill.id} className="flex items-center justify-between p-3 rounded-xl bg-purple-900/20 border border-purple-900/40">
                  <div>
                    <p className="text-white text-sm font-medium">{bill.customer_name}</p>
                    <p className="text-purple-400 text-xs">{new Date(bill.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-semibold text-sm">₹{Number(bill.total_amount).toFixed(2)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${bill.payment_status ? 'bg-green-900/40 text-green-400' : 'bg-orange-900/40 text-orange-400'}`}>
                      {bill.payment_status ? 'Paid' : 'Pending'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
