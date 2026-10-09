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

  if (loading) return <div style={{ color: '#8890b5' }}>Loading...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold" style={{ color: '#122056' }}>Users</h2>
        <Link
          href="/users/invite"
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white rounded-md"
          style={{ backgroundColor: '#5B65DC' }}
        >
          <UserPlus size={16} />
          Invite User
        </Link>
      </div>

      <div className="rounded-lg border overflow-hidden" style={{ borderColor: '#E6E7F0' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: '#E6E7F0' }}>
              <th className="text-left px-4 py-2.5 font-medium" style={{ color: '#122056' }}>Name</th>
              <th className="text-left px-4 py-2.5 font-medium" style={{ color: '#122056' }}>Email</th>
              <th className="text-left px-4 py-2.5 font-medium" style={{ color: '#122056' }}>Role</th>
              <th className="text-left px-4 py-2.5 font-medium" style={{ color: '#122056' }}>Status</th>
              <th className="text-right px-4 py-2.5 font-medium" style={{ color: '#122056' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-t" style={{ borderColor: '#E6E7F0', backgroundColor: '#FFFFFF' }}>
                <td className="px-4 py-3" style={{ color: '#122056' }}>{user.name}</td>
                <td className="px-4 py-3" style={{ color: '#8890b5' }}>{user.email}</td>
                <td className="px-4 py-3" style={{ color: '#122056' }}>{user.role}</td>
                <td className="px-4 py-3">
                  <span className="text-xs font-medium" style={{ color: user.isActive ? '#16a34a' : '#dc2626' }}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => toggleActive(user)}
                    className="text-xs px-2 py-1 rounded border"
                    style={{ borderColor: '#E6E7F0', color: user.isActive ? '#dc2626' : '#16a34a' }}
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
