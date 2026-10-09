'use client'
import { useState, useEffect, useRef } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Bell, LogOut, Menu } from 'lucide-react'
import { useSidebar } from './providers'

interface Notification {
  id: string; title: string; message: string; read: boolean; createdAt: string
}

export function Topbar() {
  const { data: session } = useSession()
  const { toggle } = useSidebar()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showNotifs, setShowNotifs] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const load = () => fetch('/api/notifications').then(r => r.json()).then(d => { if (Array.isArray(d)) setNotifications(d) }).catch(() => {})
    load()
    const t = setInterval(load, 30000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifs(false)
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const unread = notifications.filter(n => !n.read).length

  async function markRead(id: string) {
    await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' })
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  return (
    <header className="fixed top-0 left-0 right-0 md:left-60 h-14 bg-white border-b border-[#E5E5E2] z-20 flex items-center justify-between px-5">
      {/* Hamburger — mobile only */}
      <button onClick={toggle} className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg hover:bg-[#F2F2F0] text-[#4A4E4A] cursor-pointer border-none bg-transparent">
        <Menu size={20} />
      </button>
      <div className="flex-1" />

      <div className="flex items-center gap-2">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative flex items-center justify-center w-9 h-9 rounded-lg hover:bg-[#F2F2F0] text-[#4A4E4A] cursor-pointer border-none bg-transparent"
          >
            <Bell size={19} />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold text-white rounded-full bg-[#087CF0]">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>
          {showNotifs && (
            <div className="dropdown w-80 max-h-96 overflow-y-auto">
              <div className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#737773] border-b border-[#E5E5E2]">Notifications</div>
              {notifications.length === 0 ? (
                <div className="p-4 text-sm text-center text-[#737773]">No notifications</div>
              ) : notifications.slice(0, 20).map(n => (
                <div
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className={`px-3 py-2.5 cursor-pointer border-b border-[#E5E5E2] hover:bg-[#F2F2F0] transition-colors ${n.read ? '' : 'bg-[#087CF0]/5'}`}
                >
                  <p className="text-sm font-medium text-[#202524]">{n.title}</p>
                  <p className="text-xs mt-0.5 text-[#737773]">{n.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[#F2F2F0] transition-colors cursor-pointer border-none bg-transparent"
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium bg-[#202524]">
              {(session?.user?.name || '?')[0].toUpperCase()}
            </div>
            <span className="text-sm font-medium text-[#202524] hidden sm:block">{session?.user?.name}</span>
          </button>
          {showMenu && (
            <div className="dropdown w-48">
              <div className="px-3 py-2.5 border-b border-[#E5E5E2]">
                <p className="text-sm font-medium text-[#202524]">{session?.user?.name}</p>
                <p className="text-xs text-[#737773]">{session?.user?.role}</p>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-[#4A4E4A] hover:bg-[#F2F2F0] transition-colors cursor-pointer border-none bg-transparent"
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
