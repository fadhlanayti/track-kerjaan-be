'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError('Invalid email or password')
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAFAFA' }}>
      <div className="w-full max-w-sm" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E6E7F0', borderRadius: '12px', padding: '2rem' }}>
        <h1 className="text-xl font-bold mb-1" style={{ color: '#122056' }}>WeballCreative</h1>
        <p className="text-sm mb-6" style={{ color: '#8890b5' }}>Sign in to Project Tracker</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#122056' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm rounded-md border outline-none transition-colors"
              style={{ borderColor: '#E6E7F0', backgroundColor: '#FFFFFF', color: '#122056' }}
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
              className="w-full px-3 py-2 text-sm rounded-md border outline-none transition-colors"
              style={{ borderColor: '#E6E7F0', backgroundColor: '#FFFFFF', color: '#122056' }}
              onFocus={e => (e.target.style.borderColor = '#5B65DC')}
              onBlur={e => (e.target.style.borderColor = '#E6E7F0')}
            />
          </div>

          {error && <p className="text-sm" style={{ color: '#dc2626' }}>{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 text-sm font-medium text-white rounded-md transition-opacity"
            style={{ backgroundColor: '#5B65DC', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
