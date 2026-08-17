import type {
  Alert,
  HourlyMetric,
  Incident,
  Investigation,
  LogEvent,
  MitreTechnique,
  Report,
} from '../types'

/*
  Mock data layer — future pipeline (not implemented yet):
  Logs → Parser → Normalization → Sigma Detection → MITRE Mapping
  → ML Anomaly Detection → Evidence Fusion → LLM Investigation → Human Analyst
*/

export const SYSTEM_STATUS = {
  state: 'Online' as const,
  uptime: '14d 06h 22m',
  lastSync: '2026-08-17T10:12:00Z',
}

export const CURRENT_USER = {
  name: 'Alex Chen',
  role: 'SOC Analyst',
  initials: 'AC',
}

export const DASHBOARD_STATS = {
  totalEvents: 18420,
  activeAlerts: 37,
  criticalIncidents: 4,
  anomaliesDetected: 12,
}

export const HOURLY_METRICS: HourlyMetric[] = [
  { hour: '00:00', events: 420, anomalies: 0 },
  { hour: '02:00', events: 310, anomalies: 1 },
  { hour: '04:00', events: 280, anomalies: 0 },
  { hour: '06:00', events: 390, anomalies: 1 },
  { hour: '08:00', events: 860, anomalies: 2 },
  { hour: '10:00', events: 1240, anomalies: 4 },
  { hour: '12:00', events: 980, anomalies: 1 },
  { hour: '14:00', events: 1110, anomalies: 3 },
  { hour: '16:00', events: 1420, anomalies: 5 },
  { hour: '18:00', events: 760, anomalies: 2 },
  { hour: '20:00', events: 540, anomalies: 1 },
  { hour: '22:00', events: 410, anomalies: 0 },
]

export const DETECTION_OVERVIEW = {
  sigmaMatches: 18,
  mitreMatches: 9,
  mlAnomalies: 12,
}

export const ALERTS: Alert[] = [
  {
    id: 'ALT-10482',
    title: 'Multiple Failed Login Attempts',
    severity: 'high',
    source: 'Windows Security',
    host: 'dc-01.corp.local',
    timestamp: '2026-08-17T14:22:11Z',
    status: 'open',
    sourceIp: '185.220.101.44',
    destination: '10.0.4.12',
    user: 'j.miller',
    detectionSource: 'Sigma',
    sigmaRule: 'win_multiple_failed_logons.yml',
    mitreTechnique: 'Brute Force',
    mitreId: 'T1110',
    anomalyScore: 0.81,
    relatedEventIds: ['EVT-90121', 'EVT-90122', 'EVT-90128'],
    description:
      '42 failed authentication attempts against domain controller dc-01 within 8 minutes from a single external IP.',
  },
  {
    id: 'ALT-10479',
    title: 'Suspicious PowerShell Execution',
    severity: 'critical',
    source: 'Sysmon',
    host: 'wkstn-214.corp.local',
    timestamp: '2026-08-17T13:58:03Z',
    status: 'open',
    sourceIp: '10.0.21.84',
    destination: '185.12.44.90',
    user: 'svc.backup',
    detectionSource: 'Sigma',
    sigmaRule: 'proc_creation_susp_powershell_encoded.yml',
    mitreTechnique: 'Command and Scripting Interpreter',
    mitreId: 'T1059.001',
    anomalyScore: 0.94,
    relatedEventIds: ['EVT-89901', 'EVT-89912'],
    description:
      'Encoded PowerShell command spawned from winword.exe with outbound HTTPS to an uncommon ASN.',
  },
  {
    id: 'ALT-10471',
    title: 'Privilege Escalation Attempt',
    severity: 'critical',
    source: 'Windows Security',
    host: 'app-finance-03',
    timestamp: '2026-08-17T12:41:40Z',
    status: 'acknowledged',
    sourceIp: '10.0.18.9',
    destination: '10.0.18.9',
    user: 'r.okonkwo',
    detectionSource: 'MITRE',
    sigmaRule: 'win_priv_escalation_token.yml',
    mitreTechnique: 'Valid Accounts',
    mitreId: 'T1078',
    anomalyScore: 0.88,
    relatedEventIds: ['EVT-88210', 'EVT-88214', 'EVT-88220'],
    description:
      'Local administrator token impersonation detected after a scheduled task modification.',
  },
  {
    id: 'ALT-10466',
    title: 'Unusual Data Transfer',
    severity: 'high',
    source: 'Network IDS',
    host: 'file-gw-02',
    timestamp: '2026-08-17T11:16:27Z',
    status: 'open',
    sourceIp: '10.0.30.15',
    destination: '51.15.123.88:443',
    user: 'n.patel',
    detectionSource: 'ML Anomaly',
    sigmaRule: 'net_large_outbound_transfer.yml',
    mitreTechnique: 'Exfiltration Over Web Service',
    mitreId: 'T1567',
    anomalyScore: 0.91,
    relatedEventIds: ['EVT-87001', 'EVT-87044'],
    description:
      '4.8 GB compressed archive transferred outside business hours to an unsanctioned cloud endpoint.',
  },
  {
    id: 'ALT-10458',
    title: 'Scheduled Task Created on Jump Host',
    severity: 'medium',
    source: 'Sysmon',
    host: 'jump-01.corp.local',
    timestamp: '2026-08-17T09:04:51Z',
    status: 'acknowledged',
    sourceIp: '10.0.2.40',
    destination: '10.0.2.40',
    user: 'admin.ops',
    detectionSource: 'Sigma',
    sigmaRule: 'win_susp_scheduled_task.yml',
    mitreTechnique: 'Scheduled Task/Job',
    mitreId: 'T1053.005',
    anomalyScore: 0.62,
    relatedEventIds: ['EVT-85110'],
    description:
      'New scheduled task "WinUpdateCheck" executing powershell.exe from %TEMP% on a privileged jump host.',
  },
  {
    id: 'ALT-10441',
    title: 'Impossible Travel Sign-in',
    severity: 'medium',
    source: 'Identity Provider',
    host: 'idp.corp.local',
    timestamp: '2026-08-16T22:11:08Z',
    status: 'closed',
    sourceIp: '102.89.23.14',
    destination: 'login.corp.local',
    user: 's.alvarez',
    detectionSource: 'ML Anomaly',
    sigmaRule: 'auth_impossible_travel.yml',
    mitreTechnique: 'Valid Accounts',
    mitreId: 'T1078',
    anomalyScore: 0.73,
    relatedEventIds: ['EVT-80102'],
    description:
      'Successful SSO from Lagos 18 minutes after a VPN session originating in Frankfurt.',
  },
]

export const INCIDENTS: Incident[] = [
  {
    id: 'INC-2044',
    title: 'Potential ransomware precursor on workstation fleet',
    description:
      'Encoded PowerShell, persistence via scheduled task, and unusual outbound C2-like beacons clustered on wkstn-214.',
    severity: 'critical',
    detectionSource: 'Correlation',
    status: 'Investigating',
    time: '2026-08-17T13:59:00Z',
    assignedAnalyst: 'Alex Chen',
  },
  {
    id: 'INC-2041',
    title: 'Credential stuffing against domain controller',
    description:
      'External brute-force campaign targeting privileged accounts on dc-01.corp.local.',
    severity: 'high',
    detectionSource: 'Sigma',
    status: 'New',
    time: '2026-08-17T14:22:11Z',
    assignedAnalyst: 'Unassigned',
  },
  {
    id: 'INC-2037',
    title: 'Possible data exfiltration via HTTPS',
    description:
      'ML model flagged a 4.8 GB transfer from file-gw-02 to an unsanctioned destination.',
    severity: 'high',
    detectionSource: 'ML Anomaly',
    status: 'Investigating',
    time: '2026-08-17T11:16:27Z',
    assignedAnalyst: 'Priya Nair',
  },
  {
    id: 'INC-2029',
    title: 'Privilege escalation on finance application host',
    description:
      'Token impersonation and local admin group modification on app-finance-03.',
    severity: 'critical',
    detectionSource: 'MITRE',
    status: 'New',
    time: '2026-08-17T12:41:40Z',
    assignedAnalyst: 'Jordan Blake',
  },
  {
    id: 'INC-2018',
    title: 'Suspicious scheduled task on jump host',
    description: 'Persistence candidate on jump-01; contained and awaiting verification.',
    severity: 'medium',
    detectionSource: 'Sigma',
    status: 'Resolved',
    time: '2026-08-16T19:20:00Z',
    assignedAnalyst: 'Alex Chen',
  },
]

export const LOGS: LogEvent[] = [
  {
    id: 'EVT-90128',
    timestamp: '2026-08-17T14:22:08Z',
    source: 'Windows Security',
    host: 'dc-01.corp.local',
    user: 'j.miller',
    eventType: '4625',
    message: 'Failed logon — Logon Type 3, Status 0xC000006A (bad password).',
    severity: 'high',
  },
  {
    id: 'EVT-90122',
    timestamp: '2026-08-17T14:21:44Z',
    source: 'Windows Security',
    host: 'dc-01.corp.local',
    user: 'administrator',
    eventType: '4625',
    message: 'Failed logon — Logon Type 3 from 185.220.101.44.',
    severity: 'high',
  },
  {
    id: 'EVT-90121',
    timestamp: '2026-08-17T14:20:02Z',
    source: 'Firewall',
    host: 'edge-fw-01',
    user: '—',
    eventType: 'DENY',
    message: 'Inbound TCP/445 from 185.220.101.44 dropped (geo-block exception review).',
    severity: 'medium',
  },
  {
    id: 'EVT-89912',
    timestamp: '2026-08-17T13:58:03Z',
    source: 'Sysmon',
    host: 'wkstn-214.corp.local',
    user: 'svc.backup',
    eventType: '1',
    message: 'Process create: powershell.exe -enc JABzAD0ATgBlAHcALQBPAGIAagBlAGMAdAA...',
    severity: 'critical',
  },
  {
    id: 'EVT-89901',
    timestamp: '2026-08-17T13:57:41Z',
    source: 'Sysmon',
    host: 'wkstn-214.corp.local',
    user: 'svc.backup',
    eventType: '3',
    message: 'Network connection: wkstn-214 → 185.12.44.90:443 (powershell.exe).',
    severity: 'high',
  },
  {
    id: 'EVT-88220',
    timestamp: '2026-08-17T12:41:40Z',
    source: 'Windows Security',
    host: 'app-finance-03',
    user: 'r.okonkwo',
    eventType: '4672',
    message: 'Special privileges assigned to new logon (SeDebugPrivilege).',
    severity: 'critical',
  },
  {
    id: 'EVT-87044',
    timestamp: '2026-08-17T11:16:27Z',
    source: 'Proxy',
    host: 'file-gw-02',
    user: 'n.patel',
    eventType: 'TRANSFER',
    message: 'PUT /uploads/archive_fin_q3.7z — 4.82 GB — destination 51.15.123.88.',
    severity: 'high',
  },
  {
    id: 'EVT-85110',
    timestamp: '2026-08-17T09:04:51Z',
    source: 'Sysmon',
    host: 'jump-01.corp.local',
    user: 'admin.ops',
    eventType: '1',
    message: 'schtasks.exe /Create /TN WinUpdateCheck /TR powershell.exe /SC HOURLY',
    severity: 'medium',
  },
  {
    id: 'EVT-80102',
    timestamp: '2026-08-16T22:11:08Z',
    source: 'Identity Provider',
    host: 'idp.corp.local',
    user: 's.alvarez',
    eventType: 'SSO',
    message: 'Successful SAML assertion from 102.89.23.14 (NG) after DE VPN session.',
    severity: 'medium',
  },
  {
    id: 'EVT-79011',
    timestamp: '2026-08-16T18:02:33Z',
    source: 'EDR',
    host: 'wkstn-088.corp.local',
    user: 'l.hoffman',
    eventType: 'INFO',
    message: 'Periodic health check — agent online, policy v4.12.',
    severity: 'info',
  },
]

export const MITRE_TECHNIQUES: MitreTechnique[] = [
  {
    id: 'T1110',
    name: 'Brute Force',
    tactic: 'Credential Access',
    severity: 'high',
    relatedIncidents: ['INC-2041'],
    detections: 42,
  },
  {
    id: 'T1059',
    name: 'Command and Scripting Interpreter',
    tactic: 'Execution',
    severity: 'critical',
    relatedIncidents: ['INC-2044'],
    detections: 7,
  },
  {
    id: 'T1078',
    name: 'Valid Accounts',
    tactic: 'Defense Evasion / Persistence',
    severity: 'critical',
    relatedIncidents: ['INC-2029'],
    detections: 5,
  },
  {
    id: 'T1053',
    name: 'Scheduled Task/Job',
    tactic: 'Persistence / Privilege Escalation',
    severity: 'medium',
    relatedIncidents: ['INC-2018', 'INC-2044'],
    detections: 3,
  },
]

export const REPORTS: Report[] = [
  {
    id: 'RPT-088',
    title: 'Weekly SOC Summary — Week 33',
    date: '2026-08-17',
    severity: 'high',
    status: 'Draft',
  },
  {
    id: 'RPT-087',
    title: 'INC-2037 Exfiltration Investigation',
    date: '2026-08-16',
    severity: 'high',
    status: 'Published',
  },
  {
    id: 'RPT-082',
    title: 'Jump Host Persistence — After Action',
    date: '2026-08-14',
    severity: 'medium',
    status: 'Published',
  },
  {
    id: 'RPT-079',
    title: 'Identity Anomalies — July Review',
    date: '2026-08-01',
    severity: 'low',
    status: 'Archived',
  },
]

export const INVESTIGATIONS: Investigation[] = [
  {
    id: 'INV-310',
    incidentId: 'INC-2044',
    title: 'Ransomware precursor — wkstn-214',
    summary:
      'Cluster of execution, persistence, and outbound C2-like activity on a finance workstation. Human-led triage is in progress; automated LLM investigation is not enabled yet.',
    timeline: [
      {
        id: 't1',
        time: '2026-08-17T13:57:41Z',
        title: 'Outbound connection from powershell.exe',
        detail: 'Sysmon Event ID 3 to 185.12.44.90:443',
        severity: 'high',
      },
      {
        id: 't2',
        time: '2026-08-17T13:58:03Z',
        title: 'Encoded PowerShell execution',
        detail: 'Parent process: WINWORD.EXE — Sigma match on encoded command line',
        severity: 'critical',
      },
      {
        id: 't3',
        time: '2026-08-17T14:02:18Z',
        title: 'Scheduled task created',
        detail: 'Task name WinUpdateCheck — possible persistence (T1053)',
        severity: 'medium',
      },
    ],
    evidence: [
      {
        id: 'e1',
        label: 'Process tree',
        value: 'WINWORD.EXE → powershell.exe -enc …',
        source: 'Sysmon',
      },
      {
        id: 'e2',
        label: 'Hash',
        value: 'a4c1…e91b (unknown in internal allowlist)',
        source: 'EDR',
      },
      {
        id: 'e3',
        label: 'Beacon interval',
        value: '~62s jittered HTTPS',
        source: 'Network IDS',
      },
    ],
    sigmaMatches: [
      'proc_creation_susp_powershell_encoded.yml',
      'win_susp_scheduled_task.yml',
    ],
    mitreMappings: [
      { id: 'T1059.001', name: 'PowerShell' },
      { id: 'T1053.005', name: 'Scheduled Task' },
      { id: 'T1071.001', name: 'Web Protocols' },
    ],
    anomalyScore: 0.94,
    recommendedActions: [
      'Isolate wkstn-214 from the corporate network.',
      'Disable svc.backup until credentials are rotated.',
      'Collect memory and prefetch for WINWORD.EXE parent chain.',
      'Block 185.12.44.90/32 at the edge firewall.',
    ],
  },
]

export function getAlertById(id: string) {
  return ALERTS.find((alert) => alert.id === id)
}

export function getLogsByIds(ids: string[]) {
  return LOGS.filter((log) => ids.includes(log.id))
}

export function getInvestigationById(id: string) {
  return INVESTIGATIONS.find((item) => item.id === id)
}

export function getIncidentById(id: string) {
  return INCIDENTS.find((item) => item.id === id)
}
