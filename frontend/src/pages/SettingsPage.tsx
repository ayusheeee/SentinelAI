import { Panel } from '../components/Panel'
import { CURRENT_USER, SYSTEM_STATUS } from '../mock/data'

export function SettingsPage() {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Panel title="Workspace">
        <dl className="space-y-3 text-sm">
          <Row label="Platform" value="SentinelAI SOC (demo)" />
          <Row label="Environment" value="Mock data — no backend connected" />
          <Row label="System status" value={SYSTEM_STATUS.state} />
          <Row label="Uptime" value={SYSTEM_STATUS.uptime} />
        </dl>
      </Panel>
      <Panel title="Analyst profile">
        <dl className="space-y-3 text-sm">
          <Row label="Name" value={CURRENT_USER.name} />
          <Row label="Role" value={CURRENT_USER.role} />
          <Row label="Authentication" value="Not implemented" />
        </dl>
      </Panel>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-soc-border/70 pb-2">
      <dt className="text-soc-muted">{label}</dt>
      <dd className="text-right text-soc-text">{value}</dd>
    </div>
  )
}
