'use client'
import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { AlertCircle, MessageSquare, Users, ArrowRight, FolderKanban } from 'lucide-react'
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

  const roleColors: Record<string, { bg: string; text: string }> = {
    ADMIN:     { bg: '#202524', text: '#FFFFFF' },
    PM:        { bg: '#202524', text: '#FFFFFF' },
    DEVELOPER: { bg: '#087CF0', text: '#FFFFFF' },
    CLIENT:    { bg: '#D9F3EC', text: '#0E7490' },
  }

  return (
    <div style={{ maxWidth: '900px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Project header card */}
      <div
        className="rounded-2xl p-6"
        style={{ backgroundColor: '#202524' }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
              style={{ backgroundColor: '#087CF0' }}
            >
              {project.name[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{project.name}</h1>
              {project.description && (
                <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>{project.description}</p>
              )}
              <div className="flex items-center gap-4 mt-2">
                <span className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  <AlertCircle size={12} />
                  {project._count.issues} issues
                </span>
                <span className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  <Users size={12} />
                  {project.members.length} members
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
          className="card p-5 flex items-center justify-between transition-colors"
          style={{ borderLeft: '4px solid #F97316', textDecoration: 'none', color: 'inherit' }}
          onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.backgroundColor = '#F8F8F6' }}
          onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.backgroundColor = '' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#F9731615' }}>
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
          className="card p-5 flex items-center justify-between transition-colors"
          style={{ borderLeft: '4px solid #0E7490', textDecoration: 'none', color: 'inherit' }}
          onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.backgroundColor = '#F8F8F6' }}
          onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.backgroundColor = '' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#0E749015' }}>
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
        <div
          className="flex items-center gap-2 px-5 py-4"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <Users size={16} style={{ color: 'var(--accent)' }} />
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Team Members
          </h2>
          <span className="text-xs ml-auto" style={{ color: 'var(--text-muted)' }}>
            {project.members.length} members
          </span>
        </div>
        <div>
          {project.members.map((m, i) => {
            const rc = roleColors[m.role] || roleColors['CLIENT']
            return (
              <div
                key={m.user.id}
                className="flex items-center gap-3 px-5 py-3.5"
                style={{ borderBottom: i < project.members.length - 1 ? '1px solid var(--border)' : 'none' }}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0"
                  style={{ backgroundColor: rc.bg, color: rc.text }}
                >
                  {m.user.name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{m.user.name}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{m.user.email}</p>
                </div>
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-lg"
                  style={{ backgroundColor: rc.bg === '#202524' ? '#F3F4F6' : `${rc.bg}20`, color: rc.bg === '#202524' ? '#202524' : rc.bg }}
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
