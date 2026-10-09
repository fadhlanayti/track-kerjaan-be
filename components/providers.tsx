'use client'
import { SessionProvider } from 'next-auth/react'
import { createContext, useContext, useState, useEffect } from 'react'

const SidebarCtx = createContext({ open: false, toggle: () => {} })
export const useSidebar = () => useContext(SidebarCtx)

export function Providers({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  // Close sidebar on route change (mobile) — listen for popstate
  useEffect(() => {
    const close = () => setOpen(false)
    window.addEventListener('popstate', close)
    return () => window.removeEventListener('popstate', close)
  }, [])

  return (
    <SessionProvider>
      <SidebarCtx.Provider value={{ open, toggle: () => setOpen(o => !o) }}>
        {children}
      </SidebarCtx.Provider>
    </SessionProvider>
  )
}
