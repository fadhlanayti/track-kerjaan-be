const statusColors: Record<string, string> = {
  OPEN: '#087CF0',
  IN_REVIEW: '#D97706',
  IN_PROGRESS: '#13C9D9',
  RESOLVED: '#9BD83B',
  CLOSED: '#737773',
  // priorities
  LOW: '#737773',
  MEDIUM: '#087CF0',
  HIGH: '#FFAD78',
  URGENT: '#DC2626',
  // project status
  ACTIVE: '#9BD83B',
  ON_HOLD: '#D97706',
  COMPLETED: '#087CF0',
  ARCHIVED: '#737773',
}

export function StatusBadge({ value }: { value: string }) {
  const color = statusColors[value] || '#737773'
  return (
    <span
      className="inline-flex items-center text-xs font-medium px-2 py-0.5"
      style={{ color, backgroundColor: `rgba(${hexToRgb(color)}, 0.1)`, borderLeft: `3px solid ${color}`, borderRadius: '8px' }}
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
