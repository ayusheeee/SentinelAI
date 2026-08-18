import { Link } from 'react-router-dom'
import type { SigmaRuleRecord } from '../catalog/types'
import { SeverityBadge } from './SeverityBadge'
import type { Severity } from '../types'
import { Eye } from 'lucide-react'

function levelToSeverity(level: string): Severity | null {
  const normalized = level.toLowerCase()
  if (normalized === 'critical' || normalized === 'high' || normalized === 'medium' || normalized === 'low' || normalized === 'info') {
    return normalized
  }
  return null
}

type SigmaRuleTableProps = {
  rules: SigmaRuleRecord[]
  onOpen?: (rule: SigmaRuleRecord) => void
}

export function SigmaRuleTable({ rules, onOpen }: SigmaRuleTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[980px] text-left text-sm">
        <thead>
          <tr className="border-b border-soc-border text-xs uppercase tracking-wider text-soc-muted">
            <th className="px-3.5 py-3 font-medium">Rule Title</th>
            <th className="px-3.5 py-3 font-medium">Severity</th>
            <th className="px-3.5 py-3 font-medium">Status</th>
            <th className="px-3.5 py-3 font-medium">Log Source</th>
            <th className="px-3.5 py-3 font-medium">MITRE Techniques</th>
            <th className="px-3.5 py-3 font-medium text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {rules.map((rule) => {
            const severity = levelToSeverity(rule.level)
            return (
              <tr
                key={rule.id}
                className="border-b border-soc-border/70 align-top hover:bg-soc-elevated/60 transition-colors"
              >
                <td className="px-3.5 py-3 max-w-md">
                  {onOpen ? (
                    <button
                      type="button"
                      onClick={() => onOpen(rule)}
                      className="text-left font-medium text-soc-text hover:text-soc-accent transition-colors block"
                    >
                      {rule.title}
                    </button>
                  ) : (
                    <Link
                      to={`/sigma/${encodeURIComponent(rule.id)}`}
                      className="font-medium text-soc-text hover:text-soc-accent transition-colors block"
                    >
                      {rule.title}
                    </Link>
                  )}
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-soc-muted">
                    {rule.description || 'No description provided.'}
                  </p>
                  <p className="mt-1 font-mono text-[10px] text-soc-muted/70 truncate max-w-sm">
                    ID: {rule.id}
                  </p>
                </td>
                <td className="px-3.5 py-3 whitespace-nowrap">
                  {severity ? (
                    <SeverityBadge severity={severity} />
                  ) : (
                    <span className="text-xs text-soc-muted capitalize">{rule.level}</span>
                  )}
                </td>
                <td className="px-3.5 py-3 whitespace-nowrap">
                  <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-soc-elevated border border-soc-border capitalize text-soc-muted">
                    {rule.status}
                  </span>
                </td>
                <td className="px-3.5 py-3 whitespace-nowrap">
                  <span className="text-xs text-soc-text bg-soc-elevated/50 px-2 py-1 rounded border border-soc-border/50">
                    {rule.logsourceLabel}
                  </span>
                </td>
                <td className="px-3.5 py-3">
                  <div className="flex flex-wrap gap-1">
                    {rule.mitreTechniques.length > 0 ? (
                      rule.mitreTechniques.slice(0, 4).map((techId) => (
                        <Link
                          key={techId}
                          to={`/mitre/${encodeURIComponent(techId)}`}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded bg-soc-accent-dim border border-soc-accent/30 px-1.5 py-0.5 font-mono text-[11px] text-soc-accent hover:bg-soc-accent/20 transition-colors"
                        >
                          {techId}
                        </Link>
                      ))
                    ) : (
                      <span className="text-xs text-soc-muted">—</span>
                    )}
                    {rule.mitreTechniques.length > 4 && (
                      <span className="text-[10px] text-soc-muted self-center">
                        +{rule.mitreTechniques.length - 4} more
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-3.5 py-3 whitespace-nowrap text-right">
                  {onOpen ? (
                    <button
                      type="button"
                      onClick={() => onOpen(rule)}
                      className="inline-flex items-center gap-1 rounded-lg border border-soc-border bg-soc-elevated/80 px-2.5 py-1 text-xs text-soc-muted hover:border-soc-accent/40 hover:text-soc-accent transition-colors"
                    >
                      <Eye size={12} /> View
                    </button>
                  ) : (
                    <Link
                      to={`/sigma/${encodeURIComponent(rule.id)}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-soc-border bg-soc-elevated/80 px-2.5 py-1 text-xs text-soc-muted hover:border-soc-accent/40 hover:text-soc-accent transition-colors"
                    >
                      <Eye size={12} /> Details
                    </Link>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export function SigmaLevelBadge({ level }: { level: string }) {
  const severity = levelToSeverity(level)
  if (severity) return <SeverityBadge severity={severity} />
  return <span className="text-xs text-soc-muted capitalize">{level || 'unknown'}</span>
}
