import type { Severity } from '../types'

const styles: Record<Severity, string> = {
  critical: 'bg-critical/15 text-critical border-critical/30',
  high: 'bg-high/15 text-high border-high/30',
  medium: 'bg-medium/15 text-medium border-medium/30',
  low: 'bg-low/15 text-low border-low/30',
  info: 'bg-info/15 text-info border-info/30',
}

type SeverityBadgeProps = {
  severity: Severity
  className?: string
}

export function SeverityBadge({ severity, className = '' }: SeverityBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${styles[severity]} ${className}`}
    >
      {severity}
    </span>
  )
}
