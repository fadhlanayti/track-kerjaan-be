'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Plus } from 'lucide-react'
import { StatusBadge } from '@/components/status-badge'

interface Project {
  id: string
  name: string
  description: string | null
  status: string
  _count: { issues: number }
  members: { user: { id: string; name: string; role: string } }[]
  createdAt: string
}

export default function ProjectsPage() {
  const { data: session } = useSession()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/projects')
      .then(r => r.json())
      .then(data => { setProjects(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading-state">Loading...</div>

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Projects</h2>
        {session?.user?.role === 'ADMIN' && (
          <Link href="/projects/new" className="btn-primary">
            <Plus size={16} />
            New Project
          </Link>
        )}
      </div>

      <div className="space-y-2">
        {projects.map(project => (
          <Link
            key={project.id}
            href={`/projects/${project.id}`}
            className="card-link p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{project.name}</p>
                {project.description && (
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{project.description}</p>
                )}
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
