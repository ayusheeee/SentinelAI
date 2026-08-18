import type { LogParser, ParseResult } from '../types.ts'
import { csvParser } from './csvParser.ts'
import { jsonLinesParser } from './jsonLinesParser.ts'
import { keyValueParser } from './keyValueParser.ts'
import { plainTextParser } from './plainTextParser.ts'
import { syslogParser } from './syslogParser.ts'

// Ordered by specificity (most specific first, fallback last)
const PARSERS: LogParser[] = [
  csvParser,
  jsonLinesParser,
  keyValueParser,
  syslogParser,
  plainTextParser,
]

export function parseLogContent(content: string, filename: string): ParseResult {
  if (!content || !content.trim()) {
    throw new Error('Uploaded log file is empty.')
  }

  // Detect and run the first matching parser
  for (const parser of PARSERS) {
    if (parser.canParse(content, filename)) {
      try {
        const result = parser.parse(content, filename)
        if (result.events.length > 0) {
          return result
        }
      } catch (err: unknown) {
        // If specific parser fails, continue to fallback parsers unless it's CSV format
        if (parser.name === 'csv' && filename.toLowerCase().endsWith('.csv')) {
          throw err
        }
      }
    }
  }

  // Fallback to plain text parser
  return plainTextParser.parse(content, filename)
}
