'use client'
import { useState, useEffect, use } from 'react'
import { useSession } from 'next-auth/react'
import { StatusBadge } from '@/components/status-badge'
import { FileUpload } from '@/components/file-upload'

interface Comment {
  id: string
  content: string
  attachments: string[]
  author: { id: string; name: string; avatar: string | null }
  createdAt: string
}

interface Activity {
  id: string
  action: string
  metadata: any
  user: { id: string; name: string }
  createdAt: string
}

interface Issue {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  attachments: string[]
  createdBy: { id: string; name: string; avatar: string | null }
  assignedTo: { id: string; name: string; avatar: string | null } | null
  comments: Comment[]
  activities: Activity[]
  project: { id: string; name: string }
  createdAt: string
}

export default function IssueDetailPage({ params }: { params: Promise<{ id: string; issueId: string }> }) {
  const { id, issueId } = use(params)
  const { data: session } = useSession()
  const [issue, setIssue] = useState<Issue | null>(null)
  const [loading, setLoading] = useState(true)
  const [commentText, setCommentText] = useState('')
  const [commentAttachments, setCommentAttachments] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [members, setMembers] = useState<{ user: { id: string; name: string; role: string } }[]>([])

  function fetchIssue() {
    fetch(`/api/projects/${id}/issues/${issueId}`)
      .then(r => r.json())
      .then(data => { setIssue(data); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    fetchIssue()
    // Fetch project members for assignment dropdown
    fetch(`/api/projects/${id}`)
      .then(r => r.json())
      .then(data => { if (data.members) setMembers(data.members) })
      .catch(() => {})
  }, [id, issueId])

  async function updateIssue(data: Record<string, any>) {
    await fetch(`/api/projects/${id}/issues/${issueId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    fetchIssue()
  }

  async function submitComment(e: React.FormEvent) {
    e.preventDefault()
    if (!commentText.trim()) return
    setSubmitting(true)
    await fetch(`/api/projects/${id}/issues/${issueId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: commentText, attachments: commentAttachments }),
    })
    setCommentText('')
    setCommentAttachments([])
    setSubmitting(false)
    fetchIssue()
  }

  if (loading) return <div style={{ color: '#8890b5' }}>Loading...</div>
  if (!issue) return <div style={{ color: '#dc2626' }}>Issue not found</div>

  const isAdmin = session?.user?.role === 'ADMIN'
  const isAssignee = session?.user?.id === issue.assignedTo?.id

  const statuses = ['OPEN', 'IN_REVIEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']
  const developers = members.filter(m => m.user.role === 'DEVELOPER' || m.user.role === 'ADMIN')

  return (
    <div className="max-w-3xl">
      {/* Breadcrumb */}
      <p className="text-xs mb-4" style={{ color: '#8890b5' }}>
        <a href={`/projects/${id}`} style={{ color: '#5B65DC' }}>{issue.project.name}</a>
        {' / '}
        <a href={`/projects/${id}/issues`} style={{ color: '#5B65DC' }}>Issues</a>
        {` / ${issue.title}`}
      </p>

      {/* Issue header */}
      <div className="p-5 rounded-lg border mb-4" style={{ backgroundColor: '#FFFFFF', borderColor: '#E6E7F0' }}>
        <div className="flex items-start justify-between gap-3 mb-3">
          <h2 className="text-lg font-bold" style={{ color: '#122056' }}>{issue.title}</h2>
          <div className="flex gap-2">
            <StatusBadge value={issue.priority} />
            <StatusBadge value={issue.status} />
          </div>
        </div>

        {issue.description && (
          <div className="prose text-sm mb-4" style={{ color: '#122056' }}>
            {issue.description}
          </div>
        )}

        {issue.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {issue.attachments.map((url, i) => (
              <a key={i} href={url} target="_blank" rel="noopener" className="text-xs underline" style={{ color: '#5B65DC' }}>
                Attachment {i + 1}
              </a>
            ))}
          </div>
        )}

        <div className="flex items-center gap-4 text-xs" style={{ color: '#8890b5' }}>
          <span>By {issue.createdBy.name}</span>
          <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
          {issue.assignedTo && <span>Assigned to {issue.assignedTo.name}</span>}
        </div>

        {/* Controls (admin + assignee) */}
        {(isAdmin || isAssignee) && (
          <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t" style={{ borderColor: '#E6E7F0' }}>
            <div>
              <label className="block text-xs mb-1 font-medium" style={{ color: '#122056' }}>Status</label>
              <select
                value={issue.status}
                onChange={e => updateIssue({ status: e.target.value })}
                className="px-2 py-1 text-xs rounded-md border"
                style={{ borderColor: '#E6E7F0', color: '#122056' }}
              >
                {statuses.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            {isAdmin && (
              <div>
                <label className="block text-xs mb-1 font-medium" style={{ color: '#122056' }}>Assign To</label>
                <select
                  value={issue.assignedTo?.id || ''}
                  onChange={e => updateIssue({ assignedToId: e.target.value || null })}
                  className="px-2 py-1 text-xs rounded-md border"
                  style={{ borderColor: '#E6E7F0', color: '#122056' }}
                >
                  <option value="">Unassigned</option>
                  {developers.map(m => (
                    <option key={m.user.id} value={m.user.id}>{m.user.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Activity + Comments timeline */}
      <h3 className="text-sm font-semibold mb-3" style={{ color: '#122056' }}>Activity</h3>

      <div className="space-y-3 mb-6">
        {/* Merge and sort activities and comments by date */}
        {[
          ...issue.activities.map(a => ({ type: 'activity' as const, data: a, date: a.createdAt })),
          ...issue.comments.map(c => ({ type: 'comment' as const, data: c, date: c.createdAt })),
        ]
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .map(item => {
            if (item.type === 'activity') {
              const a = item.data as Activity
              let text = a.action.replace(/_/g, ' ').toLowerCase()
              if (a.action === 'STATUS_CHANGED' && a.metadata) {
                text = `changed status from ${a.metadata.oldStatus} to ${a.metadata.newStatus}`
              }
              return (
                <div key={`a-${a.id}`} className="flex items-center gap-2 text-xs py-1" style={{ color: '#8890b5' }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#E6E7F0' }} />
                  <span className="font-medium" style={{ color: '#122056' }}>{a.user.name}</span>
                  <span>{text}</span>
                  <span className="ml-auto">{new Date(a.createdAt).toLocaleString()}</span>
                </div>
              )
            } else {
              const c = item.data as Comment
              return (
                <div key={`c-${c.id}`} className="p-3 rounded-lg border" style={{ backgroundColor: '#FFFFFF', borderColor: '#E6E7F0' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium"
                      style={{ backgroundColor: '#5B65DC' }}
                    >
                      {c.author.name[0].toUpperCase()}
                    </div>
                    <span className="text-sm font-medium" style={{ color: '#122056' }}>{c.author.name}</span>
                    <span className="text-xs ml-auto" style={{ color: '#8890b5' }}>{new Date(c.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="prose text-sm">{c.content}</div>
                  {c.attachments.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {c.attachments.map((url, i) => (
                        <a key={i} href={url} target="_blank" rel="noopener" className="text-xs underline" style={{ color: '#5B65DC' }}>
                          Attachment {i + 1}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )
            }
          })}
      </div>

      {/* Comment form */}
      <form onSubmit={submitComment} className="p-4 rounded-lg border" style={{ backgroundColor: '#FFFFFF', borderColor: '#E6E7F0' }}>
        <textarea
          value={commentText}
          onChange={e => setCommentText(e.target.value)}
          placeholder="Write a comment..."
          rows={3}
          className="w-full px-3 py-2 text-sm rounded-md border outline-none resize-none mb-2"
          style={{ borderColor: '#E6E7F0', color: '#122056' }}
          onFocus={e => (e.target.style.borderColor = '#5B65DC')}
          onBlur={e => (e.target.style.borderColor = '#E6E7F0')}
        />
        {commentAttachments.length > 0 && (
          <div className="flex gap-2 mb-2">
            {commentAttachments.map((url, i) => (
              <span key={i} className="text-xs px-2 py-1 rounded" style={{ backgroundColor: '#E6E7F0', color: '#122056' }}>
                File {i + 1}
                <button
                  type="button"
                  onClick={() => setCommentAttachments(prev => prev.filter((_, j) => j !== i))}
                  className="ml-1" style={{ color: '#dc2626' }}
                >
                  x
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2">
          <FileUpload onUpload={(url) => setCommentAttachments(prev => [...prev, url])} />
          <button
            type="submit"
            disabled={submitting || !commentText.trim()}
            className="px-3 py-1.5 text-sm font-medium text-white rounded-md ml-auto"
            style={{ backgroundColor: '#5B65DC', opacity: submitting || !commentText.trim() ? 0.5 : 1 }}
          >
            {submitting ? 'Posting...' : 'Comment'}
          </button>
        </div>
      </form>
    </div>
  )
}
