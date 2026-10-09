'use client'
import { useState, useEffect, useRef, use } from 'react'
import { useSession } from 'next-auth/react'
import { Send } from 'lucide-react'
import { FileUpload } from '@/components/file-upload'
import { getSocket } from '@/lib/socket-client'

interface Message {
  id: string
  content: string
  attachments: string[]
  sender: { id: string; name: string; avatar: string | null }
  createdAt: string
}

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load existing messages
    fetch(`/api/projects/${id}/chat/messages`)
      .then(r => r.json())
      .then(data => {
        if (data.messages) setMessages(data.messages)
        setLoading(false)
      })
      .catch(() => setLoading(false))

    // Socket.io for real-time
    const socket = getSocket()
    socket.emit('join:project', { projectId: id })

    socket.on('message:new', (message: Message) => {
      setMessages(prev => [...prev, message])
    })

    return () => {
      socket.off('message:new')
    }
  }, [id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim()) return

    const content = input
    setInput('')

    const res = await fetch(`/api/projects/${id}/chat/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    })

    if (res.ok) {
      const message = await res.json()
      // Emit via socket for real-time broadcast
      const socket = getSocket()
      socket.emit('message:send', { ...message, projectId: id })
      // Add locally (don't wait for socket echo)
      setMessages(prev => [...prev, message])
    }
  }

  function handleFileUpload(url: string) {
    // Send as message with attachment
    fetch(`/api/projects/${id}/chat/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: 'Shared a file', attachments: [url] }),
    }).then(r => r.json()).then(message => {
      const socket = getSocket()
      socket.emit('message:send', { ...message, projectId: id })
      setMessages(prev => [...prev, message])
    })
  }

  if (loading) return <div style={{ color: '#8890b5' }}>Loading...</div>

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 5rem)' }}>
      <h2 className="text-lg font-bold mb-3" style={{ color: '#122056' }}>Chat</h2>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto space-y-3 p-4 rounded-lg border mb-3"
        style={{ backgroundColor: '#FFFFFF', borderColor: '#E6E7F0' }}
      >
        {messages.map(msg => {
          const isMe = msg.sender.id === session?.user?.id
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-[70%]">
                {!isMe && (
                  <p className="text-xs mb-0.5 font-medium" style={{ color: '#5B65DC' }}>{msg.sender.name}</p>
                )}
                <div
                  className="px-3 py-2 rounded-lg text-sm"
                  style={{
                    backgroundColor: isMe ? '#5B65DC' : '#E6E7F0',
                    color: isMe ? '#FFFFFF' : '#122056',
                  }}
                >
                  {msg.content}
                  {msg.attachments?.length > 0 && (
                    <div className="mt-1">
                      {msg.attachments.map((url, i) => {
                        if (url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
                          return <img key={i} src={url} alt="" className="max-w-48 rounded mt-1" />
                        }
                        return <a key={i} href={url} target="_blank" rel="noopener" className="text-xs underline block mt-1" style={{ color: isMe ? '#E6E7F0' : '#5B65DC' }}>File {i+1}</a>
                      })}
                    </div>
                  )}
                </div>
                <p className="text-[10px] mt-0.5" style={{ color: '#8890b5' }}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="flex items-center gap-2">
        <FileUpload onUpload={handleFileUpload} />
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-3 py-2 text-sm rounded-md border outline-none"
          style={{ borderColor: '#E6E7F0', color: '#122056', backgroundColor: '#FFFFFF' }}
          onFocus={e => (e.target.style.borderColor = '#5B65DC')}
          onBlur={e => (e.target.style.borderColor = '#E6E7F0')}
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="p-2 rounded-md text-white"
          style={{ backgroundColor: '#5B65DC', opacity: input.trim() ? 1 : 0.5 }}
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  )
}
