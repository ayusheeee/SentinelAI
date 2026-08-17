import type { EvidenceItem } from '../types'

type EvidenceCardProps = {
  item: EvidenceItem
}

export function EvidenceCard({ item }: EvidenceCardProps) {
  return (
    <article className="rounded-lg border border-soc-border bg-soc-elevated/40 p-3">
      <p className="text-[11px] uppercase tracking-wider text-soc-muted">{item.label}</p>
      <p className="mt-1 font-mono text-xs leading-5 text-soc-text">{item.value}</p>
      <p className="mt-2 text-[11px] text-soc-muted">Source: {item.source}</p>
    </article>
  )
}
