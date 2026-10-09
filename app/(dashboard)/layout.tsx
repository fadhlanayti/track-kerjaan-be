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
    <div className="min-h-screen bg-[#F2F2F0]">
      <Sidebar />
      <Topbar />
      {/* mt-14 = topbar height (h-14), md:ml-60 = sidebar width (w-60) */}
      <main className="mt-14 md:ml-60 p-5 md:p-7">
        {children}
      </main>
    </div>
  )
}
