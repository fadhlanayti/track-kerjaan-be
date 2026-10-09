'use client'
import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Plus, Filter } from 'lucide-react'
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

  function fetchIssues() {
    const params = new URLSearchParams()
    if (statusFilter) params.set('status', statusFilter)
    if (priorityFilter) params.set('priority', priorityFilter)

    fetch(`/api/projects/${id}/issues?${params}`)
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
    if (res.ok) {
      setNewTitle('')
      setNewDesc('')
      setShowCreateForm(false)
      fetchIssues()
    }
    setCreating(false)
  }

  if (loading) return <div style={{ color: '#8890b5' }}>Loading...</div>

  const canCreate = session?.user?.role === 'ADMIN' || session?.user?.role === 'CLIENT'

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold" style={{ color: '#122056' }}>Issues</h2>
        {canCreate && (
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white rounded-md"
            style={{ backgroundColor: '#5B65DC' }}
          >
            <Plus size={16} />
            New Issue
          </button>
        )}
      </div>

      {/* Create form */}
      {showCreateForm && (
        <form onSubmit={createIssue} className="p-4 rounded-lg border mb-4 space-y-3" style={{ backgroundColor: '#FFFFFF', borderColor: '#E6E7F0' }}>
          <input
            type="text"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            placeholder="Issue title"
            required
            className="w-full px-3 py-2 text-sm rounded-md border outline-none"
            style={{ borderColor: '#E6E7F0', color: '#122056' }}
            onFocus={e => (e.target.style.borderColor = '#5B65DC')}
            onBlur={e => (e.target.style.borderColor = '#E6E7F0')}
          />
          <textarea
            value={newDesc}
            onChange={e => setNewDesc(e.target.value)}
            placeholder="Description (optional)"
            rows={3}
            className="w-full px-3 py-2 text-sm rounded-md border outline-none resize-none"
            style={{ borderColor: '#E6E7F0', color: '#122056' }}
            onFocus={e => (e.target.style.borderColor = '#5B65DC')}
            onBlur={e => (e.target.style.borderColor = '#E6E7F0')}
          />
          <div className="flex items-center gap-3">
            <select
              value={newPriority}
              onChange={e => setNewPriority(e.target.value)}
              className="px-2 py-1.5 text-sm rounded-md border outline-none"
              style={{ borderColor: '#E6E7F0', color: '#122056' }}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
            <button
              type="submit"
              disabled={creating}
              className="px-3 py-1.5 text-sm font-medium text-white rounded-md"
              style={{ backgroundColor: '#5B65DC', opacity: creating ? 0.7 : 1 }}
            >
              {creating ? 'Creating...' : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="px-3 py-1.5 text-sm rounded-md border"
              style={{ borderColor: '#E6E7F0', color: '#8890b5' }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-2 py-1.5 text-xs rounded-md border outline-none"
          style={{ borderColor: '#E6E7F0', color: '#122056' }}
        >
          <option value="">All Status</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="IN_REVIEW">In Review</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
        </select>
        <select
          value={priorityFilter}
          onChange={e => setPriorityFilter(e.target.value)}
          className="px-2 py-1.5 text-xs rounded-md border outline-none"
          style={{ borderColor: '#E6E7F0', color: '#122056' }}
        >
          <option value="">All Priority</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="URGENT">Urgent</option>
        </select>
      </div>

      {/* Issue list */}
      <div className="space-y-2">
        {issues.map(issue => (
          <Link
            key={issue.id}
            href={`/projects/${id}/issues/${issue.id}`}
            className="block p-4 rounded-lg border transition-colors"
            style={{ backgroundColor: '#FFFFFF', borderColor: '#E6E7F0' }}
            onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.borderColor = '#5B65DC')}
            onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.borderColor = '#E6E7F0')}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" style={{ color: '#122056' }}>{issue.title}</p>
                <p className="text-xs mt-1" style={{ color: '#8890b5' }}>
                  by {issue.createdBy.name}
                  {issue.assignedTo ? ` · assigned to ${issue.assignedTo.name}` : ''}
                  {` · ${issue._count.comments} comments`}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <StatusBadge value={issue.priority} />
                <StatusBadge value={issue.status} />
              </div>
            </div>
          </Link>
        ))}
        {issues.length === 0 && (
          <p className="text-sm py-8 text-center" style={{ color: '#8890b5' }}>No issues yet</p>
        )}
      </div>
    </div>
  )
}
