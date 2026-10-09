'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FolderKanban, AlertCircle, CheckCircle, Clock } from 'lucide-react'
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

  if (loading) return <div style={{ color: '#8890b5' }}>Loading...</div>

  const activeProjects = projects.filter(p => p.status === 'ACTIVE').length
  const totalIssues = projects.reduce((sum, p) => sum + p._count.issues, 0)

  return (
    <div>
      <h2 className="text-lg font-bold mb-5" style={{ color: '#122056' }}>Dashboard</h2>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Active Projects', value: activeProjects, icon: FolderKanban, color: '#5B65DC' },
          { label: 'Total Issues', value: totalIssues, icon: AlertCircle, color: '#ea580c' },
          { label: 'Total Projects', value: projects.length, icon: CheckCircle, color: '#16a34a' },
        ].map(stat => (
          <div key={stat.label} className="p-4 rounded-lg border" style={{ backgroundColor: '#FFFFFF', borderColor: '#E6E7F0' }}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md" style={{ backgroundColor: `${stat.color}10` }}>
                <stat.icon size={20} style={{ color: stat.color }} />
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: '#122056' }}>{stat.value}</p>
                <p className="text-xs" style={{ color: '#8890b5' }}>{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Project List */}
      <h3 className="text-sm font-semibold mb-3" style={{ color: '#122056' }}>Recent Projects</h3>
      <div className="space-y-2">
        {projects.slice(0, 10).map(project => (
          <Link
            key={project.id}
            href={`/projects/${project.id}`}
            className="block p-4 rounded-lg border transition-colors"
            style={{ backgroundColor: '#FFFFFF', borderColor: '#E6E7F0' }}
            onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.borderColor = '#5B65DC')}
            onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.borderColor = '#E6E7F0')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: '#122056' }}>{project.name}</p>
                <p className="text-xs mt-1" style={{ color: '#8890b5' }}>
                  {project._count.issues} issues · {project.members.length} members
                </p>
              </div>
              <StatusBadge value={project.status} />
            </div>
          </Link>
        ))}
        {projects.length === 0 && (
          <p className="text-sm py-8 text-center" style={{ color: '#8890b5' }}>No projects yet</p>
        )}
      </div>
    </div>
  )
}
