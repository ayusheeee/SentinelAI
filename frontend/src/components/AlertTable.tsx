import { Link } from 'react-router-dom'
import type { Alert } from '../types'
import { formatDateTime } from '../lib/format'
import { SeverityBadge } from './SeverityBadge'

const statusLabel: Record<Alert['status'], string> = {
  open: 'Open',
  acknowledged: 'Acknowledged',
  closed: 'Closed',
}

type AlertTableProps = {
  alerts: Alert[]
  compact?: boolean
}

export function AlertTable({ alerts, compact = false }: AlertTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead>
          <tr className="border-b border-soc-border text-xs uppercase tracking-wider text-soc-muted">
            <th className="px-3 py-3 font-medium">Severity</th>
            <th className="px-3 py-3 font-medium">Alert</th>
            <th className="px-3 py-3 font-medium">Source</th>
            <th className="px-3 py-3 font-medium">Host</th>
            <th className="px-3 py-3 font-medium">Timestamp</th>
            <th className="px-3 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {alerts.map((alert) => (
            <tr key={alert.id} className="border-b border-soc-border/70 hover:bg-soc-elevated/60">
              <td className="px-3 py-3">
                <SeverityBadge severity={alert.severity} />
              </td>
              <td className="px-3 py-3">
                <Link to={`/alerts/${alert.id}`} className="font-medium text-soc-text hover:text-soc-accent">
                  {alert.title}
                </Link>
                {!compact ? (
                  <p className="mt-0.5 font-mono text-[11px] text-soc-muted">{alert.id}</p>
                ) : null}
              </td>
              <td className="px-3 py-3 text-soc-muted">{alert.source}</td>
              <td className="px-3 py-3 font-mono text-xs text-soc-muted">{alert.host}</td>
              <td className="px-3 py-3 whitespace-nowrap font-mono text-xs text-soc-muted">
                {formatDateTime(alert.timestamp)}
              </td>
              <td className="px-3 py-3 text-soc-muted">{statusLabel[alert.status]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
