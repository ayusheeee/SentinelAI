import { Link } from 'react-router-dom'
import type { SigmaRuleRecord } from '../catalog/types'
import { SeverityBadge } from './SeverityBadge'
import type { Severity } from '../types'

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
            <th className="px-3 py-3 font-medium">Title</th>
            <th className="px-3 py-3 font-medium">Rule ID</th>
            <th className="px-3 py-3 font-medium">Status</th>
            <th className="px-3 py-3 font-medium">Severity</th>
            <th className="px-3 py-3 font-medium">Log source</th>
            <th className="px-3 py-3 font-medium">MITRE</th>
          </tr>
        </thead>
        <tbody>
          {rules.map((rule) => {
            const severity = levelToSeverity(rule.level)
            return (
              <tr key={rule.id} className="border-b border-soc-border/70 align-top hover:bg-soc-elevated/60">
                <td className="px-3 py-3">
                  {onOpen ? (
                    <button
                      type="button"
                      onClick={() => onOpen(rule)}
                      className="text-left font-medium text-soc-text hover:text-soc-accent"
                    >
                      {rule.title}
                    </button>
                  ) : (
                    <Link
                      to={`/sigma/${encodeURIComponent(rule.id)}`}
                      className="font-medium text-soc-text hover:text-soc-accent"
                    >
                      {rule.title}
                    </Link>
                  )}
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-soc-muted">{rule.description}</p>
                </td>
                <td className="px-3 py-3 font-mono text-[11px] text-soc-muted">{rule.id}</td>
                <td className="px-3 py-3 text-xs capitalize text-soc-muted">{rule.status}</td>
                <td className="px-3 py-3">
                  {severity ? (
                    <SeverityBadge severity={severity} />
                  ) : (
                    <span className="text-xs text-soc-muted">{rule.level}</span>
                  )}
                </td>
                <td className="px-3 py-3 text-xs text-soc-muted">{rule.logsourceLabel}</td>
                <td className="px-3 py-3 font-mono text-[11px] text-soc-muted">
                  {rule.mitreTechniques.slice(0, 3).join(', ') || '—'}
                  {rule.mitreTechniques.length > 3 ? ` +${rule.mitreTechniques.length - 3}` : ''}
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
  return <span className="text-xs text-soc-muted">{level || 'unknown'}</span>
}
