import { Bell, Menu, Search } from 'lucide-react'
import { SYSTEM_STATUS } from '../mock/data'

type TopbarProps = {
  title: string
  onMenu: () => void
}

export function Topbar({ title, onMenu }: TopbarProps) {
  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-soc-border bg-soc-bg/90 px-4 py-3 backdrop-blur lg:px-6">
      <button
        type="button"
        className="rounded-lg border border-soc-border p-2 text-soc-muted lg:hidden"
        onClick={onMenu}
        aria-label="Open navigation"
      >
        <Menu size={18} />
      </button>

      <div className="min-w-0 flex-1">
        <p className="text-[11px] uppercase tracking-wider text-soc-muted">SentinelAI</p>
        <h1 className="truncate text-base font-semibold text-soc-text lg:text-lg">{title}</h1>
      </div>

      <label className="relative hidden min-w-[220px] max-w-sm flex-1 md:block">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-soc-muted" />
        <input
          type="search"
          placeholder="Search alerts, hosts, users…"
          className="w-full rounded-lg border border-soc-border bg-soc-panel py-2 pr-3 pl-9 text-sm text-soc-text outline-none placeholder:text-soc-muted focus:border-soc-accent"
        />
      </label>

      <button
        type="button"
        className="relative rounded-lg border border-soc-border p-2 text-soc-muted hover:text-soc-text"
        aria-label="Notifications"
      >
        <Bell size={16} />
        <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-critical" />
      </button>

      <div className="hidden items-center gap-2 rounded-lg border border-soc-border bg-soc-panel px-3 py-1.5 sm:flex">
        <span className="h-1.5 w-1.5 rounded-full bg-low" />
        <span className="text-xs text-soc-muted">Status</span>
        <span className="text-xs font-medium text-low">{SYSTEM_STATUS.state}</span>
      </div>
    </header>
  )
}
