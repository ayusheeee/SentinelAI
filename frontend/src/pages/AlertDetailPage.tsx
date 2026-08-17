import { Link, useParams } from 'react-router-dom'
import { Panel } from '../components/Panel'
import { SeverityBadge } from '../components/SeverityBadge'
import { formatDateTime } from '../lib/format'
import { getAlertById, getLogsByIds } from '../mock/data'

export function AlertDetailPage() {
  const { alertId } = useParams()
  const alert = alertId ? getAlertById(alertId) : undefined

  if (!alert) {
    return (
      <Panel title="Alert not found">
        <p className="text-sm text-soc-muted">The requested alert does not exist in the mock dataset.</p>
        <Link to="/alerts" className="mt-3 inline-block text-sm text-soc-accent hover:underline">
          Back to alerts
        </Link>
      </Panel>
    )
  }

  const related = getLogsByIds(alert.relatedEventIds)

  return (
    <div className="space-y-5">
      <Link to="/alerts" className="text-xs text-soc-accent hover:underline">
        ← All alerts
      </Link>

      <div className="rounded-xl border border-soc-border bg-soc-panel p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-mono text-xs text-soc-muted">{alert.id}</p>
            <h2 className="mt-1 text-xl font-semibold text-soc-text">{alert.title}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-soc-muted">{alert.description}</p>
          </div>
          <SeverityBadge severity={alert.severity} />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Panel title="Alert summary" className="lg:col-span-2">
          <dl className="grid gap-4 sm:grid-cols-2">
            <Field label="Severity" value={alert.severity} />
            <Field label="Timestamp" value={formatDateTime(alert.timestamp)} mono />
            <Field label="Source IP" value={alert.sourceIp} mono />
            <Field label="Destination" value={alert.destination} mono />
            <Field label="Host" value={alert.host} mono />
            <Field label="User" value={alert.user} mono />
            <Field label="Detection source" value={alert.detectionSource} />
            <Field label="Anomaly score" value={alert.anomalyScore.toFixed(2)} mono />
          </dl>
        </Panel>

        <Panel title="Detection mapping">
          <Field label="Sigma rule" value={alert.sigmaRule} mono />
          <div className="mt-4">
            <Field label="MITRE technique" value={`${alert.mitreId} — ${alert.mitreTechnique}`} />
          </div>
        </Panel>
      </div>

      <Panel title="Related events">
        <ul className="space-y-2">
          {related.map((event) => (
            <li key={event.id} className="rounded-lg border border-soc-border bg-soc-elevated/40 px-3 py-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-xs text-soc-accent">{event.id}</span>
                <span className="font-mono text-[11px] text-soc-muted">{formatDateTime(event.timestamp)}</span>
              </div>
              <p className="mt-1 text-xs text-soc-text">{event.message}</p>
            </li>
          ))}
        </ul>
      </Panel>

      <section className="rounded-xl border border-dashed border-soc-accent/40 bg-soc-accent-dim p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-soc-accent">AI Investigation</p>
        <p className="mt-2 text-sm text-soc-text">AI investigation will appear here.</p>
        <p className="mt-1 text-xs text-soc-muted">
          LLM-backed narrative, evidence fusion, and recommended actions are not implemented yet.
        </p>
      </section>
    </div>
  )
}

function Field({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wider text-soc-muted">{label}</dt>
      <dd className={`mt-1 text-sm text-soc-text ${mono ? 'font-mono text-xs' : ''}`}>{value}</dd>
    </div>
  )
}
