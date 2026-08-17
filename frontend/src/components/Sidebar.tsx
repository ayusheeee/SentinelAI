import { NavLink } from 'react-router-dom'
import {
  Activity,
  Bell,
  FileBarChart,
  FileCode,
  FolderSearch,
  LayoutDashboard,
  ScrollText,
  Settings,
  Shield,
  ShieldAlert,
  Target,
} from 'lucide-react'
import { CURRENT_USER, SYSTEM_STATUS } from '../mock/data'

const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/alerts', label: 'Alerts', icon: Bell, end: false },
  { to: '/incidents', label: 'Incidents', icon: ShieldAlert, end: false },
  { to: '/logs', label: 'Logs', icon: ScrollText, end: false },
  { to: '/investigations', label: 'Investigations', icon: FolderSearch, end: false },
  { to: '/sigma', label: 'Sigma', icon: FileCode, end: false },
  { to: '/mitre', label: 'MITRE ATT&CK', icon: Target, end: false },
  { to: '/reports', label: 'Reports', icon: FileBarChart, end: false },
  { to: '/settings', label: 'Settings', icon: Settings, end: false },
]

type SidebarProps = {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          aria-label="Close navigation"
          onClick={onClose}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-soc-border bg-soc-surface transition-transform lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-3 border-b border-soc-border px-5 py-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-soc-accent-dim text-soc-accent">
            <Shield size={18} />
          </span>
          <div>
            <p className="text-sm font-semibold tracking-wide text-soc-text">SentinelAI</p>
            <p className="text-[11px] text-soc-muted">SOC Platform</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {nav.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${
                    isActive
                      ? 'bg-soc-accent-dim text-soc-accent'
                      : 'text-soc-muted hover:bg-soc-elevated hover:text-soc-text'
                  }`
                }
              >
                <Icon size={16} strokeWidth={1.75} />
                {item.label}
              </NavLink>
            )
          })}
        </nav>

        <div className="border-t border-soc-border p-4">
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-soc-border bg-soc-panel px-3 py-2">
            <Activity size={14} className="text-low" />
            <div>
              <p className="text-[11px] uppercase tracking-wider text-soc-muted">System status</p>
              <p className="text-xs font-medium text-low">{SYSTEM_STATUS.state}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-soc-elevated text-xs font-semibold text-soc-accent">
              {CURRENT_USER.initials}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm text-soc-text">{CURRENT_USER.name}</p>
              <p className="truncate text-[11px] text-soc-muted">{CURRENT_USER.role}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
