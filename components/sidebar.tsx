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
      style={{ width: 'var(--sidebar-width)', backgroundColor: 'var(--bg-sidebar)', borderRight: '1px solid var(--border)' }}
    >
      <div className="p-5" style={{ borderBottom: '1px solid var(--border)' }}>
        <h1 className="text-base font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          WeballCreative
        </h1>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-accent)' }}>Project Tracker</p>
      </div>

      <nav className="flex-1 py-3 px-3 space-y-0.5">
        {navItems
          .filter(item => item.roles.includes(role))
          .map(item => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item ${active ? 'active' : ''}`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            )
          })}
      </nav>

      <div className="px-4 py-3 text-xs" style={{ borderTop: '1px solid var(--border)', color: 'var(--text-muted)' }}>
        v1.0.0
      </div>
    </aside>
  )
}
