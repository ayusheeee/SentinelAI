import type { ReactNode } from 'react'

type PanelProps = {
  title: string
  action?: ReactNode
  children: ReactNode
  className?: string
}

export function Panel({ title, action, children, className = '' }: PanelProps) {
  return (
    <section className={`rounded-xl border border-soc-border bg-soc-panel ${className}`}>
      <header className="flex items-center justify-between gap-3 border-b border-soc-border px-4 py-3">
        <h2 className="text-sm font-semibold text-soc-text">{title}</h2>
        {action}
      </header>
      <div className="p-4">{children}</div>
    </section>
  )
}
