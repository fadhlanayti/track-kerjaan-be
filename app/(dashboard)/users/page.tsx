'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { UserPlus } from 'lucide-react'

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
                  <span className="text-xs font-medium" style={{ color: user.isActive ? '#4ade80' : '#f87171' }}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="text-right">
                  <button
                    onClick={() => toggleActive(user)}
                    className="btn-secondary text-xs py-1 px-2"
                    style={{ color: user.isActive ? '#f87171' : '#4ade80' }}
                  >
                    {user.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
