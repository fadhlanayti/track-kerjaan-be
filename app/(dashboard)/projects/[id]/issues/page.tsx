'use client'
import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Plus } from 'lucide-react'
import { StatusBadge } from '@/components/status-badge'

interface Issue {
  id: string
  title: string
  status: string
  priority: string
  createdBy: { id: string; name: string }
  assignedTo: { id: string; name: string } | null
  _count: { comments: number }
  createdAt: string
}

const STATUSES = ['OPEN', 'IN_REVIEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']

export default function IssuesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: session } = useSession()
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newPriority, setNewPriority] = useState('MEDIUM')
  const [creating, setCreating] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  function fetchIssues() {
    const p = new URLSearchParams()
    if (statusFilter) p.set('status', statusFilter)
    if (priorityFilter) p.set('priority', priorityFilter)
    fetch(`/api/projects/${id}/issues?${p}`)
      .then(r => r.json())
      .then(data => { setIssues(data); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { fetchIssues() }, [id, statusFilter, priorityFilter])

  async function createIssue(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    const res = await fetch(`/api/projects/${id}/issues`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle, description: newDesc, priority: newPriority }),
    })
    if (res.ok) { setNewTitle(''); setNewDesc(''); setShowCreateForm(false); fetchIssues() }
    setCreating(false)
  }

  async function quickUpdateStatus(issueId: string, status: string) {
    setUpdatingId(issueId)
    await fetch(`/api/projects/${id}/issues/${issueId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setIssues(prev => prev.map(i => i.id === issueId ? { ...i, status } : i))
    setUpdatingId(null)
  }

  if (loading) return <div className="loading-state">Loading...</div>

  const canCreate = session?.user?.role === 'ADMIN' || session?.user?.role === 'CLIENT'
  const canUpdateStatus = session?.user?.role === 'ADMIN' || session?.user?.role === 'DEVELOPER'

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Issues</h2>
        {canCreate && (
          <button onClick={() => setShowCreateForm(!showCreateForm)} className="btn-primary">
            <Plus size={16} /> New Issue
          </button>
        )}
      </div>

      {/* Create form */}
      {showCreateForm && (
        <form onSubmit={createIssue} className="card p-4 mb-4" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Issue title" required className="input" />
          <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Description (optional)" rows={3} className="input resize-none" />
          <div className="flex items-center gap-3">
            <select value={newPriority} onChange={e => setNewPriority(e.target.value)} className="input" style={{ width: 'auto' }}>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
            <button type="submit" disabled={creating} className="btn-primary">{creating ? 'Creating...' : 'Create'}</button>
            <button type="button" onClick={() => setShowCreateForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-4" style={{ flexWrap: 'wrap' }}>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input text-xs" style={{ width: 'auto' }}>
          <option value="">All Status</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
        <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} className="input text-xs" style={{ width: 'auto' }}>
          <option value="">All Priority</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="URGENT">Urgent</option>
        </select>
      </div>

      {/* Issue list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {issues.length === 0 && <p className="empty-state">No issues yet</p>}
        {issues.map(issue => (
          <div key={issue.id} className="card" style={{ padding: '1rem 1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flexWrap: 'wrap' }}>
              {/* Title + meta */}
              <div style={{ flex: 1, minWidth: '10rem' }}>
                <Link
                  href={`/projects/${id}/issues/${issue.id}`}
                  style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 600, fontSize: '0.9375rem' }}
                >
                  {issue.title}
                </Link>
                <p className="text-xs" style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  by {issue.createdBy.name}
                  {issue.assignedTo ? ` · ${issue.assignedTo.name}` : ''}
                  {` · ${issue._count.comments} comments`}
                </p>
              </div>

              {/* Right side: badges + quick status */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <StatusBadge value={issue.priority} />

                {canUpdateStatus ? (
                  <select
                    value={issue.status}
                    disabled={updatingId === issue.id}
                    onChange={e => quickUpdateStatus(issue.id, e.target.value)}
                    onClick={e => e.preventDefault() /* prevent link navigation */}
                    className="input text-xs"
                    style={{ width: 'auto', padding: '0.25rem 0.5rem', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                  </select>
                ) : (
                  <StatusBadge value={issue.status} />
                )}

                <Link
                  href={`/projects/${id}/issues/${issue.id}`}
                  className="btn-secondary text-xs"
                  style={{ padding: '0.25rem 0.625rem', fontSize: '0.75rem' }}
                >
                  Detail →
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
