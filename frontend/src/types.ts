export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info'

export type AlertStatus = 'open' | 'acknowledged' | 'closed'
export type IncidentStatus = 'New' | 'Investigating' | 'Resolved'
export type DetectionSource = 'Sigma' | 'MITRE' | 'ML Anomaly' | 'Correlation'

export type Alert = {
  id: string
  title: string
  severity: Severity
  source: string
  host: string
  timestamp: string
  status: AlertStatus
  sourceIp: string
  destination: string
  user: string
  detectionSource: DetectionSource
  sigmaRule: string
  mitreTechnique: string
  mitreId: string
  anomalyScore: number
  relatedEventIds: string[]
  description: string
}

export type Incident = {
  id: string
  title: string
  description: string
  severity: Severity
  detectionSource: DetectionSource
  status: IncidentStatus
  time: string
  assignedAnalyst: string
}

export type LogEvent = {
  id: string
  timestamp: string | null
  source_ip?: string | null
  destination_ip?: string | null
  user: string | null
  host: string | null
  event_type?: string | null
  eventType?: string
  action?: string | null
  status?: string | null
  message: string | null
  severity: Severity | null
  source?: string
  raw?: string
}

export type LogUploadResponse = {
  success: boolean
  filename?: string
  format?: string
  total_events?: number
  events?: LogEvent[]
  error?: string
}

export type TimelineEvent = {
  id: string
  time: string
  title: string
  detail: string
  severity: Severity
}

export type EvidenceItem = {
  id: string
  label: string
  value: string
  source: string
}

export type Investigation = {
  id: string
  incidentId: string
  title: string
  summary: string
  timeline: TimelineEvent[]
  evidence: EvidenceItem[]
  sigmaMatches: string[]
  mitreMappings: { id: string; name: string }[]
  anomalyScore: number
  recommendedActions: string[]
}

export type MitreTechnique = {
  id: string
  name: string
  tactic: string
  severity: Severity
  relatedIncidents: string[]
  detections: number
}

export type Report = {
  id: string
  title: string
  date: string
  severity: Severity
  status: 'Draft' | 'Published' | 'Archived'
}

export type HourlyMetric = {
  hour: string
  events: number
  anomalies: number
}
