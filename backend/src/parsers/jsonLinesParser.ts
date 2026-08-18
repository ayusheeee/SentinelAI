import { normalizeEvent } from '../normalizer.ts'
import type { LogParser, NormalizedEvent, ParseResult } from '../types.ts'

export const jsonLinesParser: LogParser = {
  name: 'json_lines',
  canParse(content: string, _filename: string): boolean {
    const trimmed = content.trim()
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed)
        return Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'object'
      } catch {
        return false
      }
    }

    const firstLine = content.split('\n')[0]?.trim() || ''
    if (firstLine.startsWith('{') && firstLine.endsWith('}')) {
      try {
        const parsed = JSON.parse(firstLine)
        return typeof parsed === 'object' && parsed !== null
      } catch {
        return false
      }
    }
    return false
  },
  parse(content: string, _filename: string): ParseResult {
    const trimmed = content.trim()
    const events: NormalizedEvent[] = []

    // Check if it's a JSON array
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const array = JSON.parse(trimmed) as Array<Record<string, unknown>>
        for (const item of array) {
          if (item && typeof item === 'object') {
            events.push(normalizeEvent(item, events.length, JSON.stringify(item)))
          }
        }
        return {
          format: 'JSON Array',
          events,
          totalLines: array.length,
          parsedCount: events.length,
        }
      } catch {
        // Fall back to line by line
      }
    }

    // Newline-delimited JSON
    const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0)
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      if (!line.trim()) continue
      try {
        const parsed = JSON.parse(line) as Record<string, unknown>
        if (parsed && typeof parsed === 'object') {
          events.push(normalizeEvent(parsed, events.length, line))
        }
      } catch {
        // Skip unparseable JSON lines or handle partially
      }
    }

    if (events.length === 0) {
      throw new Error('No valid JSON objects could be parsed.')
    }

    return {
      format: 'JSON Lines (NDJSON)',
      events,
      totalLines: lines.length,
      parsedCount: events.length,
    }
  },
}
