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

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-20 bg-black/40 md:hidden" onClick={toggle} />
      )}

      <aside className={`fixed left-0 top-0 h-full w-60 flex flex-col z-30 bg-charcoal transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>

        {/* Brand */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/8">
          <div>
            <div className="flex items-center gap-2.5 mb-0.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0 bg-accent">W</div>
              <h1 className="text-sm font-bold tracking-tight text-white">WeballCreative</h1>
            </div>
            <p className="text-xs ml-9 text-white/40">Project Tracker</p>
          </div>
          <button onClick={toggle} className="md:hidden text-white/50 hover:text-white p-1 rounded-lg cursor-pointer bg-transparent border-none">
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 flex flex-col gap-1 px-3 py-4 overflow-y-auto">
          {navItems.filter(item => item.roles.includes(role)).map(item => {
            const active = isActive(item)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => { if (window.innerWidth < 768) toggle() }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? 'bg-accent text-white'
                    : 'text-white/55 hover:bg-white/7 hover:text-white'
                }`}
              >
                <item.icon size={17} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* User info */}
        <div className="px-4 py-4 border-t border-white/8">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0 bg-accent">
              {(session?.user?.name || '?')[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-white truncate">{session?.user?.name}</p>
              <p className="text-[11px] text-white/40 truncate">{session?.user?.role}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
