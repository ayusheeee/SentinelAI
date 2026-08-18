import { normalizeEvent } from '../normalizer.ts'
import type { LogParser, NormalizedEvent, ParseResult } from '../types.ts'

const IPV4_REGEX = /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g
const ISO_TIMESTAMP_REGEX = /\b\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?\b/
const BSD_TIMESTAMP_REGEX = /\b[A-Za-z]{3}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2}\b/
const SEVERITY_WORD_REGEX = /\b(CRITICAL|FATAL|ALERT|EMERGENCY|ERROR|HIGH|WARNING|WARN|MEDIUM|NOTICE|INFO|DEBUG|LOW)\b/i

export const plainTextParser: LogParser = {
  name: 'plain_text',
  canParse(_content: string, _filename: string): boolean {
    return true // Fallback parser
  },
  parse(content: string, _filename: string): ParseResult {
    const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0)
    if (lines.length === 0) {
      throw new Error('Log file is empty.')
    }

    const events: NormalizedEvent[] = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      if (!line.trim()) continue

      const record: Record<string, unknown> = {
        message: line,
      }

      // 1. Extract timestamp
      const isoMatch = line.match(ISO_TIMESTAMP_REGEX)
      if (isoMatch) {
        record.timestamp = isoMatch[0]
      } else {
        const bsdMatch = line.match(BSD_TIMESTAMP_REGEX)
        if (bsdMatch) {
          record.timestamp = bsdMatch[0]
        }
      }

      // 2. Extract severity
      const sevMatch = line.match(SEVERITY_WORD_REGEX)
      if (sevMatch) {
        record.severity = sevMatch[1]
      }

      // 3. Extract IP addresses
      const ips = line.match(IPV4_REGEX)
      if (ips && ips.length > 0) {
        record.source_ip = ips[0]
        if (ips.length > 1) {
          record.destination_ip = ips[1]
        }
      }

      // 4. Extract user
      const userMatch = line.match(/\b(?:user|account|identity)[=:\s]+([a-zA-Z0-9_.\\-]+)/i)
      if (userMatch && userMatch[1]) {
        record.user = userMatch[1]
      }

      // 5. Extract host / device
      const hostMatch = line.match(/\b(?:host|hostname|device|computer)[=:\s]+([a-zA-Z0-9_.-]+)/i)
      if (hostMatch && hostMatch[1]) {
        record.host = hostMatch[1]
      }

      // 6. Action / status
      if (/\b(?:denied|blocked|dropped|failed|rejected|failure)\b/i.test(line)) {
        record.status = 'failure'
        record.action = 'block'
      } else if (/\b(?:allowed|permitted|accepted|success|successful)\b/i.test(line)) {
        record.status = 'success'
        record.action = 'allow'
      }

      // 7. Event type
      const eventTypeMatch = line.match(/\b(?:event_type|event_id|eventType|type|op_code)[=:\s]+([a-zA-Z0-9_.-]+)/i)
      if (eventTypeMatch && eventTypeMatch[1]) {
        record.event_type = eventTypeMatch[1]
      }

      events.push(normalizeEvent(record, events.length, line))
    }

    return {
      format: 'Plain Text Log (Heuristic)',
      events,
      totalLines: lines.length,
      parsedCount: events.length,
    }
  },
}
