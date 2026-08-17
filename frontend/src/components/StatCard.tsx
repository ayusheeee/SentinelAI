import type { LucideIcon } from 'lucide-react'

type StatCardProps = {
  label: string
  value: string
  hint?: string
  icon: LucideIcon
  tone?: 'default' | 'critical' | 'high' | 'accent'
}

const toneClass = {
  default: 'text-soc-muted',
  critical: 'text-critical',
  high: 'text-high',
  accent: 'text-soc-accent',
}

export function StatCard({ label, value, hint, icon: Icon, tone = 'default' }: StatCardProps) {
  return (
    <article className="rounded-xl border border-soc-border bg-soc-panel p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-soc-muted">{label}</p>
          <p className="mt-2 font-mono text-2xl font-semibold text-soc-text">{value}</p>
          {hint ? <p className="mt-1 text-xs text-soc-muted">{hint}</p> : null}
        </div>
        <span className={`rounded-lg bg-soc-elevated p-2 ${toneClass[tone]}`}>
          <Icon size={18} strokeWidth={1.75} />
        </span>
      </div>
    </article>
  )
}
