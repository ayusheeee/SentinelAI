export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info'

export interface NormalizedEvent {
  id: string
  timestamp: string | null
  source_ip: string | null
  destination_ip: string | null
  user: string | null
  host: string | null
  event_type: string | null
  action: string | null
  status: string | null
  message: string | null
  severity: Severity | null
  raw?: string
}

export interface ParseResult {
  format: string
  events: NormalizedEvent[]
  totalLines?: number
  parsedCount?: number
}

export interface LogParser {
  name: string
  canParse(content: string, filename: string): boolean
  parse(content: string, filename: string): Promise<ParseResult> | ParseResult
}
