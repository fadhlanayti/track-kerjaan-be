const statusColors: Record<string, string> = {
  OPEN: '#2563EB',
  IN_REVIEW: '#D97706',
  IN_PROGRESS: '#F97316',
  RESOLVED: '#16A34A',
  CLOSED: '#9CA3AF',
  // priorities
  LOW: '#9CA3AF',
  MEDIUM: '#2563EB',
  HIGH: '#F97316',
  URGENT: '#DC2626',
  // project status
  ACTIVE: '#16A34A',
  ON_HOLD: '#D97706',
  COMPLETED: '#2563EB',
  ARCHIVED: '#9CA3AF',
}

export function StatusBadge({ value }: { value: string }) {
  const color = statusColors[value] || '#9CA3AF'
  return (
    <span
      className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded"
      style={{ color, backgroundColor: `rgba(${hexToRgb(color)}, 0.1)`, borderLeft: `3px solid ${color}` }}
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
