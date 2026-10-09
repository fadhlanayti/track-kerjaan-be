'use client'
import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { AlertCircle, MessageSquare, Users, Settings } from 'lucide-react'
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

  if (loading) return <div style={{ color: '#8890b5' }}>Loading...</div>
  if (!project) return <div style={{ color: '#dc2626' }}>Project not found</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold" style={{ color: '#122056' }}>{project.name}</h2>
          {project.description && <p className="text-sm mt-0.5" style={{ color: '#8890b5' }}>{project.description}</p>}
        </div>
        <StatusBadge value={project.status} />
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
        <Link
          href={`/projects/${id}/issues`}
          className="flex items-center gap-3 p-4 rounded-lg border transition-colors"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#E6E7F0' }}
          onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.borderColor = '#5B65DC')}
          onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.borderColor = '#E6E7F0')}
        >
          <AlertCircle size={20} style={{ color: '#5B65DC' }} />
          <div>
            <p className="text-sm font-medium" style={{ color: '#122056' }}>Issues</p>
            <p className="text-xs" style={{ color: '#8890b5' }}>{project._count.issues} total</p>
          </div>
        </Link>
        <Link
          href={`/projects/${id}/chat`}
          className="flex items-center gap-3 p-4 rounded-lg border transition-colors"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#E6E7F0' }}
          onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.borderColor = '#5B65DC')}
          onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.borderColor = '#E6E7F0')}
        >
          <MessageSquare size={20} style={{ color: '#5B65DC' }} />
          <div>
            <p className="text-sm font-medium" style={{ color: '#122056' }}>Chat</p>
            <p className="text-xs" style={{ color: '#8890b5' }}>Real-time messaging</p>
          </div>
        </Link>
      </div>

      {/* Members */}
      <h3 className="text-sm font-semibold mb-3" style={{ color: '#122056' }}>Members</h3>
      <div className="space-y-1.5">
        {project.members.map(m => (
          <div key={m.user.id} className="flex items-center gap-3 p-3 rounded-lg border" style={{ backgroundColor: '#FFFFFF', borderColor: '#E6E7F0' }}>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
              style={{ backgroundColor: m.user.role === 'ADMIN' ? '#122056' : m.user.role === 'DEVELOPER' ? '#5B65DC' : '#8890b5' }}
            >
              {m.user.name[0].toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: '#122056' }}>{m.user.name}</p>
              <p className="text-xs" style={{ color: '#8890b5' }}>{m.role}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
