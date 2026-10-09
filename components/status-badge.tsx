const statusConfig: Record<string, { color: string; bg: string }> = {
  OPEN:        { color: '#087CF0', bg: '#EBF5FF' },
  IN_REVIEW:   { color: '#92400E', bg: '#FEF3C7' },
  IN_PROGRESS: { color: '#0E7490', bg: '#CFFAFE' },
  RESOLVED:    { color: '#15803D', bg: '#DCFCE7' },
  CLOSED:      { color: '#4B5563', bg: '#F3F4F6' },
  LOW:         { color: '#4B5563', bg: '#F3F4F6' },
  MEDIUM:      { color: '#1D4ED8', bg: '#DBEAFE' },
  HIGH:        { color: '#C2410C', bg: '#FFEDD5' },
  URGENT:      { color: '#B91C1C', bg: '#FEE2E2' },
  ACTIVE:      { color: '#15803D', bg: '#DCFCE7' },
  ON_HOLD:     { color: '#92400E', bg: '#FEF3C7' },
  COMPLETED:   { color: '#1D4ED8', bg: '#DBEAFE' },
  ARCHIVED:    { color: '#4B5563', bg: '#F3F4F6' },
}

const fallback = { color: '#4B5563', bg: '#F3F4F6' }

export function StatusBadge({ value }: { value: string }) {
  const { color, bg } = statusConfig[value] || fallback
  return (
    <span
      className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-lg"
      style={{ color, backgroundColor: bg }}
    >
      {value.replace(/_/g, ' ')}
    </span>
  )
}
