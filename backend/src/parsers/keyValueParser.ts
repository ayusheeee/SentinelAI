import { normalizeEvent } from '../normalizer.ts'
import type { LogParser, NormalizedEvent, ParseResult } from '../types.ts'

function extractKeyValuePairs(text: string): Record<string, string> {
  const result: Record<string, string> = {}
  // Matches key=value where value can be quoted or unquoted
  const kvRegex = /([a-zA-Z0-9_.-]+)=(?:"([^"]*)"|'([^']*)'|(\S+))/g
  let match: RegExpExecArray | null

  while ((match = kvRegex.exec(text)) !== null) {
    const key = match[1]
    const value = match[2] ?? match[3] ?? match[4] ?? ''
    result[key] = value
  }

  return result
}

function parseCefLine(line: string): Record<string, unknown> | null {
  if (!line.includes('CEF:')) return null
  const cefIndex = line.indexOf('CEF:')
  const cefPart = line.slice(cefIndex + 4)
  const parts = cefPart.split('|')

  if (parts.length < 7) return null

  const record: Record<string, unknown> = {
    cef_version: parts[0],
    device_vendor: parts[1],
    device_product: parts[2],
    device_version: parts[3],
    signature_id: parts[4],
    event_type: parts[5] || parts[4],
    severity: parts[6],
  }

  // Prefix before CEF might contain timestamp and host
  const prefix = line.slice(0, cefIndex).trim()
  if (prefix) {
    const prefixTokens = prefix.split(/\s+/)
    if (prefixTokens.length >= 3) {
      // Possible Syslog prefix: MMM DD HH:MM:SS host
      record.timestamp = `${prefixTokens[0]} ${prefixTokens[1]} ${prefixTokens[2]}`
      if (prefixTokens[3]) record.host = prefixTokens[3]
    }
  }

  // Extension part
  const extensionStr = parts.slice(7).join('|')
  const extPairs = extractKeyValuePairs(extensionStr)
  Object.assign(record, extPairs)

  return record
}

export const keyValueParser: LogParser = {
  name: 'key_value',
  canParse(content: string, _filename: string): boolean {
    const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0).slice(0, 5)
    if (lines.length === 0) return false

    let kvMatches = 0
    for (const line of lines) {
      if (line.includes('CEF:')) return true
      const pairs = extractKeyValuePairs(line)
      if (Object.keys(pairs).length >= 3) kvMatches++
    }
    return kvMatches >= Math.min(2, lines.length)
  },
  parse(content: string, _filename: string): ParseResult {
    const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0)
    const events: NormalizedEvent[] = []
    let isCef = false

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      if (!line.trim()) continue

      const cefRecord = parseCefLine(line)
      if (cefRecord) {
        isCef = true
        events.push(normalizeEvent(cefRecord, events.length, line))
        continue
      }

      const pairs = extractKeyValuePairs(line)
      if (Object.keys(pairs).length > 0) {
        // Also see if there is leading text before first kv pair (often timestamp and host)
        const firstEqual = line.indexOf('=')
        if (firstEqual > 0) {
          const beforeFirst = line.slice(0, firstEqual).trim()
          const words = beforeFirst.split(/\s+/)
          if (words.length > 1) {
            const possibleHost = words[words.length - 2]
            if (possibleHost && !possibleHost.includes('=')) {
              if (!pairs.host) pairs.host = possibleHost
            }
          }
        }
        events.push(normalizeEvent(pairs, events.length, line))
      }
    }

    if (events.length === 0) {
      throw new Error('No valid key-value log entries could be extracted.')
    }

    return {
      format: isCef ? 'CEF (Common Event Format)' : 'Key-Value Security Log',
      events,
      totalLines: lines.length,
      parsedCount: events.length,
    }
  },
}
