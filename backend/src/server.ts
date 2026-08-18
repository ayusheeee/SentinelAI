import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { parseLogContent } from './parsers/index.ts'

const PORT = Number(process.env.PORT) || 3001
const MAX_UPLOAD_BYTES = 50 * 1024 * 1024 // 50MB
const ALLOWED_EXTENSIONS = ['.csv', '.log', '.txt']

function setCorsHeaders(res: ServerResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept')
}

function sendJson(res: ServerResponse, status: number, data: unknown) {
  setCorsHeaders(res)
  res.writeHead(status, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(data))
}

function sendError(res: ServerResponse, status: number, message: string) {
  sendJson(res, status, { success: false, error: message })
}

/**
 * Extracts file buffer and filename from a multipart/form-data payload or raw body.
 */
function parseMultipartBuffer(
  buffer: Buffer,
  boundary: string
): { filename: string; content: string } | null {
  const boundaryBuffer = Buffer.from(`--${boundary}`)
  let start = buffer.indexOf(boundaryBuffer)

  while (start !== -1) {
    const nextStart = buffer.indexOf(boundaryBuffer, start + boundaryBuffer.length)
    const partBuffer = nextStart !== -1 ? buffer.slice(start, nextStart) : buffer.slice(start)

    const headerEnd = partBuffer.indexOf('\r\n\r\n')
    if (headerEnd !== -1) {
      const headersText = partBuffer.slice(0, headerEnd).toString('latin1')
      const filenameMatch = headersText.match(/filename="([^"]+)"|filename='([^']+)'|filename=([^\r\n;]+)/i)
      if (filenameMatch) {
        const rawFilename = filenameMatch[1] ?? filenameMatch[2] ?? filenameMatch[3] ?? 'uploaded.log'
        const filename = rawFilename.trim()
        let bodyBuffer = partBuffer.slice(headerEnd + 4)
        // Trim trailing \r\n
        if (bodyBuffer.length >= 2 && bodyBuffer[bodyBuffer.length - 2] === 13 && bodyBuffer[bodyBuffer.length - 1] === 10) {
          bodyBuffer = bodyBuffer.slice(0, bodyBuffer.length - 2)
        }
        return {
          filename,
          content: bodyBuffer.toString('utf8'),
        }
      }
    }

    start = nextStart
  }

  return null
}

async function handleUpload(req: IncomingMessage, res: ServerResponse) {
  const contentType = req.headers['content-type'] || ''
  const chunks: Buffer[] = []
  let totalBytes = 0

  req.on('data', (chunk: Buffer) => {
    totalBytes += chunk.length
    if (totalBytes > MAX_UPLOAD_BYTES) {
      req.destroy(new Error('File size exceeds 50MB limit.'))
      return
    }
    chunks.push(chunk)
  })

  req.on('end', () => {
    const rawBuffer = Buffer.concat(chunks)
    let filename = 'uploaded.log'
    let content = ''

    if (contentType.includes('multipart/form-data')) {
      const boundaryMatch = contentType.match(/boundary=([^;]+)/i)
      if (!boundaryMatch) {
        sendError(res, 400, 'Invalid multipart request: missing boundary.')
        return
      }
      const boundary = boundaryMatch[1].trim().replace(/^["']|["']$/g, '')
      const extracted = parseMultipartBuffer(rawBuffer, boundary)
      if (!extracted) {
        sendError(res, 400, 'No file found in the uploaded form data.')
        return
      }
      filename = extracted.filename
      content = extracted.content
    } else if (contentType.includes('text/plain') || contentType.includes('text/csv')) {
      content = rawBuffer.toString('utf8')
      const headerFilename = req.headers['x-filename']
      if (typeof headerFilename === 'string') {
        filename = headerFilename
      }
    } else {
      // Try to parse as raw text fallback
      content = rawBuffer.toString('utf8')
    }

    // Validate file extension
    const ext = `.${filename.split('.').pop()?.toLowerCase()}`
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      sendError(
        res,
        400,
        `Unsupported file type "${ext}". Supported log extensions are: ${ALLOWED_EXTENSIONS.join(', ')}.`
      )
      return
    }

    if (!content.trim()) {
      sendError(res, 400, `The uploaded file "${filename}" is empty.`)
      return
    }

    try {
      const parsed = parseLogContent(content, filename)
      sendJson(res, 200, {
        success: true,
        filename,
        format: parsed.format,
        total_events: parsed.events.length,
        events: parsed.events,
      })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to parse log file.'
      sendError(res, 422, `Log parsing failed: ${msg}`)
    }
  })

  req.on('error', (err) => {
    sendError(res, 500, `Upload error: ${err.message}`)
  })
}

export function startServer(port = PORT) {
  const server = createServer((req, res) => {
    setCorsHeaders(res)

    if (req.method === 'OPTIONS') {
      res.writeHead(204)
      res.end()
      return
    }

    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`)

    if (req.method === 'GET' && url.pathname === '/api/health') {
      sendJson(res, 200, { status: 'ok', service: 'SentinelAI Log Engine' })
      return
    }

    if (req.method === 'POST' && url.pathname === '/api/logs/upload') {
      handleUpload(req, res)
      return
    }

    sendJson(res, 404, { success: false, error: 'Endpoint not found.' })
  })

  server.listen(port, () => {
    console.log(`[SentinelAI Backend] Log Parsing API running on http://localhost:${port}`)
  })

  return server
}

// Auto-run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer()
}
