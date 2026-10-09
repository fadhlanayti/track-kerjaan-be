'use client'
import { useState } from 'react'

export default function InviteUserPage() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState('CLIENT')
  const [inviteUrl, setInviteUrl] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setInviteUrl('')
    setSubmitting(true)

    const res = await fetch('/api/invite/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, phone: phone || undefined, role }),
    })
    const data = await res.json()

    if (res.ok) {
      setInviteUrl(data.inviteUrl)
      setEmail('')
      setName('')
      setPhone('')
    } else {
      setError(data.error || 'Failed to generate invite')
    }
    setSubmitting(false)
  }

  return (
    <div className="max-w-sm">
      <h2 className="text-lg font-bold mb-5" style={{ color: 'var(--text-primary)' }}>Invite User</h2>

      <div className="card p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Name</label>
            <input
              type="text" value={name} onChange={e => setName(e.target.value)} required
              className="input"
            />
          </div>
          <div>
            <label className="label">Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="input"
            />
          </div>
          <div>
            <label className="label">Phone (for WA notification)</label>
            <input
              type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="6281234567890"
              className="input"
            />
          </div>
          <div>
            <label className="label">Role</label>
            <select
              value={role} onChange={e => setRole(e.target.value)}
              className="input"
            >
              <option value="CLIENT">Client</option>
              <option value="DEVELOPER">Developer</option>
            </select>
          </div>

          {error && <p className="error-text">{error}</p>}

          <button
            type="submit" disabled={submitting}
            className="btn-primary w-full justify-center py-2"
          >
            {submitting ? 'Generating...' : 'Generate Invite Link'}
          </button>
        </form>
      </div>

      {inviteUrl && (
        <div
          className="mt-4 p-4 rounded-xl border"
          style={{ backgroundColor: 'rgba(8,124,240,0.04)', borderColor: 'rgba(8,124,240,0.15)' }}
        >
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Invite Link</p>
          <p className="text-xs break-all" style={{ color: 'var(--accent)' }}>{inviteUrl}</p>
          <button
            onClick={() => { navigator.clipboard.writeText(inviteUrl) }}
            className="btn-secondary mt-2 text-xs py-1 px-2"
          >
            Copy to clipboard
          </button>
        </div>
      )}
    </div>
  )
}
