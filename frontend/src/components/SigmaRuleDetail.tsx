import { Link } from 'react-router-dom'
import type { SigmaRuleRecord } from '../catalog/types'
import { SigmaLevelBadge } from './SigmaRuleTable'
import { ExternalLink, Tag } from 'lucide-react'

type SigmaRuleDetailProps = {
  rule: SigmaRuleRecord
}

export function SigmaRuleDetail({ rule }: SigmaRuleDetailProps) {
  const statusColors: Record<string, string> = {
    stable: 'border-low/40 bg-low/10 text-low',
    test: 'border-medium/40 bg-medium/10 text-medium',
    experimental: 'border-high/40 bg-high/10 text-high',
    deprecated: 'border-soc-border bg-soc-elevated text-soc-muted',
    unsupported: 'border-critical/40 bg-critical/10 text-critical',
  }

  const statusClass = statusColors[rule.status.toLowerCase()] ?? 'border-soc-border bg-soc-elevated text-soc-muted'

  return (
    <div className="space-y-5 text-sm">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs text-soc-muted">{rule.id}</span>
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider border ${statusClass}`}>
            {rule.status}
          </span>
          <SigmaLevelBadge level={rule.level} />
        </div>
        <h2 className="text-xl font-bold text-soc-text">{rule.title}</h2>
        <p className="leading-relaxed text-soc-muted">
          {rule.description || 'No description provided in the rule.'}
        </p>
      </div>

      {/* Metadata Grid */}
      <div className="rounded-lg border border-soc-border bg-soc-elevated/30 p-4">
        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Author" value={rule.author || '—'} />
          <Field label="Created Date" value={rule.date || '—'} />
          <Field label="Modified Date" value={rule.modified || '—'} />
          <Field label="Log Source Product" value={rule.logsource.product || '—'} />
          <Field label="Log Source Service" value={rule.logsource.service || '—'} />
          <Field label="Log Source Category" value={rule.logsource.category || '—'} />
          <Field label="Log Source Label" value={rule.logsourceLabel} />
          {rule.logsource.definition && (
            <Field label="Log Source Definition" value={rule.logsource.definition} />
          )}
          <div className="sm:col-span-2 lg:col-span-3">
            <Field label="Sigma Repository File" value={rule.file} mono />
          </div>
        </dl>
      </div>

      {/* MITRE ATT&CK Mapping */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-soc-muted mb-2">
          MITRE ATT&CK Techniques Mapped
        </h3>
        <div className="flex flex-wrap gap-2">
          {rule.mitreTechniques.length > 0 ? (
            rule.mitreTechniques.map((id) => (
              <Link
                key={id}
                to={`/mitre/${encodeURIComponent(id)}`}
                className="rounded-md border border-soc-accent/40 bg-soc-accent-dim px-2.5 py-1 font-mono text-xs font-medium text-soc-accent hover:bg-soc-accent/20 transition-colors"
              >
                {id} →
              </Link>
            ))
          ) : (
            <span className="text-xs text-soc-muted">No explicit ATT&CK technique tags attached to this rule.</span>
          )}
        </div>
      </div>

      {/* Tags */}
      {rule.tags && rule.tags.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-soc-muted mb-2">
            SigmaHQ Tags
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {rule.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded bg-soc-elevated border border-soc-border px-2 py-0.5 text-[11px] text-soc-muted"
              >
                <Tag size={10} /> {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* False Positives */}
      {rule.falsepositives && rule.falsepositives.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-soc-muted mb-2">
            Known False Positives
          </h3>
          <ul className="list-disc space-y-1 pl-5 text-xs text-soc-muted">
            {rule.falsepositives.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* References */}
      {rule.references && rule.references.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-soc-muted mb-2">
            External References
          </h3>
          <ul className="space-y-1 text-xs">
            {rule.references.map((ref) => (
              <li key={ref}>
                <a
                  href={ref}
                  target="_blank"
                  rel="noreferrer"
                  className="text-soc-accent hover:underline inline-flex items-center gap-1 break-all"
                >
                  {ref} <ExternalLink size={10} className="shrink-0" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Detection logic */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-soc-muted">
            Detection Logic (Sigma Rule Definition)
          </h3>
          <span className="text-[11px] text-soc-muted">Engine execution planned for detection milestone</span>
        </div>
        <pre className="max-h-96 overflow-auto rounded-lg border border-soc-border bg-soc-panel p-3.5 font-mono text-[11px] leading-5 text-soc-text">
          {JSON.stringify(rule.detection, null, 2)}
        </pre>
      </div>
    </div>
  )
}

function Field({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-[10px] font-medium uppercase tracking-wider text-soc-muted">{label}</dt>
      <dd className={`mt-0.5 text-soc-text ${mono ? 'font-mono text-xs break-all text-soc-accent/90' : 'text-xs'}`}>{value}</dd>
    </div>
  )
}
