'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import {
  FolderKanban, AlertCircle, CheckCircle2, ArrowRight,
  Users, Clock, TrendingUp, Plus
} from 'lucide-react'
import { StatusBadge } from '@/components/status-badge'

interface Project {
  id: string
  name: string
  status: string
  description: string | null
  _count: { issues: number }
  members: { user: { name: string; role: string } }[]
  updatedAt: string
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/projects')
      .then(r => r.json())
      .then(data => { setProjects(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading-state">Loading...</div>

  const activeProjects = projects.filter(p => p.status === 'ACTIVE').length
  const totalIssues = projects.reduce((sum, p) => sum + p._count.issues, 0)
  const isAdmin = session?.user?.role === 'ADMIN'

  const stats = [
    {
      label: 'Total Projects',
      value: projects.length,
      sub: `${activeProjects} active`,
      icon: FolderKanban,
      color: '#087CF0',
      iconBg: 'rgba(8,124,240,0.10)',
    },
    {
      label: 'Open Issues',
      value: totalIssues,
      sub: 'across all projects',
      icon: AlertCircle,
      color: '#FFAD78',
      iconBg: 'rgba(255,173,120,0.14)',
    },
    {
      label: 'Team Members',
      value: [...new Set(projects.flatMap(p => p.members.map(m => m.user.name)))].length,
      sub: 'across projects',
      icon: Users,
      color: '#A98AF5',
      iconBg: 'rgba(169,138,245,0.12)',
    },
    {
      label: 'Completed',
      value: projects.filter(p => p.status === 'COMPLETED').length,
      sub: 'projects done',
      icon: CheckCircle2,
      color: '#9BD83B',
      iconBg: 'rgba(155,216,59,0.12)',
    },
  ]

  return (
    <div style={{ maxWidth: '1100px' }}>

      {/* Welcome header */}
      <div
        className="flex items-center justify-between p-6 mb-6 rounded-2xl"
        style={{
          background: 'linear-gradient(135deg, #202524 0%, #2d3830 100%)',
          color: 'white',
        }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
            style={{ backgroundColor: '#087CF0' }}
          >
            {(session?.user?.name || 'U')[0].toUpperCase()}
          </div>
          <div>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>Welcome back</p>
            <h1 className="text-xl font-bold text-white">{session?.user?.name}</h1>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {session?.user?.role} · WeballCreative
            </p>
          </div>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          {isAdmin && (
            <Link
              href="/projects/new"
              className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 text-xs font-semibold rounded-lg text-white"
              style={{ backgroundColor: '#087CF0' }}
            >
              <Plus size={13} />
              New Project
            </Link>
          )}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 mb-6" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
        {stats.map(stat => (
          <div key={stat.label} className="stat-card flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: stat.iconBg }}
            >
              <stat.icon size={22} style={{ color: stat.color }} />
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)', lineHeight: 1.1 }}>
                {stat.value}
              </p>
              <p className="text-sm font-medium mt-0.5" style={{ color: 'var(--text-primary)' }}>
                {stat.label}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {stat.sub}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Projects */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2">
            <TrendingUp size={16} style={{ color: 'var(--accent)' }} />
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              Recent Projects
            </h2>
          </div>
          <Link
            href="/projects"
            className="flex items-center gap-1 text-xs font-medium"
            style={{ color: 'var(--accent)' }}
          >
            View all <ArrowRight size={13} />
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="empty-state">
            <FolderKanban size={32} style={{ color: 'var(--border)', marginBottom: '0.5rem' }} />
            <p>No projects yet</p>
            {isAdmin && (
              <Link href="/projects/new" className="btn-primary mt-3" style={{ fontSize: '0.8125rem' }}>
                <Plus size={14} /> Create first project
              </Link>
            )}
          </div>
        ) : (
          <div>
            {projects.slice(0, 8).map((project, i) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="flex items-center justify-between px-5 py-3.5 transition-colors"
                style={{
                  borderBottom: i < Math.min(projects.length, 8) - 1 ? '1px solid var(--border)' : 'none',
                  textDecoration: 'none',
                  color: 'inherit',
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-elevated)'
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                {/* Left: icon + info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: '#087CF0' }}
                  >
                    {project.name[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                      {project.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                        <AlertCircle size={11} />
                        {project._count.issues} issues
                      </span>
                      <span className="text-xs" style={{ color: 'var(--border)' }}>·</span>
                      <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                        <Users size={11} />
                        {project.members.length} members
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: status + time */}
                <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                  <StatusBadge value={project.status} />
                  <span className="flex items-center gap-1 text-xs hidden sm:flex" style={{ color: 'var(--text-muted)' }}>
                    <Clock size={11} />
                    {new Date(project.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                  </span>
                  <ArrowRight size={15} style={{ color: 'var(--border)' }} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
