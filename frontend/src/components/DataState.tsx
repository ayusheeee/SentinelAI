import type { ReactNode } from 'react'
import { AlertCircle, FileSearch, Loader2 } from 'lucide-react'

type DataStateProps = {
  status: 'loading' | 'error' | 'empty' | 'ready'
  error?: string | null
  emptyMessage?: string
  children: ReactNode
}

export function DataState({
  status,
  error,
  emptyMessage = 'No records match the current search or filters.',
  children,
}: DataStateProps) {
  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-soc-border bg-soc-panel/60 px-4 py-16 text-center">
        <Loader2 size={24} className="animate-spin text-soc-accent mb-3" />
        <p className="text-sm font-medium text-soc-text">Loading catalog dataset…</p>
        <p className="mt-1 text-xs text-soc-muted">Parsing local Enterprise ATT&CK and SigmaHQ definitions</p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-critical/30 bg-critical/10 px-4 py-12 text-center">
        <AlertCircle size={28} className="text-critical mb-2" />
        <p className="text-sm font-semibold text-critical">Could not load catalog dataset</p>
        <p className="mt-1.5 max-w-md text-xs text-soc-muted leading-relaxed">{error}</p>
        <p className="mt-3 text-[11px] text-soc-muted/80">
          Tip: Ensure <code className="bg-soc-surface px-1 py-0.5 rounded text-soc-text">npm run ingest:detection-data</code> has generated the local datasets in <code className="bg-soc-surface px-1 py-0.5 rounded text-soc-text">public/data/</code>.
        </p>
      </div>
    )
  }

  if (status === 'empty') {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-soc-border bg-soc-panel/60 px-4 py-14 text-center">
        <FileSearch size={28} className="text-soc-muted/40 mb-2.5" />
        <p className="text-sm font-medium text-soc-text">No records found</p>
        <p className="mt-1 max-w-md text-xs text-soc-muted leading-relaxed">{emptyMessage}</p>
      </div>
    )
  }

  return children
}
