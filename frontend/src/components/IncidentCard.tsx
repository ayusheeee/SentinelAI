import { Link } from 'react-router-dom'
import type { Incident } from '../types'
import { formatDateTime } from '../lib/format'
import { SeverityBadge } from './SeverityBadge'

const statusClass: Record<Incident['status'], string> = {
  New: 'text-info',
  Investigating: 'text-high',
  Resolved: 'text-low',
}

type IncidentCardProps = {
  incident: Incident
}

export function IncidentCard({ incident }: IncidentCardProps) {
  return (
    <article className="rounded-xl border border-soc-border bg-soc-panel p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <Link
          to={`/incidents`}
          className="font-mono text-xs text-soc-accent hover:underline"
        >
          {incident.id}
        </Link>
        <SeverityBadge severity={incident.severity} />
      </div>
      <h3 className="mt-2 text-sm font-semibold text-soc-text">{incident.title}</h3>
      <p className="mt-2 text-xs leading-5 text-soc-muted">{incident.description}</p>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <div>
          <dt className="text-soc-muted">Detection</dt>
          <dd className="mt-0.5 text-soc-text">{incident.detectionSource}</dd>
        </div>
        <div>
          <dt className="text-soc-muted">Status</dt>
          <dd className={`mt-0.5 font-medium ${statusClass[incident.status]}`}>{incident.status}</dd>
        </div>
        <div>
          <dt className="text-soc-muted">Time</dt>
          <dd className="mt-0.5 font-mono text-soc-text">{formatDateTime(incident.time)}</dd>
        </div>
        <div>
          <dt className="text-soc-muted">Analyst</dt>
          <dd className="mt-0.5 text-soc-text">{incident.assignedAnalyst}</dd>
        </div>
      </dl>
    </article>
  )
}
