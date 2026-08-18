import type { NormalizedEvent, Severity } from './types'

const SOURCE_IP_ALIASES = [
  'source_ip',
  'sourceip',
  'src_ip',
  'srcip',
  'src',
  'source',
  'source_address',
  'sourceaddress',
  'src_addr',
  'srcaddr',
  'client_ip',
  'clientip',
  'c_ip',
  'c-ip',
  's_ip',
  's-ip',
  'src_host',
  'origin_ip',
  'remote_ip',
]

const DEST_IP_ALIASES = [
  'destination_ip',
  'destinationip',
  'dest_ip',
  'destip',
  'dst_ip',
  'dstip',
  'dst',
  'dest',
  'destination',
  'destination_address',
  'destinationaddress',
  'dest_address',
  'dst_addr',
  'server_ip',
  'serverip',
  'target_ip',
  'targetip',
  'd_ip',
  'd-ip',
]

const USER_ALIASES = [
  'user',
  'username',
  'user_name',
  'account',
  'account_name',
  'usr',
  'user_id',
  'userid',
  'target_user',
  'src_user',
  'dst_user',
  'subject_user',
  'subjectusername',
  'targetusername',
  'identity',
  'logon_user',
]

const HOST_ALIASES = [
  'host',
  'hostname',
  'computer_name',
  'computername',
  'device_name',
  'devicename',
  'dhost',
  'shost',
  'server',
  'workstation',
  'endpoint',
  'system',
  'node',
  'machine',
]

const EVENT_TYPE_ALIASES = [
  'event_type',
  'eventtype',
  'event_id',
  'eventid',
  'signature_id',
  'signatureid',
  'type',
  'action_type',
  'category',
  'cat',
  'code',
  'id',
  'op_code',
  'opcode',
]

const ACTION_ALIASES = [
  'action',
  'act',
  'activity',
  'operation',
  'decision',
  'command',
  'method',
  'verb',
]

const STATUS_ALIASES = [
  'status',
  'result',
  'outcome',
  'response_code',
  'status_code',
  'state',
  'disposition',
]

const MESSAGE_ALIASES = [
  'message',
  'msg',
  'details',
  'description',
  'desc',
  'log_message',
  'payload',
  'info',
  'text',
  'summary',
]

const SEVERITY_ALIASES = [
  'severity',
  'level',
  'priority',
  'sev',
  'log_level',
  'loglevel',
  'threat_level',
]

const TIMESTAMP_ALIASES = [
  'timestamp',
  '@timestamp',
  'time',
  'datetime',
  'date_time',
  'date',
  'event_time',
  'eventtime',
  'log_time',
  'logtime',
  'created_at',
  'syslog_time',
]

const IPV4_REGEX = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
const IPV6_REGEX = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/

function cleanString(val: unknown): string | null {
  if (val == null) return null
  const s = String(val).trim()
  if (!s || s === '-' || s === 'null' || s === 'undefined' || s === 'N/A' || s === 'none') {
    return null
  }
  return s
}

function cleanIp(val: unknown): string | null {
  const s = cleanString(val)
  if (!s) return null
  // Strip port if present (e.g. 192.168.1.1:8080)
  const ipOnly = s.includes(':') && !s.includes('::') && s.split(':').length === 2 ? s.split(':')[0] : s
  if (IPV4_REGEX.test(ipOnly) || IPV6_REGEX.test(ipOnly)) {
    return ipOnly
  }
  return s
}

export function normalizeSeverity(val: unknown): Severity | null {
  const s = cleanString(val)?.toLowerCase()
  if (!s) return null

  if (s === 'critical' || s === 'crit' || s === 'fatal' || s === 'emergency' || s === 'emerg' || s === 'alert' || s === '0' || s === '1' || s === '5') {
    if (s === '0' || s === '1') return 'critical' // Syslog 0 = Emergency, 1 = Alert
    return 'critical'
  }
  if (s === 'high' || s === 'error' || s === 'err' || s === '2' || s === '3' || s === '4') {
    return 'high'
  }
  if (s === 'medium' || s === 'med' || s === 'warning' || s === 'warn' || s === '4' || s === '3') {
    return 'medium'
  }
  if (s === 'low' || s === 'notice' || s === '5' || s === '2') {
    return 'low'
  }
  if (s === 'info' || s === 'informational' || s === 'debug' || s === 'trace' || s === '6' || s === '7' || s === '1') {
    return 'info'
  }

  const num = Number(s)
  if (!Number.isNaN(num)) {
    if (num >= 8) return 'critical'
    if (num >= 6) return 'high'
    if (num >= 4) return 'medium'
    if (num >= 2) return 'low'
    return 'info'
  }

  return null
}

export function normalizeTimestamp(val: unknown): string | null {
  const s = cleanString(val)
  if (!s) return null

  // 1. Check if it is a numeric epoch timestamp (seconds or ms)
  if (/^\d{10,13}$/.test(s)) {
    const num = Number(s)
    const d = new Date(num > 1e11 ? num : num * 1000)
    if (!Number.isNaN(d.getTime())) return d.toISOString()
  }

  // 2. Syslog BSD timestamp like "Aug 18 10:14:02" or "Aug  8 10:14:02"
  const syslogMatch = s.match(/^([A-Za-z]{3})\s+(\d{1,2})\s+(\d{2}):(\d{2}):(\d{2})$/)
  if (syslogMatch) {
    const currentYear = new Date().getFullYear()
    const parsed = new Date(`${syslogMatch[1]} ${syslogMatch[2]} ${currentYear} ${syslogMatch[3]}:${syslogMatch[4]}:${syslogMatch[5]} UTC`)
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString()
  }

  // 3. Standard ISO-8601 or Date parsing
  const d = new Date(s)
  if (!Number.isNaN(d.getTime())) {
    const year = d.getFullYear()
    if (year >= 1990 && year <= 2100) {
      return d.toISOString()
    }
  }

  return s
}

function findValue(record: Record<string, unknown>, aliases: string[]): unknown {
  const keys = Object.keys(record)
  const normalizedKeyMap = new Map<string, string>()
  for (const k of keys) {
    normalizedKeyMap.set(k.toLowerCase().replace(/[^a-z0-9]/g, ''), k)
  }

  for (const alias of aliases) {
    const cleanedAlias = alias.toLowerCase().replace(/[^a-z0-9]/g, '')
    const originalKey = normalizedKeyMap.get(cleanedAlias)
    if (originalKey && record[originalKey] != null && String(record[originalKey]).trim() !== '') {
      return record[originalKey]
    }
  }
  return null
}

export function normalizeEvent(
  record: Record<string, unknown>,
  index: number,
  rawText?: string
): NormalizedEvent {
  const id = `EVT-${(index + 1).toString().padStart(4, '0')}`

  const rawTimestamp = findValue(record, TIMESTAMP_ALIASES)
  const rawSourceIp = findValue(record, SOURCE_IP_ALIASES)
  const rawDestIp = findValue(record, DEST_IP_ALIASES)
  const rawUser = findValue(record, USER_ALIASES)
  const rawHost = findValue(record, HOST_ALIASES)
  const rawEventType = findValue(record, EVENT_TYPE_ALIASES)
  const rawAction = findValue(record, ACTION_ALIASES)
  const rawStatus = findValue(record, STATUS_ALIASES)
  const rawMessage = findValue(record, MESSAGE_ALIASES)
  const rawSeverity = findValue(record, SEVERITY_ALIASES)

  return {
    id,
    timestamp: normalizeTimestamp(rawTimestamp),
    source_ip: cleanIp(rawSourceIp),
    destination_ip: cleanIp(rawDestIp),
    user: cleanString(rawUser),
    host: cleanString(rawHost),
    event_type: cleanString(rawEventType),
    action: cleanString(rawAction),
    status: cleanString(rawStatus),
    message: cleanString(rawMessage) ?? (rawText ? cleanString(rawText) : null),
    severity: normalizeSeverity(rawSeverity),
    raw: rawText || (typeof rawMessage === 'string' ? rawMessage : undefined),
  }
}
