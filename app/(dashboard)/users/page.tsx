'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { UserPlus, Trash2, KeyRound, Copy, Check, ExternalLink, X } from 'lucide-react'

interface User {
  id: string
  email: string
  name: string
  phone: string | null
  role: string
  isActive: boolean
  createdAt: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [resetModal, setResetModal] = useState<{ user: User; resetUrl: string; phone: string | null } | null>(null)
  const [generatingReset, setGeneratingReset] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch('/api/users')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setUsers(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function toggleActive(user: User) {
    await fetch(`/api/users/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !user.isActive }),
    })
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isActive: !u.isActive } : u))
  }

  async function deleteUser(user: User) {
    if (!confirm(`Hapus user "${user.name}" secara permanen? Semua data terkait (project, issue, comment) juga akan dihapus.`)) return
    setDeleting(user.id)
    const res = await fetch(`/api/users/${user.id}`, { method: 'DELETE' })
    if (res.ok) {
      setUsers(prev => prev.filter(u => u.id !== user.id))
    } else {
      const data = await res.json().catch(() => ({}))
      alert(data.error || 'Gagal menghapus user')
    }
    setDeleting(null)
  }

  async function handleResetPassword(user: User) {
    setGeneratingReset(user.id)
    try {
      const res = await fetch(`/api/users/${user.id}/reset-password`, { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        setResetModal({
          user,
          resetUrl: data.resetUrl,
          phone: data.phone,
        })
      } else {
        alert(data.error || 'Gagal membuat link reset password')
      }
    } catch (err) {
      alert('Terjadi kesalahan saat membuat link reset password')
    } finally {
      setGeneratingReset(null)
    }
  }

  function copyLink(url: string) {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return <div className="loading-state">Loading...</div>

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Users</h2>
        <Link href="/users/invite" className="btn-primary">
          <UserPlus size={16} />
          Invite User
        </Link>
      </div>

      <div className="card overflow-hidden">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>
                  <div className="font-medium">{user.name}</div>
                  {user.phone && <div className="text-xs text-[var(--text-muted)]">{user.phone}</div>}
                </td>
                <td style={{ color: 'var(--text-muted)' }}>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  <span className="text-xs font-medium" style={{ color: user.isActive ? 'var(--green)' : 'var(--red)' }}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="text-right">
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.375rem', flexWrap: 'wrap' }}>

                    {/* Tombol Reset Password untuk Admin */}
                    <button
                      onClick={() => handleResetPassword(user)}
                      disabled={generatingReset === user.id}
                      className="btn-secondary text-xs py-1 px-2.5 inline-flex items-center gap-1"
                      title="Kirim / Buat Link Reset Password"
                    >
                      <KeyRound size={13} style={{ color: 'var(--accent)' }} />
                      <span>{generatingReset === user.id ? 'Generating...' : 'Reset Pass'}</span>
                    </button>

                    <button
                      onClick={() => toggleActive(user)}
                      className="btn-secondary text-xs py-1 px-2"
                      style={{ color: user.isActive ? 'var(--red)' : 'var(--green)' }}
                    >
                      {user.isActive ? 'Deactivate' : 'Activate'}
                    </button>

                    <button
                      onClick={() => deleteUser(user)}
                      disabled={deleting === user.id}
                      className="btn-secondary text-xs py-1 px-2"
                      style={{ color: 'var(--red)' }}
                    >
                      <Trash2 size={13} />
                      {deleting === user.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Tampilan Link Reset Password */}
      {resetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="card p-6 w-full max-w-md shadow-xl bg-[var(--bg-card)] border border-[var(--border)] relative space-y-4">

            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                  <KeyRound size={16} className="text-[var(--accent)]" />
                  Link Reset Password
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Untuk akun <strong>{resetModal.user.name}</strong> ({resetModal.user.email})
                </p>
              </div>
              <button
                onClick={() => setResetModal(null)}
                className="p-1 rounded-lg hover:bg-[var(--bg-elevated)] text-[var(--text-muted)] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-[var(--text-secondary)]">
                Bagikan link berikut ke user:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={resetModal.resetUrl}
                  className="input text-xs flex-1 font-mono select-all bg-[var(--bg-elevated)]"
                />
                <button
                  onClick={() => copyLink(resetModal.resetUrl)}
                  className="btn-primary text-xs py-2 px-3 inline-flex items-center gap-1 cursor-pointer shrink-0"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copied ? 'Tersalin' : 'Salin'}</span>
                </button>
              </div>
            </div>

            {resetModal.phone && (
              <p className="text-[11px] text-[var(--green)] bg-green-50/50 p-2.5 rounded-lg border border-green-200">
                Link reset password juga otomatis dikirimkan ke nomor WhatsApp <strong>{resetModal.phone}</strong>.
              </p>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setResetModal(null)}
                className="btn-secondary text-xs py-1.5 px-4 cursor-pointer"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
