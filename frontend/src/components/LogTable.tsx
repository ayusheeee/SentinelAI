import type { LogEvent } from '../types'
import { formatDateTime } from '../lib/format'
import { SeverityBadge } from './SeverityBadge'

type LogTableProps = {
  logs: LogEvent[]
}

export function LogTable({ logs }: LogTableProps) {
  if (logs.length === 0) {
    return (
      <p className="px-4 py-12 text-center text-sm text-soc-muted">
        No log events match the current filters.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1040px] text-left text-sm">
        <thead>
          <tr className="border-b border-soc-border text-xs uppercase tracking-wider text-soc-muted">
            <th className="px-3 py-3 font-medium">Timestamp</th>
            <th className="px-3 py-3 font-medium">Source / IP</th>
            <th className="px-3 py-3 font-medium">Destination IP</th>
            <th className="px-3 py-3 font-medium">Host</th>
            <th className="px-3 py-3 font-medium">User</th>
            <th className="px-3 py-3 font-medium">Event Type / Action</th>
            <th className="px-3 py-3 font-medium">Status</th>
            <th className="px-3 py-3 font-medium">Severity</th>
            <th className="px-3 py-3 font-medium">Message</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => {
            const eventType = log.event_type ?? log.eventType ?? log.action ?? null
            const sourceDisplay = log.source_ip ?? log.source ?? null

            return (
              <tr
                key={log.id}
                className="border-b border-soc-border/70 align-top hover:bg-soc-elevated/60 transition-colors"
              >
                {/* Timestamp */}
                <td className="px-3 py-3 whitespace-nowrap font-mono text-xs text-soc-muted">
                  {log.timestamp ? formatDateTime(log.timestamp) : '—'}
                </td>

                {/* Source IP / Source */}
                <td className="px-3 py-3 whitespace-nowrap">
                  {sourceDisplay ? (
                    <span className="font-mono text-xs text-soc-text bg-soc-elevated/50 px-2 py-0.5 rounded border border-soc-border/50">
                      {sourceDisplay}
                    </span>
                  ) : (
                    <span className="text-xs text-soc-muted">—</span>
                  )}
                </td>

                {/* Destination IP */}
                <td className="px-3 py-3 whitespace-nowrap">
                  {log.destination_ip ? (
                    <span className="font-mono text-xs text-soc-text bg-soc-elevated/50 px-2 py-0.5 rounded border border-soc-border/50">
                      {log.destination_ip}
                    </span>
                  ) : (
                    <span className="text-xs text-soc-muted">—</span>
                  )}
                </td>

                {/* Host */}
                <td className="px-3 py-3 whitespace-nowrap font-mono text-xs text-soc-muted">
                  {log.host || '—'}
                </td>

                {/* User */}
                <td className="px-3 py-3 whitespace-nowrap font-mono text-xs text-soc-muted">
                  {log.user ? (
                    <span className="text-soc-accent">{log.user}</span>
                  ) : (
                    '—'
                  )}
                </td>

                {/* Event Type / Action */}
                <td className="px-3 py-3 whitespace-nowrap">
                  {eventType ? (
                    <span className="font-mono text-xs text-soc-text">
                      {eventType}
                    </span>
                  ) : (
                    <span className="text-xs text-soc-muted">—</span>
                  )}
                </td>

                {/* Status */}
                <td className="px-3 py-3 whitespace-nowrap">
                  {log.status ? (
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium border capitalize ${
                        log.status.toLowerCase() === 'failure' || log.status.toLowerCase() === 'blocked' || log.status.toLowerCase() === 'deny'
                          ? 'border-critical/30 bg-critical/10 text-critical'
                          : log.status.toLowerCase() === 'success' || log.status.toLowerCase() === 'allow'
                            ? 'border-low/30 bg-low/10 text-low'
                            : 'border-soc-border bg-soc-elevated text-soc-muted'
                      }`}
                    >
                      {log.status}
                    </span>
                  ) : (
                    <span className="text-xs text-soc-muted">—</span>
                  )}
                </td>

                {/* Severity */}
                <td className="px-3 py-3 whitespace-nowrap">
                  {log.severity ? (
                    <SeverityBadge severity={log.severity} />
                  ) : (
                    <span className="text-xs text-soc-muted">—</span>
                  )}
                </td>

                {/* Message */}
                <td className="px-3 py-3 max-w-sm text-xs leading-relaxed text-soc-text">
                  <p className="line-clamp-2" title={log.message || undefined}>
                    {log.message || '—'}
                  </p>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
