import { Link, useParams } from 'react-router-dom'
import { EvidenceCard } from '../components/EvidenceCard'
import { Panel } from '../components/Panel'
import { Timeline } from '../components/Timeline'
import { formatNumber } from '../lib/format'
import { INVESTIGATIONS, getIncidentById, getInvestigationById } from '../mock/data'

export function InvestigationsPage() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-dashed border-soc-accent/40 bg-soc-accent-dim px-4 py-3">
        <p className="text-sm font-semibold text-soc-accent">AI Investigation: Coming Soon</p>
        <p className="mt-1 text-xs text-soc-muted">
          This screen is a layout preview. Automated LLM analysis will be wired in a later milestone.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-soc-border bg-soc-panel">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-soc-border text-xs uppercase tracking-wider text-soc-muted">
              <th className="px-4 py-3 font-medium">Investigation</th>
              <th className="px-4 py-3 font-medium">Incident</th>
              <th className="px-4 py-3 font-medium">Title</th>
            </tr>
          </thead>
          <tbody>
            {INVESTIGATIONS.map((item) => (
              <tr key={item.id} className="border-b border-soc-border/70 hover:bg-soc-elevated/60">
                <td className="px-4 py-3">
                  <Link to={`/investigations/${item.id}`} className="font-mono text-xs text-soc-accent hover:underline">
                    {item.id}
                  </Link>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-soc-muted">{item.incidentId}</td>
                <td className="px-4 py-3 text-soc-text">{item.title}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function InvestigationDetailPage() {
  const { investigationId } = useParams()
  const investigation = investigationId ? getInvestigationById(investigationId) : undefined
  const incident = investigation ? getIncidentById(investigation.incidentId) : undefined

  if (!investigation) {
    return (
      <Panel title="Investigation not found">
        <Link to="/investigations" className="text-sm text-soc-accent hover:underline">
          Back to investigations
        </Link>
      </Panel>
    )
  }

  return (
    <div className="space-y-5">
      <Link to="/investigations" className="text-xs text-soc-accent hover:underline">
        ← All investigations
      </Link>

      <div className="rounded-xl border border-dashed border-soc-accent/40 bg-soc-accent-dim px-4 py-3">
        <p className="text-sm font-semibold text-soc-accent">AI Investigation: Coming Soon</p>
        <p className="mt-1 text-xs text-soc-muted">
          Sections below are populated with mock data so the analyst workflow can be demonstrated.
        </p>
      </div>

      <Panel title="1. Incident Summary">
        <p className="text-sm leading-6 text-soc-text">{investigation.summary}</p>
        {incident ? (
          <p className="mt-3 text-xs text-soc-muted">
            Linked incident {incident.id} · {incident.status} · {incident.assignedAnalyst}
          </p>
        ) : null}
      </Panel>

      <Panel title="2. Attack Timeline">
        <Timeline events={investigation.timeline} />
      </Panel>

      <Panel title="3. Evidence">
        <div className="grid gap-3 md:grid-cols-3">
          {investigation.evidence.map((item) => (
            <EvidenceCard key={item.id} item={item} />
          ))}
        </div>
      </Panel>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="4. Sigma Matches">
          <ul className="space-y-2">
            {investigation.sigmaMatches.map((rule) => (
              <li key={rule} className="rounded-lg border border-soc-border bg-soc-elevated/40 px-3 py-2 font-mono text-xs">
                {rule}
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="5. MITRE ATT&CK Mapping">
          <ul className="space-y-2">
            {investigation.mitreMappings.map((technique) => (
              <li key={technique.id} className="rounded-lg border border-soc-border bg-soc-elevated/40 px-3 py-2">
                <span className="font-mono text-xs text-soc-accent">{technique.id}</span>
                <span className="ml-2 text-sm text-soc-text">{technique.name}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel title="6. Anomaly Detection">
        <p className="text-sm text-soc-muted">Composite anomaly score from the mock ML layer.</p>
        <p className="mt-2 font-mono text-3xl font-semibold text-soc-accent">
          {investigation.anomalyScore.toFixed(2)}
        </p>
        <p className="mt-1 text-xs text-soc-muted">Range 0–1 · threshold 0.75</p>
      </Panel>

      <Panel title="7. AI Analysis">
        <p className="text-sm text-soc-text">AI investigation will appear here.</p>
        <p className="mt-2 text-xs text-soc-muted">
          Placeholder for the LLM narrative that will fuse Sigma, MITRE, and ML evidence.
        </p>
      </Panel>

      <Panel title="8. Recommended Actions">
        <ol className="list-decimal space-y-2 pl-5 text-sm text-soc-text">
          {investigation.recommendedActions.map((action) => (
            <li key={action}>{action}</li>
          ))}
        </ol>
        <p className="mt-3 text-[11px] text-soc-muted">
          {formatNumber(investigation.recommendedActions.length)} playbook steps — not yet auto-generated.
        </p>
      </Panel>
    </div>
  )
}
