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
    <div style={{ maxWidth: '28rem' }}>
      <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-primary)' }}>Invite User</h2>

      <div className="card" style={{ padding: '1.5rem' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label className="label">Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required className="input" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label className="label">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="input" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label className="label">No. WhatsApp</label>
            <input
              type="text" value={phone} onChange={e => setPhone(e.target.value)}
              placeholder="087218381744 / +62812... / 62812..."
              className="input"
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Format bebas — otomatis dikonversi ke 62xxx</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label className="label">Role</label>
            <select value={role} onChange={e => setRole(e.target.value)} className="input">
              <option value="CLIENT">Client</option>
              <option value="DEVELOPER">Developer</option>
            </select>
          </div>

          {error && <p className="error-text">{error}</p>}

          <button type="submit" disabled={submitting} className="btn-primary" style={{ justifyContent: 'center', paddingTop: '0.625rem', paddingBottom: '0.625rem' }}>
            {submitting ? 'Generating...' : 'Generate Invite Link'}
          </button>
        </form>
      </div>

      {inviteUrl && (
        <div style={{ marginTop: '1rem', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(8,124,240,0.15)', backgroundColor: 'rgba(8,124,240,0.04)' }}>
          <p style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem', color: 'var(--text-primary)' }}>Invite Link</p>
          <p style={{ fontSize: '0.75rem', wordBreak: 'break-all', color: 'var(--accent)' }}>{inviteUrl}</p>
          <button onClick={() => navigator.clipboard.writeText(inviteUrl)} className="btn-secondary" style={{ marginTop: '0.75rem', fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}>
            Copy to clipboard
          </button>
        </div>
      )}
    </div>
  )
}
