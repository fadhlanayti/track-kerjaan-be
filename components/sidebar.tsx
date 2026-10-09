'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { LayoutDashboard, FolderKanban, Users, UserPlus, X } from 'lucide-react'
import { useSidebar } from './providers'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'DEVELOPER', 'CLIENT'] },
  { href: '/projects', label: 'Projects', icon: FolderKanban, roles: ['ADMIN', 'DEVELOPER', 'CLIENT'] },
  { href: '/users', label: 'Users', icon: Users, roles: ['ADMIN'], exact: true },
  { href: '/users/invite', label: 'Invite User', icon: UserPlus, roles: ['ADMIN'], exact: true },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { open, toggle } = useSidebar()
  const role = session?.user?.role || 'CLIENT'

  function isActive(item: typeof navItems[0]) {
    if (item.exact) return pathname === item.href
    return pathname === item.href || pathname.startsWith(item.href + '/')
  }

  function handleNavClick() {
    // close on mobile after navigation
    if (window.innerWidth < 768) toggle()
  }

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/40"
          style={{ display: 'block' }}
          onClick={toggle}
        />
      )}

      <aside
        className="fixed left-0 top-0 h-full flex flex-col z-30 transition-transform"
        style={{
          width: 'var(--sidebar-width)',
          backgroundColor: '#202524',
          // On mobile: slide out when closed, always visible on desktop
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
        }}
      >
        {/* Brand */}
        <div className="px-5 py-5 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div>
            <div className="flex items-center gap-2.5 mb-0.5">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{ backgroundColor: '#087CF0' }}
              >
                W
              </div>
              <h1 className="text-sm font-bold tracking-tight text-white">WeballCreative</h1>
            </div>
            <p className="text-xs ml-9" style={{ color: 'rgba(255,255,255,0.4)' }}>Project Tracker</p>
          </div>
          {/* Close button — visible on mobile */}
          <button
            onClick={toggle}
            className="text-white/50 hover:text-white p-1 rounded-lg transition-colors md:hidden"
            style={{ flexShrink: 0 }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {navItems
            .filter(item => item.roles.includes(role))
            .map(item => {
              const active = isActive(item)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleNavClick}
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

        {/* User info */}
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
    </>
  )
}
