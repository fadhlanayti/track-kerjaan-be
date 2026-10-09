'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  UserPlus,
} from 'lucide-react'

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
    <aside className="fixed left-0 top-0 h-full w-60 bg-white border-r flex flex-col z-30" style={{ borderColor: '#E6E7F0' }}>
      <div className="p-5 border-b" style={{ borderColor: '#E6E7F0' }}>
        <h1 className="text-lg font-bold tracking-tight" style={{ color: '#122056' }}>
          WeballCreative
        </h1>
        <p className="text-xs mt-0.5" style={{ color: '#5B65DC' }}>Project Tracker</p>
      </div>

      <nav className="flex-1 py-3 px-3 space-y-1">
        {navItems
          .filter(item => item.roles.includes(role))
          .map(item => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                style={{
                  color: active ? '#FFFFFF' : '#122056',
                  backgroundColor: active ? '#5B65DC' : 'transparent',
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
                  if (!active) e.currentTarget.style.backgroundColor = '#E6E7F0'
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
                  if (!active) e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            )
          })}
      </nav>

      <div className="p-3 border-t text-xs" style={{ borderColor: '#E6E7F0', color: '#8890b5' }}>
        v1.0.0
      </div>
    </aside>
  )
}
