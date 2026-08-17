import { useMemo, useState } from 'react'
import { LogTable } from '../components/LogTable'
import { Panel } from '../components/Panel'
import { LOGS } from '../mock/data'
import type { Severity } from '../types'

const SEVERITIES: Array<'all' | Severity> = ['all', 'critical', 'high', 'medium', 'low', 'info']

export function LogsPage() {
  const [severity, setSeverity] = useState<(typeof SEVERITIES)[number]>('all')
  const [source, setSource] = useState('all')
  const [eventType, setEventType] = useState('all')

  const sources = useMemo(() => ['all', ...Array.from(new Set(LOGS.map((log) => log.source)))], [])
  const eventTypes = useMemo(() => ['all', ...Array.from(new Set(LOGS.map((log) => log.eventType)))], [])

  const filtered = LOGS.filter((log) => {
    if (severity !== 'all' && log.severity !== severity) return false
    if (source !== 'all' && log.source !== source) return false
    if (eventType !== 'all' && log.eventType !== eventType) return false
    return true
  })

  return (
    <div className="space-y-4">
      <div className="grid gap-3 rounded-xl border border-soc-border bg-soc-panel p-4 md:grid-cols-3">
        <FilterSelect
          label="Severity"
          value={severity}
          options={SEVERITIES}
          onChange={(value) => setSeverity(value as (typeof SEVERITIES)[number])}
        />
        <FilterSelect label="Source" value={source} options={sources} onChange={setSource} />
        <FilterSelect label="Event type" value={eventType} options={eventTypes} onChange={setEventType} />
      </div>

      <Panel title={`Log viewer (${filtered.length})`}>
        <LogTable logs={filtered} />
      </Panel>
    </div>
  )
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
}) {
  return (
    <label className="block text-xs text-soc-muted">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-lg border border-soc-border bg-soc-elevated px-3 py-2 text-sm text-soc-text outline-none focus:border-soc-accent"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}
