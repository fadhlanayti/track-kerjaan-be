'use client'
import { useState, useEffect, useRef } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Bell, LogOut, User } from 'lucide-react'

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
    ADMIN: '#122056',
    DEVELOPER: '#5B65DC',
    CLIENT: '#8890b5',
  }

  return (
    <header
      className="fixed top-0 right-0 h-14 flex items-center justify-end gap-3 px-5 bg-white border-b z-20"
      style={{ left: '15rem', borderColor: '#E6E7F0' }}
    >
      {/* Notifications */}
      <div className="relative" ref={notifRef}>
        <button
          onClick={() => setShowNotifs(!showNotifs)}
          className="relative p-2 rounded-md transition-colors"
          style={{ color: '#122056' }}
          onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.backgroundColor = '#E6E7F0')}
          onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold text-white rounded-full"
              style={{ backgroundColor: '#5B65DC' }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {showNotifs && (
          <div className="absolute right-0 top-12 w-80 max-h-96 overflow-y-auto bg-white rounded-lg shadow-lg border" style={{ borderColor: '#E6E7F0' }}>
            <div className="p-3 border-b font-semibold text-sm" style={{ borderColor: '#E6E7F0', color: '#122056' }}>
              Notifications
            </div>
            {notifications.length === 0 ? (
              <div className="p-4 text-sm text-center" style={{ color: '#8890b5' }}>No notifications</div>
            ) : (
              notifications.slice(0, 20).map(n => (
                <div
                  key={n.id}
                  className="p-3 border-b cursor-pointer transition-colors"
                  style={{
                    borderColor: '#E6E7F0',
                    backgroundColor: n.read ? 'transparent' : '#f5f5ff',
                  }}
                  onClick={() => markRead(n.id)}
                >
                  <p className="text-sm font-medium" style={{ color: '#122056' }}>{n.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#8890b5' }}>{n.message}</p>
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
          className="flex items-center gap-2 p-1.5 rounded-md transition-colors"
          onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.backgroundColor = '#E6E7F0')}
          onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
            style={{ backgroundColor: roleBg[session?.user?.role || 'CLIENT'] }}
          >
            {(session?.user?.name || '?')[0].toUpperCase()}
          </div>
          <span className="text-sm font-medium hidden sm:block" style={{ color: '#122056' }}>
            {session?.user?.name}
          </span>
        </button>

        {showMenu && (
          <div className="absolute right-0 top-12 w-48 bg-white rounded-lg shadow-lg border" style={{ borderColor: '#E6E7F0' }}>
            <div className="p-3 border-b" style={{ borderColor: '#E6E7F0' }}>
              <p className="text-sm font-medium" style={{ color: '#122056' }}>{session?.user?.name}</p>
              <p className="text-xs" style={{ color: '#8890b5' }}>{session?.user?.role}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="w-full flex items-center gap-2 p-3 text-sm text-left transition-colors"
              style={{ color: '#122056' }}
              onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.backgroundColor = '#E6E7F0')}
              onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.backgroundColor = 'transparent')}
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
