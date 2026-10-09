'use client'
import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { AlertCircle, MessageSquare } from 'lucide-react'
import { StatusBadge } from '@/components/status-badge'

interface Project {
  id: string
  name: string
  description: string | null
  status: string
  _count: { issues: number }
  members: { user: { id: string; name: string; email: string; role: string; avatar: string | null }; role: string }[]
  createdBy: { id: string; name: string }
}

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: session } = useSession()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/projects/${id}`)
      .then(r => r.json())
      .then(data => { setProject(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  if (loading) return <div className="loading-state">Loading...</div>
  if (!project) return <div style={{ color: 'var(--red)' }}>Project not found</div>

  const avatarBg = (role: string) =>
    role === 'ADMIN' ? 'var(--charcoal)' : role === 'DEVELOPER' ? 'var(--accent)' : 'var(--text-muted)'

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{project.name}</h2>
          {project.description && <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{project.description}</p>}
        </div>
        <StatusBadge value={project.status} />
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Link href={`/projects/${id}/issues`} className="card-link p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(8,124,240,0.08)' }}>
            <AlertCircle size={20} style={{ color: 'var(--accent)' }} />
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Issues</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{project._count.issues} total</p>
          </div>
        </Link>
        <Link href={`/projects/${id}/chat`} className="card-link p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(8,124,240,0.08)' }}>
            <MessageSquare size={20} style={{ color: 'var(--accent)' }} />
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Chat</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Real-time messaging</p>
          </div>
        </Link>
      </div>

      {/* Members */}
      <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Members</h3>
      <div className="space-y-2.5">
        {project.members.map(m => (
          <div key={m.user.id} className="card p-4 flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
              style={{ backgroundColor: avatarBg(m.user.role) }}
            >
              {m.user.name[0].toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{m.user.name}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{m.role}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
