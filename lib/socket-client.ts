'use client'

import { io, Socket } from 'socket.io-client'
import { useEffect, useRef } from 'react'

let socket: Socket | null = null

export function getSocket(): Socket {
  if (!socket) {
    socket = io({ path: '/socket.io', transports: ['websocket', 'polling'] })
  }
  return socket
}

export function useSocket(projectId: string | null) {
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (!projectId) return

    const s = getSocket()
    socketRef.current = s

    s.emit('join:project', { projectId })

    return () => {
      s.off()
    }
  }, [projectId])

  return socketRef.current
}
