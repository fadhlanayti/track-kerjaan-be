'use client'
import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { AlertCircle, MessageSquare, Users, ArrowRight } from 'lucide-react'
import { StatusBadge } from '@/components/status-badge'

interface Project {
  id: string; name: string; description: string | null; status: string
  _count: { issues: number }
  members: { user: { id: string; name: string; email: string; role: string }; role: string }[]
  createdBy: { id: string; name: string }
}

const roleStyle: Record<string, { avatar: string; badge: string }> = {
  ADMIN:     { avatar: '#202524', badge: '#F3F4F6' },
  PM:        { avatar: '#202524', badge: '#F3F4F6' },
  DEVELOPER: { avatar: '#087CF0', badge: 'rgba(8,124,240,0.1)' },
  CLIENT:    { avatar: '#D9F3EC', badge: '#D9F3EC' },
}
const roleTxt: Record<string, { avatar: string; badge: string }> = {
  ADMIN:     { avatar: '#fff', badge: '#202524' },
  PM:        { avatar: '#fff', badge: '#202524' },
  DEVELOPER: { avatar: '#fff', badge: '#087CF0' },
  CLIENT:    { avatar: '#0E7490', badge: '#0E7490' },
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

  void session

  return (
    <div className="flex flex-col gap-6" style={{ maxWidth: '900px' }}>

      {/* Project header */}
      <div className="rounded-2xl p-6" style={{ backgroundColor: '#202524' }}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold shrink-0" style={{ backgroundColor: 'var(--accent)' }}>
              {project.name[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{project.name}</h1>
              {project.description && <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>{project.description}</p>}
              <div className="flex items-center gap-4 mt-2">
                <span className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  <AlertCircle size={12} /> {project._count.issues} issues
                </span>
                <span className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  <Users size={12} /> {project.members.length} members
                </span>
              </div>
            </div>
          </div>
          <StatusBadge value={project.status} />
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href={`/projects/${id}/issues`}
          className="card border-l-orange p-5 flex items-center justify-between transition-colors no-underline"
          style={{ color: 'inherit' }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--bg-elevated)' }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = '' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 icon-bg-orange">
              <AlertCircle size={20} color="#F97316" />
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Issues</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{project._count.issues} total</p>
            </div>
          </div>
          <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />
        </Link>

        <Link
          href={`/projects/${id}/chat`}
          className="card border-l-teal p-5 flex items-center justify-between transition-colors no-underline"
          style={{ color: 'inherit' }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--bg-elevated)' }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = '' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 icon-bg-teal">
              <MessageSquare size={20} color="#0E7490" />
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Chat</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Real-time messaging</p>
            </div>
          </div>
          <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />
        </Link>
      </div>

      {/* Members */}
      <div className="card overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <Users size={16} style={{ color: 'var(--accent)' }} />
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Team Members</h2>
          <span className="text-xs ml-auto" style={{ color: 'var(--text-muted)' }}>{project.members.length} members</span>
        </div>
        <div>
          {project.members.map((m, i) => {
            const rs = roleStyle[m.role] || roleStyle['CLIENT']
            const rt = roleTxt[m.role] || roleTxt['CLIENT']
            return (
              <div
                key={m.user.id}
                className="flex items-center gap-3 px-5 py-3.5"
                style={{ borderBottom: i < project.members.length - 1 ? '1px solid var(--border)' : 'none' }}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0"
                  style={{ backgroundColor: rs.avatar, color: rt.avatar }}
                >
                  {m.user.name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{m.user.name}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{m.user.email}</p>
                </div>
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-lg"
                  style={{ backgroundColor: rs.badge, color: rt.badge }}
                >
                  {m.role}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
