import { useState } from 'react'
import { Panel } from '../components/Panel'
import { SeverityBadge } from '../components/SeverityBadge'
import { REPORTS } from '../mock/data'

export function ReportsPage() {
  const [selected, setSelected] = useState<string | null>(null)
  const report = REPORTS.find((item) => item.id === selected)

  return (
    <div className="space-y-5">
      <Panel title="Incident reports">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-soc-border text-xs uppercase tracking-wider text-soc-muted">
                <th className="px-3 py-3 font-medium">Report</th>
                <th className="px-3 py-3 font-medium">Date</th>
                <th className="px-3 py-3 font-medium">Severity</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-3 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {REPORTS.map((item) => (
                <tr key={item.id} className="border-b border-soc-border/70">
                  <td className="px-3 py-3">
                    <p className="text-soc-text">{item.title}</p>
                    <p className="font-mono text-[11px] text-soc-muted">{item.id}</p>
                  </td>
                  <td className="px-3 py-3 font-mono text-xs text-soc-muted">{item.date}</td>
                  <td className="px-3 py-3">
                    <SeverityBadge severity={item.severity} />
                  </td>
                  <td className="px-3 py-3 text-soc-muted">{item.status}</td>
                  <td className="px-3 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setSelected(item.id)}
                      className="rounded-lg border border-soc-border px-3 py-1.5 text-xs text-soc-accent hover:bg-soc-elevated"
                    >
                      View Report
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {report ? (
        <Panel title={report.title}>
          <p className="text-sm text-soc-muted">
            Report body is a placeholder. Generated narratives and export (PDF/JSON) will be added with the backend.
          </p>
          <dl className="mt-4 grid gap-3 sm:grid-cols-3 text-sm">
            <div>
              <dt className="text-xs text-soc-muted">ID</dt>
              <dd className="font-mono text-xs">{report.id}</dd>
            </div>
            <div>
              <dt className="text-xs text-soc-muted">Date</dt>
              <dd>{report.date}</dd>
            </div>
            <div>
              <dt className="text-xs text-soc-muted">Status</dt>
              <dd>{report.status}</dd>
            </div>
          </dl>
        </Panel>
      ) : null}
    </div>
  )
}
