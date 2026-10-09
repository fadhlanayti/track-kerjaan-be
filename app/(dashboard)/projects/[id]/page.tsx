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

const roleStyle: Record<string, { avatar: string; badge: string; badgeText: string }> = {
  ADMIN:     { avatar: 'bg-charcoal text-white', badge: 'bg-gray-100 text-charcoal', badgeText: '' },
  PM:        { avatar: 'bg-charcoal text-white', badge: 'bg-gray-100 text-charcoal', badgeText: '' },
  DEVELOPER: { avatar: 'bg-accent text-white', badge: 'bg-accent/10 text-accent', badgeText: '' },
  CLIENT:    { avatar: 'bg-[#D9F3EC] text-[#0E7490]', badge: 'bg-[#D9F3EC] text-[#0E7490]', badgeText: '' },
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
  if (!project) return <div className="text-red">Project not found</div>

  void session

  return (
    <div className="max-w-3xl flex flex-col gap-6">

      {/* Project header */}
      <div className="rounded-2xl p-6 bg-charcoal">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold shrink-0 bg-accent">
              {project.name[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{project.name}</h1>
              {project.description && <p className="text-sm mt-1 text-white/60">{project.description}</p>}
              <div className="flex items-center gap-4 mt-2">
                <span className="flex items-center gap-1.5 text-xs text-white/50">
                  <AlertCircle size={12} /> {project._count.issues} issues
                </span>
                <span className="flex items-center gap-1.5 text-xs text-white/50">
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
          className="card p-5 flex items-center justify-between border-l-4 border-l-[#F97316] hover:bg-elevated transition-colors no-underline text-inherit"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-[#F97316]/10">
              <AlertCircle size={20} color="#F97316" />
            </div>
            <div>
              <p className="text-sm font-bold text-text-primary">Issues</p>
              <p className="text-xs text-text-muted">{project._count.issues} total</p>
            </div>
          </div>
          <ArrowRight size={16} className="text-text-muted" />
        </Link>

        <Link
          href={`/projects/${id}/chat`}
          className="card p-5 flex items-center justify-between border-l-4 border-l-[#0E7490] hover:bg-elevated transition-colors no-underline text-inherit"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-[#0E7490]/10">
              <MessageSquare size={20} color="#0E7490" />
            </div>
            <div>
              <p className="text-sm font-bold text-text-primary">Chat</p>
              <p className="text-xs text-text-muted">Real-time messaging</p>
            </div>
          </div>
          <ArrowRight size={16} className="text-text-muted" />
        </Link>
      </div>

      {/* Members */}
      <div className="card overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
          <Users size={16} className="text-accent" />
          <h2 className="text-sm font-semibold text-text-primary">Team Members</h2>
          <span className="text-xs text-text-muted ml-auto">{project.members.length} members</span>
        </div>
        <div>
          {project.members.map((m, i) => {
            const s = roleStyle[m.role] || roleStyle['CLIENT']
            return (
              <div
                key={m.user.id}
                className={`flex items-center gap-3 px-5 py-3.5 ${i < project.members.length - 1 ? 'border-b border-border' : ''}`}
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${s.avatar}`}>
                  {m.user.name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary">{m.user.name}</p>
                  <p className="text-xs text-text-muted">{m.user.email}</p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${s.badge}`}>{m.role}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
