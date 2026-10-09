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
    setError(''); setInviteUrl(''); setSubmitting(true)
    const res = await fetch('/api/invite/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, phone: phone || undefined, role }),
    })
    const data = await res.json()
    if (res.ok) { setInviteUrl(data.inviteUrl); setEmail(''); setName(''); setPhone('') }
    else setError(data.error || 'Failed to generate invite')
    setSubmitting(false)
  }

  return (
    <div className="max-w-md">
      <h2 className="text-lg font-bold mb-5 text-[#202524]">Invite User</h2>

      <div className="card p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="label">Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required className="input" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="label">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="input" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="label">No. WhatsApp</label>
            <input
              type="text" value={phone} onChange={e => setPhone(e.target.value)}
              placeholder="087218381744 / +62812... / 62812..."
              className="input"
            />
            <p className="text-xs text-[#737773]">Format bebas — otomatis dikonversi ke 62xxx</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="label">Role</label>
            <select value={role} onChange={e => setRole(e.target.value)} className="input">
              <option value="CLIENT">Client</option>
              <option value="DEVELOPER">Developer</option>
            </select>
          </div>

          {error && <p className="error-text">{error}</p>}

          <button type="submit" disabled={submitting} className="btn-primary w-full py-2.5">
            {submitting ? 'Generating...' : 'Generate Invite Link'}
          </button>
        </form>
      </div>

      {inviteUrl && (
        <div className="mt-4 p-4 rounded-xl border border-[#087CF0]/15 bg-[#087CF0]/[0.04]">
          <p className="text-sm font-semibold mb-1.5 text-[#202524]">Invite Link</p>
          <p className="text-xs break-all text-[#087CF0]">{inviteUrl}</p>
          <button onClick={() => navigator.clipboard.writeText(inviteUrl)} className="btn-secondary mt-3 text-xs py-1 px-3">
            Copy to clipboard
          </button>
        </div>
      )}
    </div>
  )
}
