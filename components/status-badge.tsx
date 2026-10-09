const statusColors: Record<string, string> = {
  OPEN: '#5B65DC',
  IN_REVIEW: '#b08d26',
  IN_PROGRESS: '#2563eb',
  RESOLVED: '#16a34a',
  CLOSED: '#8890b5',
  // priorities
  LOW: '#8890b5',
  MEDIUM: '#5B65DC',
  HIGH: '#ea580c',
  URGENT: '#dc2626',
  // project status
  ACTIVE: '#16a34a',
  ON_HOLD: '#b08d26',
  COMPLETED: '#5B65DC',
  ARCHIVED: '#8890b5',
}

export function StatusBadge({ value }: { value: string }) {
  const color = statusColors[value] || '#8890b5'
  return (
    <span
      className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded"
      style={{ color, backgroundColor: `${color}14`, borderLeft: `3px solid ${color}` }}
    >
      {value.replace(/_/g, ' ')}
    </span>
  )
}
