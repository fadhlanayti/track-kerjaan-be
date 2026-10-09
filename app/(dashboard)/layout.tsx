export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { Sidebar } from '@/components/sidebar'
import { Topbar } from '@/components/topbar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-body)' }}>
      <Sidebar />
      <Topbar />
      <main style={{ marginLeft: 'var(--sidebar-width)', marginTop: 'var(--topbar-height)', padding: '1.75rem 2rem' }}>
        {children}
      </main>
    </div>
  )
}
