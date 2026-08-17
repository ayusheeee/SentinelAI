import { IncidentCard } from '../components/IncidentCard'
import { SeverityBadge } from '../components/SeverityBadge'
import { formatDateTime } from '../lib/format'
import { INCIDENTS } from '../mock/data'
import type { Incident } from '../types'

const statusClass: Record<Incident['status'], string> = {
  New: 'text-info',
  Investigating: 'text-high',
  Resolved: 'text-low',
}

export function IncidentsPage() {
  return (
    <div className="space-y-5">
      <p className="text-sm text-soc-muted">
        Incident statuses: New, Investigating, Resolved. Assignment is mock data only.
      </p>

      <div className="overflow-x-auto rounded-xl border border-soc-border bg-soc-panel">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead>
            <tr className="border-b border-soc-border text-xs uppercase tracking-wider text-soc-muted">
              <th className="px-4 py-3 font-medium">Incident ID</th>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Severity</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Detection time</th>
              <th className="px-4 py-3 font-medium">Assigned analyst</th>
            </tr>
          </thead>
          <tbody>
            {INCIDENTS.map((incident) => (
              <tr key={incident.id} className="border-b border-soc-border/70 hover:bg-soc-elevated/60">
                <td className="px-4 py-3 font-mono text-xs text-soc-accent">{incident.id}</td>
                <td className="px-4 py-3 text-soc-text">{incident.title}</td>
                <td className="px-4 py-3">
                  <SeverityBadge severity={incident.severity} />
                </td>
                <td className={`px-4 py-3 font-medium ${statusClass[incident.status]}`}>{incident.status}</td>
                <td className="px-4 py-3 whitespace-nowrap font-mono text-xs text-soc-muted">
                  {formatDateTime(incident.time)}
                </td>
                <td className="px-4 py-3 text-soc-muted">{incident.assignedAnalyst}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {INCIDENTS.map((incident) => (
          <IncidentCard key={`${incident.id}-card`} incident={incident} />
        ))}
      </div>
    </div>
  )
}
