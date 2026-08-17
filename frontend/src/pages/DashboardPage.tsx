import { Link } from 'react-router-dom'
import { Activity, Bell, ShieldAlert, TriangleAlert } from 'lucide-react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { AlertTable } from '../components/AlertTable'
import { IncidentCard } from '../components/IncidentCard'
import { Panel } from '../components/Panel'
import { StatCard } from '../components/StatCard'
import { formatNumber } from '../lib/format'
import {
  ALERTS,
  DASHBOARD_STATS,
  DETECTION_OVERVIEW,
  HOURLY_METRICS,
  INCIDENTS,
} from '../mock/data'

export function DashboardPage() {
  const activeIncidents = INCIDENTS.filter((incident) => incident.status !== 'Resolved')

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Events"
          value={formatNumber(DASHBOARD_STATS.totalEvents)}
          hint="Last 24 hours"
          icon={Activity}
          tone="default"
        />
        <StatCard
          label="Active Alerts"
          value={formatNumber(DASHBOARD_STATS.activeAlerts)}
          hint="Open + acknowledged"
          icon={Bell}
          tone="high"
        />
        <StatCard
          label="Critical Incidents"
          value={formatNumber(DASHBOARD_STATS.criticalIncidents)}
          hint="Requires analyst review"
          icon={ShieldAlert}
          tone="critical"
        />
        <StatCard
          label="Anomalies Detected"
          value={formatNumber(DASHBOARD_STATS.anomaliesDetected)}
          hint="ML anomaly pipeline (mock)"
          icon={TriangleAlert}
          tone="accent"
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <Panel title="Threat Overview" className="xl:col-span-2">
          <p className="mb-4 text-xs text-soc-muted">Security events and anomalies — last 24 hours</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={HOURLY_METRICS}>
                <defs>
                  <linearGradient id="eventsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="anomFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1e2d48" vertical={false} />
                <XAxis dataKey="hour" tick={{ fill: '#8b9bb8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#8b9bb8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: '#111b2e',
                    border: '1px solid #1e2d48',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Area type="monotone" dataKey="events" stroke="#2dd4bf" fill="url(#eventsFill)" strokeWidth={2} />
                <Area type="monotone" dataKey="anomalies" stroke="#f43f5e" fill="url(#anomFill)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Threat Detection Overview">
          <ul className="space-y-3">
            <DetectionRow
              label="Sigma Matches"
              value={DETECTION_OVERVIEW.sigmaMatches}
              hint="Rule engine (mock)"
              to="/sigma"
            />
            <DetectionRow
              label="MITRE ATT&CK Matches"
              value={DETECTION_OVERVIEW.mitreMatches}
              hint="Mapped techniques (mock)"
              to="/mitre"
            />
            <DetectionRow label="ML Anomalies" value={DETECTION_OVERVIEW.mlAnomalies} hint="Unsupervised scores (mock)" />
          </ul>
          <p className="mt-4 text-[11px] leading-5 text-soc-muted">
            Pipeline placeholder: Logs → Parser → Normalization → Sigma → MITRE → ML → Evidence Fusion → LLM → Analyst
          </p>
        </Panel>
      </div>

      <Panel
        title="Recent Alerts"
        action={
          <Link to="/alerts" className="text-xs text-soc-accent hover:underline">
            View all
          </Link>
        }
      >
        <AlertTable alerts={ALERTS.slice(0, 4)} compact />
      </Panel>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-soc-text">Active Incidents</h2>
          <Link to="/incidents" className="text-xs text-soc-accent hover:underline">
            View all
          </Link>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {activeIncidents.map((incident) => (
            <IncidentCard key={incident.id} incident={incident} />
          ))}
        </div>
      </div>
    </div>
  )
}

function DetectionRow({
  label,
  value,
  hint,
  to,
}: {
  label: string
  value: number
  hint: string
  to?: string
}) {
  return (
    <li className="rounded-lg border border-soc-border bg-soc-elevated/40 px-3 py-3">
      <div className="flex items-baseline justify-between">
        {to ? (
          <Link to={to} className="text-sm text-soc-text hover:text-soc-accent">
            {label}
          </Link>
        ) : (
          <p className="text-sm text-soc-text">{label}</p>
        )}
        <p className="font-mono text-lg font-semibold text-soc-accent">{value}</p>
      </div>
      <p className="mt-1 text-[11px] text-soc-muted">{hint}</p>
    </li>
  )
}
