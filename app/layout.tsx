import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'FlowerBill - Billing System',
  description: 'Flower Shop Billing System',
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="gradient-bg min-h-screen">
        {children}
        <Toaster position="top-right" toastOptions={{
          style: { background: '#1a0533', color: 'white', border: '1px solid rgba(139,92,246,0.3)' }
        }} />
      </body>
    </html>
  )
}
