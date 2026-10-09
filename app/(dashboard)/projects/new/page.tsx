'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  name: string
  email: string
  role: string
}

export default function NewProjectPage() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [selectedMembers, setSelectedMembers] = useState<{ userId: string; role: string }[]>([])
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/users')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setUsers(data.filter((u: User) => u.role !== 'ADMIN')) })
      .catch(() => {})
  }, [])

  function toggleMember(userId: string, role: string) {
    setSelectedMembers(prev => {
      const exists = prev.find(m => m.userId === userId)
      if (exists) return prev.filter(m => m.userId !== userId)
      return [...prev, { userId, role }]
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, memberIds: selectedMembers }),
    })

    if (res.ok) {
      const project = await res.json()
      router.push(`/projects/${project.id}`)
    } else {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-lg">
      <h2 className="text-lg font-bold mb-5" style={{ color: '#122056' }}>New Project</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: '#122056' }}>Project Name</label>
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
          <label className="block text-sm font-medium mb-1" style={{ color: '#122056' }}>Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 text-sm rounded-md border outline-none resize-none"
            style={{ borderColor: '#E6E7F0', color: '#122056' }}
            onFocus={e => (e.target.style.borderColor = '#5B65DC')}
            onBlur={e => (e.target.style.borderColor = '#E6E7F0')}
          />
        </div>

        {users.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#122056' }}>Add Members</label>
            <div className="space-y-1.5">
              {users.map(user => {
                const selected = selectedMembers.some(m => m.userId === user.id)
                return (
                  <label
                    key={user.id}
                    className="flex items-center gap-2 p-2 rounded-md border cursor-pointer text-sm"
                    style={{
                      borderColor: selected ? '#5B65DC' : '#E6E7F0',
                      backgroundColor: selected ? '#f5f5ff' : '#FFFFFF',
                      color: '#122056',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleMember(user.id, user.role === 'DEVELOPER' ? 'DEVELOPER' : 'CLIENT')}
                      className="accent-[#5B65DC]"
                    />
                    <span>{user.name}</span>
                    <span className="text-xs ml-auto" style={{ color: '#8890b5' }}>{user.role}</span>
                  </label>
                )
              })}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 text-sm font-medium text-white rounded-md"
          style={{ backgroundColor: '#5B65DC', opacity: submitting ? 0.7 : 1 }}
        >
          {submitting ? 'Creating...' : 'Create Project'}
        </button>
      </form>
    </div>
  )
}
