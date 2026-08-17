import type { TimelineEvent } from '../types'
import { formatDateTime } from '../lib/format'
import { SeverityBadge } from './SeverityBadge'

type TimelineProps = {
  events: TimelineEvent[]
}

export function Timeline({ events }: TimelineProps) {
  return (
    <ol className="space-y-0">
      {events.map((event, index) => (
        <li key={event.id} className="flex gap-4">
          <div className="flex flex-col items-center">
            <span className="mt-1 h-2.5 w-2.5 rounded-full bg-soc-accent" />
            {index < events.length - 1 ? (
              <span className="w-px flex-1 bg-soc-border" />
            ) : (
              <span className="h-2" />
            )}
          </div>
          <div className="mb-5 flex-1 rounded-lg border border-soc-border bg-soc-elevated/50 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium text-soc-text">{event.title}</p>
              <SeverityBadge severity={event.severity} />
            </div>
            <p className="mt-1 font-mono text-[11px] text-soc-muted">{formatDateTime(event.time)}</p>
            <p className="mt-2 text-xs leading-5 text-soc-muted">{event.detail}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}
