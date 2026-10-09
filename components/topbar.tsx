'use client'
import { useState, useEffect, useRef } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Bell, LogOut } from 'lucide-react'

interface Notification {
  id: string
  title: string
  message: string
  read: boolean
  createdAt: string
  referenceId?: string
  referenceType?: string
}

export function Topbar() {
  const { data: session } = useSession()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showNotifs, setShowNotifs] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/notifications')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setNotifications(data) })
      .catch(() => {})

    const interval = setInterval(() => {
      fetch('/api/notifications')
        .then(r => r.json())
        .then(data => { if (Array.isArray(data)) setNotifications(data) })
        .catch(() => {})
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifs(false)
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  async function markRead(id: string) {
    await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' })
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const roleBg: Record<string, string> = {
    ADMIN: 'var(--periwinkle)',
    DEVELOPER: '#0ea5e9',
    CLIENT: 'var(--text-muted)',
  }

  return (
    <header
      className="fixed top-0 right-0 flex items-center justify-end gap-3 px-5 z-20"
      style={{
        left: 'var(--sidebar-width)',
        height: 'var(--topbar-height)',
        backgroundColor: 'var(--bg-sidebar)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {/* Notifications */}
      <div className="relative" ref={notifRef}>
        <button
          onClick={() => setShowNotifs(!showNotifs)}
          className="nav-item p-2"
          style={{ gap: 0 }}
        >
          <Bell size={19} />
          {unreadCount > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold text-white rounded-full"
              style={{ backgroundColor: 'var(--periwinkle)' }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {showNotifs && (
          <div className="dropdown" style={{ width: '20rem', maxHeight: '24rem', overflowY: 'auto' }}>
            <div className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
              Notifications
            </div>
            {notifications.length === 0 ? (
              <div className="p-4 text-sm text-center" style={{ color: 'var(--text-muted)' }}>No notifications</div>
            ) : (
              notifications.slice(0, 20).map(n => (
                <div
                  key={n.id}
                  className="px-3 py-2.5 cursor-pointer transition-colors"
                  style={{
                    borderBottom: '1px solid var(--border)',
                    backgroundColor: n.read ? 'transparent' : 'var(--periwinkle-subtle)',
                  }}
                  onClick={() => markRead(n.id)}
                  onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => { e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)' }}
                  onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => { e.currentTarget.style.backgroundColor = n.read ? 'transparent' : 'var(--periwinkle-subtle)' }}
                >
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{n.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{n.message}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* User Menu */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="nav-item py-1.5 px-2"
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
            style={{ backgroundColor: roleBg[session?.user?.role || 'CLIENT'] }}
          >
            {(session?.user?.name || '?')[0].toUpperCase()}
          </div>
          <span className="text-sm font-medium hidden sm:block" style={{ color: 'var(--text-primary)' }}>
            {session?.user?.name}
          </span>
        </button>

        {showMenu && (
          <div className="dropdown" style={{ width: '12rem' }}>
            <div className="px-3 py-2.5" style={{ borderBottom: '1px solid var(--border)' }}>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{session?.user?.name}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{session?.user?.role}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="nav-item w-full rounded-none px-3 py-2.5"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
