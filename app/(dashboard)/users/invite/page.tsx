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
      <h2 className="text-lg font-bold mb-5" style={{ color: '#122056' }}>Invite User</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: '#122056' }}>Name</label>
          <input
            type="text" value={name} onChange={e => setName(e.target.value)} required
            className="w-full px-3 py-2 text-sm rounded-md border outline-none"
            style={{ borderColor: '#E6E7F0', color: '#122056' }}
            onFocus={e => (e.target.style.borderColor = '#5B65DC')}
            onBlur={e => (e.target.style.borderColor = '#E6E7F0')}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: '#122056' }}>Email</label>
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)} required
            className="w-full px-3 py-2 text-sm rounded-md border outline-none"
            style={{ borderColor: '#E6E7F0', color: '#122056' }}
            onFocus={e => (e.target.style.borderColor = '#5B65DC')}
            onBlur={e => (e.target.style.borderColor = '#E6E7F0')}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: '#122056' }}>Phone (for WA notification)</label>
          <input
            type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="6281234567890"
            className="w-full px-3 py-2 text-sm rounded-md border outline-none"
            style={{ borderColor: '#E6E7F0', color: '#122056' }}
            onFocus={e => (e.target.style.borderColor = '#5B65DC')}
            onBlur={e => (e.target.style.borderColor = '#E6E7F0')}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: '#122056' }}>Role</label>
          <select
            value={role} onChange={e => setRole(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-md border outline-none"
            style={{ borderColor: '#E6E7F0', color: '#122056' }}
          >
            <option value="CLIENT">Client</option>
            <option value="DEVELOPER">Developer</option>
          </select>
        </div>

        {error && <p className="text-sm" style={{ color: '#dc2626' }}>{error}</p>}

        <button
          type="submit" disabled={submitting}
          className="w-full py-2 text-sm font-medium text-white rounded-md"
          style={{ backgroundColor: '#5B65DC', opacity: submitting ? 0.7 : 1 }}
        >
          {submitting ? 'Generating...' : 'Generate Invite Link'}
        </button>
      </form>

      {inviteUrl && (
        <div className="mt-4 p-3 rounded-lg border" style={{ backgroundColor: '#FFFFFF', borderColor: '#E6E7F0' }}>
          <p className="text-sm font-medium mb-1" style={{ color: '#122056' }}>Invite Link</p>
          <p className="text-xs break-all" style={{ color: '#5B65DC' }}>{inviteUrl}</p>
          <button
            onClick={() => { navigator.clipboard.writeText(inviteUrl) }}
            className="mt-2 text-xs px-2 py-1 rounded border"
            style={{ borderColor: '#E6E7F0', color: '#5B65DC' }}
          >
            Copy to clipboard
          </button>
        </div>
      )}
    </div>
  )
}
