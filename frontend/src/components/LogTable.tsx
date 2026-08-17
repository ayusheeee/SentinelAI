import type { LogEvent } from '../types'
import { formatDateTime } from '../lib/format'
import { SeverityBadge } from './SeverityBadge'

type LogTableProps = {
  logs: LogEvent[]
}

export function LogTable({ logs }: LogTableProps) {
  if (logs.length === 0) {
    return (
      <p className="px-4 py-10 text-center text-sm text-soc-muted">No log events match the current filters.</p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[980px] text-left text-sm">
        <thead>
          <tr className="border-b border-soc-border text-xs uppercase tracking-wider text-soc-muted">
            <th className="px-3 py-3 font-medium">Timestamp</th>
            <th className="px-3 py-3 font-medium">Source</th>
            <th className="px-3 py-3 font-medium">Host</th>
            <th className="px-3 py-3 font-medium">User</th>
            <th className="px-3 py-3 font-medium">Event Type</th>
            <th className="px-3 py-3 font-medium">Message</th>
            <th className="px-3 py-3 font-medium">Severity</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id} className="border-b border-soc-border/70 align-top hover:bg-soc-elevated/60">
              <td className="px-3 py-3 whitespace-nowrap font-mono text-xs text-soc-muted">
                {formatDateTime(log.timestamp)}
              </td>
              <td className="px-3 py-3 text-soc-muted">{log.source}</td>
              <td className="px-3 py-3 font-mono text-xs text-soc-muted">{log.host}</td>
              <td className="px-3 py-3 font-mono text-xs text-soc-muted">{log.user}</td>
              <td className="px-3 py-3 font-mono text-xs text-soc-text">{log.eventType}</td>
              <td className="px-3 py-3 max-w-md text-xs leading-5 text-soc-text">{log.message}</td>
              <td className="px-3 py-3">
                <SeverityBadge severity={log.severity} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
