'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { UserPlus, Trash2 } from 'lucide-react'

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
                <td>{user.name}</td>
                <td style={{ color: 'var(--text-muted)' }}>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  <span className="text-xs font-medium" style={{ color: user.isActive ? 'var(--green)' : 'var(--red)' }}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="text-right">
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
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
    </div>
  )
}
