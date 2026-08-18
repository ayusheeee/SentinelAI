import { normalizeEvent } from '../normalizer.ts'
import type { LogParser, NormalizedEvent, ParseResult } from '../types.ts'

function parseCsvLine(line: string, delimiter = ','): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  result.push(current.trim())
  return result
}

export const csvParser: LogParser = {
  name: 'csv',
  canParse(content: string, filename: string): boolean {
    if (filename.toLowerCase().endsWith('.csv')) return true
    const firstLine = content.split('\n')[0] || ''
    return firstLine.includes(',') && firstLine.split(',').length >= 3
  },
  parse(content: string, _filename: string): ParseResult {
    const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0)
    if (lines.length === 0) {
      throw new Error('CSV file is empty.')
    }

    // Determine delimiter (comma, semicolon, or tab)
    const firstLine = lines[0]
    let delimiter = ','
    if (firstLine.includes(';') && firstLine.split(';').length > firstLine.split(',').length) {
      delimiter = ';'
    } else if (firstLine.includes('\t') && firstLine.split('\t').length > firstLine.split(',').length) {
      delimiter = '\t'
    }

    const headers = parseCsvLine(firstLine, delimiter).map((h) => h.replace(/^["']|["']$/g, '').trim())
    if (headers.length < 2) {
      throw new Error('CSV file does not contain valid column headers.')
    }

    const events: NormalizedEvent[] = []

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]
      if (!line.trim()) continue
      const values = parseCsvLine(line, delimiter).map((v) => v.replace(/^["']|["']$/g, '').trim())
      const record: Record<string, unknown> = {}

      for (let j = 0; j < headers.length; j++) {
        const header = headers[j]
        const val = values[j] !== undefined ? values[j] : null
        record[header] = val
      }

      events.push(normalizeEvent(record, events.length, line))
    }

    return {
      format: 'CSV (Comma Separated Values)',
      events,
      totalLines: lines.length - 1,
      parsedCount: events.length,
    }
  },
}
