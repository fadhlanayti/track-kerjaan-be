'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { LayoutDashboard, FolderKanban, Users, UserPlus } from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'DEVELOPER', 'CLIENT'] },
  { href: '/projects', label: 'Projects', icon: FolderKanban, roles: ['ADMIN', 'DEVELOPER', 'CLIENT'] },
  { href: '/users', label: 'Users', icon: Users, roles: ['ADMIN'] },
  { href: '/users/invite', label: 'Invite User', icon: UserPlus, roles: ['ADMIN'] },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const role = session?.user?.role || 'CLIENT'

  return (
    <aside
      className="fixed left-0 top-0 h-full flex flex-col z-30"
      style={{
        width: 'var(--sidebar-width)',
        backgroundColor: '#202524',
        borderRight: 'none',
      }}
    >
      {/* Brand */}
      <div className="px-5 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-2.5 mb-0.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ backgroundColor: '#087CF0' }}
          >
            W
          </div>
          <h1 className="text-sm font-bold tracking-tight text-white">
            WeballCreative
          </h1>
        </div>
        <p className="text-xs ml-9" style={{ color: 'rgba(255,255,255,0.4)' }}>Project Tracker</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems
          .filter(item => item.roles.includes(role))
          .map(item => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{
                  color: active ? '#ffffff' : 'rgba(255,255,255,0.55)',
                  backgroundColor: active ? '#087CF0' : 'transparent',
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
                  if (!active) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.07)'
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
                  if (!active) e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                <item.icon size={17} />
                {item.label}
              </Link>
            )
          })}
      </nav>

      {/* User info at bottom */}
      <div className="px-4 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
            style={{ backgroundColor: '#087CF0' }}
          >
            {(session?.user?.name || '?')[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-white truncate">{session?.user?.name}</p>
            <p className="text-[11px] truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>{session?.user?.role}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
