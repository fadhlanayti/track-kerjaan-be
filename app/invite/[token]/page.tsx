'use client'
import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'

export default function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const [invite, setInvite] = useState<{ email: string; name: string } | null>(null)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetch(`/api/invite/${token}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) {
          setError(data.error)
        } else {
          setInvite(data)
          setName(data.name)
        }
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to validate invite')
        setLoading(false)
      })
  }, [token])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    const res = await fetch(`/api/invite/${token}/claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, name }),
    })
    const data = await res.json()

    if (data.success) {
      router.push('/login')
    } else {
      setError(data.error || 'Failed')
      setSubmitting(false)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAFAFA', color: '#8890b5' }}>Loading...</div>
  if (error) return <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAFAFA', color: '#dc2626' }}>{error}</div>

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAFAFA' }}>
      <div className="w-full max-w-sm" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E6E7F0', borderRadius: '12px', padding: '2rem' }}>
        <h1 className="text-xl font-bold mb-1" style={{ color: '#122056' }}>Join WeballCreative</h1>
        <p className="text-sm mb-6" style={{ color: '#8890b5' }}>Set up your account</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#122056' }}>Email</label>
            <input
              type="email"
              value={invite?.email || ''}
              disabled
              className="w-full px-3 py-2 text-sm rounded-md border"
              style={{ borderColor: '#E6E7F0', backgroundColor: '#FAFAFA', color: '#8890b5' }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#122056' }}>Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm rounded-md border outline-none"
              style={{ borderColor: '#E6E7F0', color: '#122056' }}
              onFocus={e => (e.target.style.borderColor = '#5B65DC')}
              onBlur={e => (e.target.style.borderColor = '#E6E7F0')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#122056' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-3 py-2 text-sm rounded-md border outline-none"
              style={{ borderColor: '#E6E7F0', color: '#122056' }}
              onFocus={e => (e.target.style.borderColor = '#5B65DC')}
              onBlur={e => (e.target.style.borderColor = '#E6E7F0')}
              placeholder="Min 6 characters"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2 text-sm font-medium text-white rounded-md"
            style={{ backgroundColor: '#5B65DC', opacity: submitting ? 0.7 : 1 }}
          >
            {submitting ? 'Setting up...' : 'Set Password & Join'}
          </button>
        </form>
      </div>
    </div>
  )
}
