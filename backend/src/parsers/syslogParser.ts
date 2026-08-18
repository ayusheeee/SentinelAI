import { normalizeEvent } from '../normalizer.ts'
import type { LogParser, NormalizedEvent, ParseResult } from '../types.ts'

// RFC 3164 Syslog: Oct 11 22:14:15 myhost su[123]: 'su root' failed for lonvick on /dev/pts/8
const RFC3164_REGEX = /^([A-Za-z]{3}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2})\s+([a-zA-Z0-9_.-]+)\s+([a-zA-Z0-9_.-]+)(?:\[(\d+)\])?:\s*(.*)$/

// RFC 5424 Syslog: <34>1 2003-10-11T22:14:15.003Z mymachine.example.com su - ID47 - 'su root' failed
const RFC5424_REGEX = /^<(\d+)>(\d+)?\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s*(?:\[[^\]]*\])?\s*(.*)$/

const IPV4_EXTRACT_REGEX = /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g

export const syslogParser: LogParser = {
  name: 'syslog',
  canParse(content: string, _filename: string): boolean {
    const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0).slice(0, 5)
    if (lines.length === 0) return false

    let matches = 0
    for (const line of lines) {
      if (RFC3164_REGEX.test(line) || RFC5424_REGEX.test(line)) {
        matches++
      }
    }
    return matches >= Math.min(2, lines.length)
  },
  parse(content: string, _filename: string): ParseResult {
    const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0)
    const events: NormalizedEvent[] = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      if (!line.trim()) continue

      let timestamp: string | null = null
      let host: string | null = null
      let app: string | null = null
      let message: string | null = null
      let severity: string | null = null

      const rfc5424 = line.match(RFC5424_REGEX)
      if (rfc5424) {
        const pri = Number(rfc5424[1])
        if (!Number.isNaN(pri)) {
          const sevCode = pri % 8
          severity = String(sevCode)
        }
        timestamp = rfc5424[3] !== '-' ? rfc5424[3] : null
        host = rfc5424[4] !== '-' ? rfc5424[4] : null
        app = rfc5424[5] !== '-' ? rfc5424[5] : null
        message = rfc5424[8] || ''
      } else {
        const rfc3164 = line.match(RFC3164_REGEX)
        if (rfc3164) {
          timestamp = rfc3164[1]
          host = rfc3164[2]
          app = rfc3164[3]
          message = rfc3164[5]
        }
      }

      if (!message) {
        message = line
      }

      const record: Record<string, unknown> = {
        timestamp,
        host,
        event_type: app,
        message,
        severity,
      }

      // Extract IPs from message if present
      const ips = message.match(IPV4_EXTRACT_REGEX)
      if (ips && ips.length > 0) {
        record.source_ip = ips[0]
        if (ips.length > 1) {
          record.destination_ip = ips[1]
        }
      }

      // Extract user from common auth messages:
      // "Failed password for [invalid user] root from ..."
      // "Accepted publickey for ubuntu from ..."
      // "user=admin" or "for user root"
      const userMatch =
        message.match(/(?:for\s+(?:invalid\s+user\s+)?|user\s+|user=)([a-zA-Z0-9_.\\-]+)/i)
      if (userMatch && userMatch[1] && !['the', 'a', 'an', 'from', 'port'].includes(userMatch[1].toLowerCase())) {
        record.user = userMatch[1]
      }

      // Extract action/status
      if (/failed|invalid|error|denied|failure|dropped/i.test(message)) {
        record.status = 'failure'
        if (!record.severity) record.severity = 'high'
      } else if (/accepted|success|allowed|connected|session opened/i.test(message)) {
        record.status = 'success'
        if (!record.severity) record.severity = 'low'
      }

      events.push(normalizeEvent(record, events.length, line))
    }

    if (events.length === 0) {
      throw new Error('No valid Syslog entries could be parsed.')
    }

    return {
      format: 'Syslog (RFC 3164 / RFC 5424)',
      events,
      totalLines: lines.length,
      parsedCount: events.length,
    }
  },
}
