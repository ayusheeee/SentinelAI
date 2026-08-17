import type { ReactNode } from 'react'

type DataStateProps = {
  status: 'loading' | 'error' | 'empty' | 'ready'
  error?: string | null
  emptyMessage?: string
  children: ReactNode
}

export function DataState({
  status,
  error,
  emptyMessage = 'No records match the current filters.',
  children,
}: DataStateProps) {
  if (status === 'loading') {
    return (
      <div className="rounded-xl border border-soc-border bg-soc-panel px-4 py-10 text-center text-sm text-soc-muted">
        Loading catalog…
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="rounded-xl border border-critical/30 bg-critical/10 px-4 py-10 text-center">
        <p className="text-sm font-medium text-critical">Could not load catalog</p>
        <p className="mt-2 text-xs text-soc-muted">{error}</p>
      </div>
    )
  }

  if (status === 'empty') {
    return (
      <div className="rounded-xl border border-soc-border bg-soc-panel px-4 py-10 text-center text-sm text-soc-muted">
        {emptyMessage}
      </div>
    )
  }

  return children
}
