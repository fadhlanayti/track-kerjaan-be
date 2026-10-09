'use client'
import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { AlertCircle, MessageSquare, Users, ArrowRight, UserPlus, X, Check } from 'lucide-react'
import { StatusBadge } from '@/components/status-badge'

interface Member {
  user: { id: string; name: string; email: string; role: string }
  role: string
}

interface Project {
  id: string; name: string; description: string | null; status: string
  _count: { issues: number }
  members: Member[]
  createdBy: { id: string; name: string }
}

interface User {
  id: string; name: string; email: string; role: string
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
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [showAddMember, setShowAddMember] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState('')
  const [selectedRole, setSelectedRole] = useState<'DEVELOPER' | 'CLIENT' | 'PM'>('DEVELOPER')
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState('')

  function fetchProject() {
    fetch(`/api/projects/${id}`)
      .then(r => r.json())
      .then(data => { setProject(data); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    fetchProject()
  }, [id])

  const isAdmin = session?.user?.role === 'ADMIN'

  useEffect(() => {
    if (!isAdmin) return
    fetch('/api/users')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setAllUsers(data) })
      .catch(() => {})
  }, [isAdmin])

  async function addMember(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedUserId) return
    setAdding(true)
    setAddError('')
    const res = await fetch(`/api/projects/${id}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: selectedUserId, role: selectedRole }),
    })
    if (res.ok) {
      setShowAddMember(false)
      setSelectedUserId('')
      fetchProject()
    } else {
      const data = await res.json().catch(() => ({}))
      setAddError(data.error || 'Gagal menambahkan member')
    }
    setAdding(false)
  }

  if (loading) return <div className="loading-state">Loading...</div>
  if (!project) return <div style={{ color: 'var(--red)' }}>Project not found</div>

  // Users not yet in project
  const memberIds = new Set(project.members.map(m => m.user.id))
  const availableUsers = allUsers.filter(u => !memberIds.has(u.id))

  return (
    <div className="flex flex-col gap-6" style={{ maxWidth: '900px' }}>

      {/* Project header */}
      <div className="rounded-2xl p-5" style={{ backgroundColor: '#202524' }}>
        <div className="flex items-start justify-between gap-4" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div className="flex items-center gap-4" style={{ minWidth: 0 }}>
            <div className="flex items-center justify-center text-white text-xl font-bold shrink-0" style={{
              width: '3.5rem', height: '3.5rem', borderRadius: '0.875rem', backgroundColor: 'var(--accent)'
            }}>
              {project.name[0].toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <h1 className="text-xl font-bold text-white">{project.name}</h1>
              {project.description && <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)', marginTop: '0.25rem' }}>{project.description}</p>}
              <div className="flex items-center gap-4" style={{ marginTop: '0.5rem', flexWrap: 'wrap' }}>
                <span className="flex items-center gap-1 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  <AlertCircle size={12} /> {project._count.issues} issues
                </span>
                <span className="flex items-center gap-1 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  <Users size={12} /> {project.members.length} members
                </span>
              </div>
            </div>
          </div>
          <StatusBadge value={project.status} />
        </div>
      </div>

      {/* Quick links */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
          {isAdmin && (
            <button
              onClick={() => setShowAddMember(!showAddMember)}
              className="btn-primary text-xs"
              style={{ padding: '0.375rem 0.75rem', marginLeft: '0.5rem' }}
            >
              <UserPlus size={13} />
              Add
            </button>
          )}
        </div>

        {/* Add member form */}
        {showAddMember && (
          <form onSubmit={addMember} style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid var(--border)',
            backgroundColor: 'var(--bg-elevated)',
            display: 'flex', flexDirection: 'column', gap: '0.75rem'
          }}>
            <p className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Tambah Member</p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <select
                value={selectedUserId}
                onChange={e => setSelectedUserId(e.target.value)}
                className="input"
                style={{ flex: '1', minWidth: '10rem' }}
                required
              >
                <option value="">Pilih user...</option>
                {availableUsers.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                ))}
              </select>
              <select
                value={selectedRole}
                onChange={e => setSelectedRole(e.target.value as any)}
                className="input"
                style={{ width: '8rem' }}
              >
                <option value="DEVELOPER">Developer</option>
                <option value="CLIENT">Client</option>
                <option value="PM">PM</option>
              </select>
              <button type="submit" disabled={adding || !selectedUserId} className="btn-primary">
                <Check size={14} />
                {adding ? 'Adding...' : 'Tambah'}
              </button>
              <button type="button" onClick={() => { setShowAddMember(false); setAddError('') }} className="btn-secondary">
                <X size={14} />
              </button>
            </div>
            {addError && <p className="text-xs" style={{ color: 'var(--red)' }}>{addError}</p>}
            {availableUsers.length === 0 && (
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Semua user sudah jadi member.</p>
            )}
          </form>
        )}

        <div>
          {project.members.map((m, i) => {
            const rs = roleStyle[m.role] || roleStyle['CLIENT']
            const rt = roleTxt[m.role] || roleTxt['CLIENT']
            return (
              <div
                key={m.user.id}
                className="flex items-center gap-3 px-5 py-3"
                style={{ borderBottom: i < project.members.length - 1 ? '1px solid var(--border)' : 'none' }}
              >
                <div
                  className="flex items-center justify-center text-sm font-semibold shrink-0"
                  style={{ width: '2.25rem', height: '2.25rem', borderRadius: '50%', backgroundColor: rs.avatar, color: rt.avatar }}
                >
                  {m.user.name[0].toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{m.user.name}</p>
                  <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{m.user.email}</p>
                </div>
                <span
                  className="text-xs font-semibold"
                  style={{ backgroundColor: rs.badge, color: rt.badge, padding: '0.25rem 0.625rem', borderRadius: '0.5rem', whiteSpace: 'nowrap' }}
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
