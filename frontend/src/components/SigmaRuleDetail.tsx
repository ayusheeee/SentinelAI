import { Link } from 'react-router-dom'
import type { SigmaRuleRecord } from '../catalog/types'
import { SigmaLevelBadge } from './SigmaRuleTable'

type SigmaRuleDetailProps = {
  rule: SigmaRuleRecord
}

export function SigmaRuleDetail({ rule }: SigmaRuleDetailProps) {
  return (
    <div className="space-y-4 text-sm">
      <div>
        <p className="font-mono text-xs text-soc-muted">{rule.id}</p>
        <h2 className="mt-1 text-lg font-semibold text-soc-text">{rule.title}</h2>
        <p className="mt-2 leading-6 text-soc-muted">{rule.description || 'No description provided in the rule.'}</p>
      </div>

      <dl className="grid gap-3 sm:grid-cols-2">
        <Field label="Status" value={rule.status} />
        <div>
          <dt className="text-[11px] uppercase tracking-wider text-soc-muted">Severity / level</dt>
          <dd className="mt-1">
            <SigmaLevelBadge level={rule.level} />
          </dd>
        </div>
        <Field label="Author" value={rule.author || '—'} />
        <Field label="Date" value={rule.date || '—'} />
        <Field label="Modified" value={rule.modified || '—'} />
        <Field label="Log source" value={rule.logsourceLabel} />
        <Field label="Product" value={rule.logsource.product || '—'} />
        <Field label="Category" value={rule.logsource.category || '—'} />
        <Field label="Service" value={rule.logsource.service || '—'} />
        <Field label="File" value={rule.file} mono />
      </dl>

      <div>
        <p className="text-[11px] uppercase tracking-wider text-soc-muted">MITRE ATT&CK tags</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {rule.mitreTechniques.length ? (
            rule.mitreTechniques.map((id) => (
              <Link
                key={id}
                to={`/mitre/${encodeURIComponent(id)}`}
                className="rounded border border-soc-border px-2 py-1 font-mono text-[11px] text-soc-accent hover:bg-soc-elevated"
              >
                {id}
              </Link>
            ))
          ) : (
            <span className="text-xs text-soc-muted">No ATT&CK technique tags</span>
          )}
        </div>
      </div>

      {rule.falsepositives.length ? (
        <div>
          <p className="text-[11px] uppercase tracking-wider text-soc-muted">False positives</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-soc-muted">
            {rule.falsepositives.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div>
        <p className="text-[11px] uppercase tracking-wider text-soc-muted">Detection (not executed)</p>
        <pre className="mt-2 max-h-80 overflow-auto rounded-lg border border-soc-border bg-soc-elevated/50 p-3 font-mono text-[11px] leading-5 text-soc-text">
          {JSON.stringify(rule.detection, null, 2)}
        </pre>
      </div>
    </div>
  )
}

function Field({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wider text-soc-muted">{label}</dt>
      <dd className={`mt-1 text-soc-text ${mono ? 'font-mono text-xs break-all' : ''}`}>{value}</dd>
    </div>
  )
}
