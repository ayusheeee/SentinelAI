import { useMemo, useRef, useState } from 'react'
import { FilterSelect } from '../components/FilterSelect'
import { LogTable } from '../components/LogTable'
import { Panel } from '../components/Panel'
import { SearchInput } from '../components/SearchInput'
import { LOGS } from '../mock/data'
import type { LogEvent, LogUploadResponse, Severity } from '../types'
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  RotateCcw,
  UploadCloud,
  X,
} from 'lucide-react'

const SEVERITIES: Array<'all' | Severity> = ['all', 'critical', 'high', 'medium', 'low', 'info']

export function LogsPage() {
  const [logs, setLogs] = useState<LogEvent[]>(LOGS)
  const [uploadedFile, setUploadedFile] = useState<{
    name: string
    format: string
    count: number
  } | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [severity, setSeverity] = useState<(typeof SEVERITIES)[number]>('all')
  const [hostFilter, setHostFilter] = useState('all')
  const [eventTypeFilter, setEventTypeFilter] = useState('all')

  const fileInputRef = useRef<HTMLInputElement>(null)

  const hosts = useMemo(() => {
    const list = Array.from(new Set(logs.map((l) => l.host).filter(Boolean))) as string[]
    return ['all', ...list]
  }, [logs])

  const eventTypes = useMemo(() => {
    const list = Array.from(
      new Set(logs.map((l) => l.event_type ?? l.eventType ?? l.action).filter(Boolean))
    ) as string[]
    return ['all', ...list]
  }, [logs])

  const handleFileUpload = async (file: File) => {
    const ext = `.${file.name.split('.').pop()?.toLowerCase()}`
    if (!['.csv', '.log', '.txt'].includes(ext)) {
      setUploadError(`Unsupported file format "${ext}". Please upload a .csv, .log, or .txt file.`)
      return
    }

    setUploading(true)
    setUploadError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/logs/upload', {
        method: 'POST',
        body: formData,
      })

      const data = (await response.json()) as LogUploadResponse

      if (!response.ok || !data.success || !data.events) {
        throw new Error(data.error || `Upload failed with status ${response.status}.`)
      }

      setLogs(data.events)
      setUploadedFile({
        name: data.filename || file.name,
        format: data.format || 'Standard Security Log',
        count: data.total_events || data.events.length,
      })
      // Reset active filters on new file upload
      setSearchQuery('')
      setSeverity('all')
      setHostFilter('all')
      setEventTypeFilter('all')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred while uploading the log file.'
      setUploadError(msg)
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      void handleFileUpload(file)
    }
  }

  const handleResetToDemo = () => {
    setLogs(LOGS)
    setUploadedFile(null)
    setUploadError(null)
    setSearchQuery('')
    setSeverity('all')
    setHostFilter('all')
    setEventTypeFilter('all')
  }

  const filtered = useMemo(() => {
    const needle = searchQuery.trim().toLowerCase()
    return logs.filter((log) => {
      if (severity !== 'all' && log.severity !== severity) return false
      if (hostFilter !== 'all' && log.host !== hostFilter) return false
      const evt = log.event_type ?? log.eventType ?? log.action ?? ''
      if (eventTypeFilter !== 'all' && evt !== eventTypeFilter) return false

      if (!needle) return true
      return (
        (log.message && log.message.toLowerCase().includes(needle)) ||
        (log.source_ip && log.source_ip.toLowerCase().includes(needle)) ||
        (log.destination_ip && log.destination_ip.toLowerCase().includes(needle)) ||
        (log.user && log.user.toLowerCase().includes(needle)) ||
        (log.host && log.host.toLowerCase().includes(needle)) ||
        (evt && evt.toLowerCase().includes(needle))
      )
    })
  }, [logs, severity, hostFilter, eventTypeFilter, searchQuery])

  const isFiltered =
    searchQuery.trim() !== '' || severity !== 'all' || hostFilter !== 'all' || eventTypeFilter !== 'all'

  return (
    <div className="space-y-5">
      {/* Header with Upload CTA */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-soc-text">Security Log Pipeline</h2>
          <p className="text-xs text-soc-muted">
            Upload raw log files (.csv, .log, .txt) for instant backend parsing and field normalization.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.log,.txt"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-lg border border-soc-accent/40 bg-soc-accent-dim px-4 py-2 text-xs font-semibold text-soc-accent hover:bg-soc-accent/20 disabled:opacity-50 transition-colors shadow-sm"
          >
            {uploading ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Parsing log file…
              </>
            ) : (
              <>
                <UploadCloud size={16} /> Upload Log File
              </>
            )}
          </button>
        </div>
      </div>

      {/* Upload Status Banner */}
      {uploadedFile && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-low/40 bg-low/10 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-low/20 text-low">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <p className="text-xs font-semibold text-soc-text">
                Active Log Dataset: <span className="font-mono text-low">{uploadedFile.name}</span>
              </p>
              <p className="text-[11px] text-soc-muted">
                Format: <strong className="text-soc-text font-medium">{uploadedFile.format}</strong> ·{' '}
                <strong className="text-soc-text font-medium">{uploadedFile.count.toLocaleString()}</strong> events
                parsed & normalized
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-lg border border-soc-border bg-soc-elevated px-3 py-1.5 text-xs text-soc-text hover:bg-soc-panel transition-colors"
            >
              Upload Another
            </button>
            <button
              type="button"
              onClick={handleResetToDemo}
              className="inline-flex items-center gap-1 rounded-lg border border-soc-border bg-soc-elevated px-3 py-1.5 text-xs text-soc-muted hover:text-soc-text transition-colors"
            >
              <RotateCcw size={12} /> Reset to Demo Logs
            </button>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {uploadError && (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-critical/40 bg-critical/10 p-4 text-xs">
          <div className="flex items-start gap-2.5">
            <AlertCircle size={16} className="text-critical shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-critical">Log parsing error</p>
              <p className="mt-0.5 text-soc-text leading-relaxed">{uploadError}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setUploadError(null)}
            className="text-soc-muted hover:text-soc-text"
            aria-label="Dismiss error"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Upload Dropzone / Guide when on demo logs */}
      {!uploadedFile && (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault()
            const file = e.dataTransfer.files[0]
            if (file) void handleFileUpload(file)
          }}
          className="group flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-soc-border hover:border-soc-accent/50 bg-soc-panel/40 hover:bg-soc-panel/70 p-6 text-center transition-colors"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-soc-elevated text-soc-muted group-hover:text-soc-accent transition-colors">
            <UploadCloud size={20} />
          </div>
          <p className="mt-2 text-xs font-medium text-soc-text">
            Drop a security log file here, or <span className="text-soc-accent underline">browse</span>
          </p>
          <p className="mt-1 text-[11px] text-soc-muted">
            Supported formats: CSV (<code className="font-mono">.csv</code>), Syslog/CEF (<code className="font-mono">.log</code>), Raw text (<code className="font-mono">.txt</code>)
          </p>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="space-y-3 rounded-xl border border-soc-border bg-soc-panel p-4">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <SearchInput
            label="Search Events"
            value={searchQuery}
            placeholder="IP, user, host, or message…"
            onChange={setSearchQuery}
          />
          <FilterSelect
            label="Severity"
            value={severity}
            options={SEVERITIES}
            onChange={(value) => setSeverity(value as (typeof SEVERITIES)[number])}
          />
          <FilterSelect label="Host" value={hostFilter} options={hosts} onChange={setHostFilter} />
          <FilterSelect
            label="Event Type / Action"
            value={eventTypeFilter}
            options={eventTypes}
            onChange={setEventTypeFilter}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-soc-border/40 pt-2 text-xs text-soc-muted">
          <div className="flex items-center gap-2">
            <span>
              Showing <strong className="text-soc-text font-medium">{filtered.length.toLocaleString()}</strong> of{' '}
              {logs.length.toLocaleString()} events
            </span>
            {isFiltered && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('')
                  setSeverity('all')
                  setHostFilter('all')
                  setEventTypeFilter('all')
                }}
                className="inline-flex items-center gap-1 text-soc-accent hover:underline ml-2"
              >
                <RotateCcw size={12} /> Reset filters
              </button>
            )}
          </div>

          <span className="text-[11px]">
            {uploadedFile ? `Normalized from ${uploadedFile.name}` : 'Displaying Demo SOC Logs'}
          </span>
        </div>
      </div>

      {/* Log Events Table */}
      <Panel title={`Normalized Log Events (${filtered.length.toLocaleString()})`}>
        <LogTable logs={filtered} />
      </Panel>
    </div>
  )
}
