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
      <main className="ml-60 mt-14 p-6">
        {children}
      </main>
    </div>
  )
}
