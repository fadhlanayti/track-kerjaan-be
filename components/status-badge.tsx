const statusColors: Record<string, string> = {
  OPEN: '#818cf8',
  IN_REVIEW: '#fbbf24',
  IN_PROGRESS: '#60a5fa',
  RESOLVED: '#4ade80',
  CLOSED: '#64748b',
  // priorities
  LOW: '#64748b',
  MEDIUM: '#818cf8',
  HIGH: '#fb923c',
  URGENT: '#f87171',
  // project status
  ACTIVE: '#4ade80',
  ON_HOLD: '#fbbf24',
  COMPLETED: '#818cf8',
  ARCHIVED: '#64748b',
}

export function StatusBadge({ value }: { value: string }) {
  const color = statusColors[value] || '#64748b'
  return (
    <span
      className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded"
      style={{ color, backgroundColor: `rgba(${hexToRgb(color)}, 0.15)`, borderLeft: `3px solid ${color}` }}
    >
      {value.replace(/_/g, ' ')}
    </span>
  )
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r},${g},${b}`
}
