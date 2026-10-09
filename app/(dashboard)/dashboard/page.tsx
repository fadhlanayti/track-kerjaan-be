'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FolderKanban, AlertCircle, CheckCircle } from 'lucide-react'
import { StatusBadge } from '@/components/status-badge'

interface Project {
  id: string
  name: string
  status: string
  _count: { issues: number }
  members: { user: { name: string } }[]
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/projects')
      .then(r => r.json())
      .then(data => { setProjects(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading-state">Loading...</div>

  const activeProjects = projects.filter(p => p.status === 'ACTIVE').length
  const totalIssues = projects.reduce((sum, p) => sum + p._count.issues, 0)

  const stats = [
    { label: 'Total Issues', value: totalIssues, icon: AlertCircle, color: 'var(--orange)', iconBg: 'rgba(255,173,120,0.12)' },
    { label: 'Active Projects', value: activeProjects, icon: FolderKanban, color: 'var(--accent)', iconBg: 'rgba(8,124,240,0.08)' },
    { label: 'Total Projects', value: projects.length, icon: CheckCircle, color: 'var(--lime)', iconBg: 'rgba(155,216,59,0.12)' },
  ]

  return (
    <div>
      <h2 className="text-lg font-bold mb-5" style={{ color: 'var(--text-primary)' }}>Dashboard</h2>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map(stat => (
          <div key={stat.label} className="stat-card">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md" style={{ backgroundColor: stat.iconBg }}>
                <stat.icon size={20} style={{ color: stat.color }} />
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stat.value}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Project List */}
      <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Recent Projects</h3>
      <div className="space-y-2">
        {projects.slice(0, 10).map(project => (
          <Link
            key={project.id}
            href={`/projects/${project.id}`}
            className="card-link p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{project.name}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  {project._count.issues} issues · {project.members.length} members
                </p>
              </div>
              <StatusBadge value={project.status} />
            </div>
          </Link>
        ))}
        {projects.length === 0 && (
          <p className="empty-state">No projects yet</p>
        )}
      </div>
    </div>
  )
}
