import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

const titles: Record<string, string> = {
  '/': 'Security Operations Center',
  '/alerts': 'Alerts',
  '/incidents': 'Incidents',
  '/logs': 'Logs',
  '/investigations': 'Investigations',
  '/sigma': 'Sigma Rules',
  '/mitre': 'MITRE ATT&CK',
  '/reports': 'Reports',
  '/settings': 'Settings',
}

function resolveTitle(pathname: string) {
  if (pathname.startsWith('/alerts/')) return 'Alert Details'
  if (pathname.startsWith('/investigations/')) return 'Investigation'
  if (pathname.startsWith('/mitre/')) return 'ATT&CK Technique'
  if (pathname.startsWith('/sigma/')) return 'Sigma Rule'
  return titles[pathname] ?? 'SentinelAI'
}

export function AppLayout() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  return (
    <div className="flex min-h-svh bg-soc-bg text-soc-text">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title={resolveTitle(location.pathname)} onMenu={() => setOpen(true)} />
        <main className="flex-1 px-4 py-5 lg:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
