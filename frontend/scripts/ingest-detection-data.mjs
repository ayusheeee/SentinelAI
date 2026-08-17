/**
 * Downloads official MITRE ATT&CK Enterprise STIX and SigmaHQ rules,
 * then writes compact local catalogs for the frontend (no runtime live fetch).
 *
 * Usage: node scripts/ingest-detection-data.mjs
 */
import { execFileSync } from 'node:child_process'
import { createWriteStream } from 'node:fs'
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const yaml = require('js-yaml')

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const CACHE = path.join(ROOT, '.cache')
const OUT_DIR = path.join(ROOT, 'public', 'data')

const MITRE_URL =
  'https://raw.githubusercontent.com/mitre-attack/attack-stix-data/master/enterprise-attack/enterprise-attack.json'
const SIGMA_REPO = 'https://github.com/SigmaHQ/sigma.git'

const TACTIC_LABELS = {
  reconnaissance: 'Reconnaissance',
  'resource-development': 'Resource Development',
  'initial-access': 'Initial Access',
  execution: 'Execution',
  persistence: 'Persistence',
  'privilege-escalation': 'Privilege Escalation',
  'defense-evasion': 'Defense Evasion',
  'credential-access': 'Credential Access',
  discovery: 'Discovery',
  'lateral-movement': 'Lateral Movement',
  collection: 'Collection',
  'command-and-control': 'Command and Control',
  exfiltration: 'Exfiltration',
  impact: 'Impact',
}

function asText(value) {
  if (value == null) return ''
  if (typeof value === 'string') return value.trim()
  if (Array.isArray(value)) return value.map((item) => asText(item)).filter(Boolean).join(', ')
  if (typeof value === 'object' && value.name) return String(value.name)
  return String(value)
}

function asList(value) {
  if (value == null) return []
  if (Array.isArray(value)) return value.map((item) => asText(item)).filter(Boolean)
  const text = asText(value)
  return text ? [text] : []
}

function logsourceLabel(logsource) {
  if (!logsource || typeof logsource !== 'object') return 'unknown'
  const parts = [logsource.product, logsource.service, logsource.category]
    .map((part) => asText(part))
    .filter(Boolean)
  return parts.length ? parts.join('/') : 'unknown'
}

function extractMitreTags(tags) {
  const ids = new Set()
  for (const tag of asList(tags)) {
    const match = tag.match(/^attack\.(t\d{4}(?:\.\d{3})?)$/i)
    if (match) ids.add(match[1].toUpperCase())
  }
  return [...ids].sort()
}

async function download(url, dest) {
  const response = await fetch(url)
  if (!response.ok || !response.body) {
    throw new Error(`Failed to download ${url}: ${response.status} ${response.statusText}`)
  }
  await pipeline(Readable.fromWeb(response.body), createWriteStream(dest))
}

async function walkYaml(dir) {
  const files = []
  const entries = await readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await walkYaml(full)))
    } else if (entry.isFile() && /\.ya?ml$/i.test(entry.name)) {
      files.push(full)
    }
  }
  return files
}

function parseMitre(bundle) {
  const objects = Array.isArray(bundle.objects) ? bundle.objects : []
  const attackIdByStix = new Map()
  const techniques = []

  for (const obj of objects) {
    if (obj.type !== 'attack-pattern') continue
    if (obj.revoked || obj.x_mitre_deprecated) continue
    const ext = (obj.external_references ?? []).find((ref) => ref.source_name === 'mitre-attack')
    if (!ext?.external_id) continue
    attackIdByStix.set(obj.id, ext.external_id)
  }

  const parentByStix = new Map()
  for (const obj of objects) {
    if (obj.type !== 'relationship' || obj.relationship_type !== 'subtechnique-of') continue
    parentByStix.set(obj.source_ref, obj.target_ref)
  }

  for (const obj of objects) {
    if (obj.type !== 'attack-pattern') continue
    if (obj.revoked || obj.x_mitre_deprecated) continue
    const ext = (obj.external_references ?? []).find((ref) => ref.source_name === 'mitre-attack')
    if (!ext?.external_id) continue

    const tactics = (obj.kill_chain_phases ?? [])
      .filter((phase) => phase.kill_chain_name === 'mitre-attack' && phase.phase_name)
      .map((phase) => TACTIC_LABELS[phase.phase_name] ?? phase.phase_name.replaceAll('-', ' '))

    const parentStix = parentByStix.get(obj.id)
    const parentId = parentStix ? (attackIdByStix.get(parentStix) ?? null) : null

    techniques.push({
      id: ext.external_id,
      name: obj.name ?? ext.external_id,
      description: obj.description ?? '',
      tactics: [...new Set(tactics)],
      isSubtechnique: Boolean(obj.x_mitre_is_subtechnique),
      parentId,
      platforms: obj.x_mitre_platforms ?? [],
      url: ext.url ?? `https://attack.mitre.org/techniques/${ext.external_id.replace('.', '/')}/`,
      version: obj.x_mitre_version ?? '',
    })
  }

  techniques.sort((a, b) => a.id.localeCompare(b.id, 'en', { numeric: true }))

  const identity = objects.find((obj) => obj.type === 'x-mitre-collection')
  return {
    source: 'MITRE ATT&CK Enterprise (STIX)',
    sourceUrl: MITRE_URL,
    attackSpecVersion: identity?.x_mitre_attack_spec_version ?? bundle.spec_version ?? '',
    collectionName: identity?.name ?? 'Enterprise ATT&CK',
    generatedAt: new Date().toISOString(),
    count: techniques.length,
    techniques,
  }
}

function parseSigmaFile(filePath, repoRoot, seenIds, raw) {
  let parsed
  try {
    parsed = yaml.load(raw)
  } catch {
    return null
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null
  if (!parsed.title || !parsed.id) return null

  let id = String(parsed.id).trim()
  if (seenIds.has(id)) id = `${id}::${path.relative(repoRoot, filePath)}`

  const logsource = parsed.logsource && typeof parsed.logsource === 'object' ? parsed.logsource : {}

  return {
    id,
    title: asText(parsed.title),
    status: asText(parsed.status) || 'unknown',
    level: asText(parsed.level) || 'unknown',
    description: asText(parsed.description),
    author: asText(parsed.author),
    date: asText(parsed.date),
    modified: asText(parsed.modified),
    references: asList(parsed.references),
    tags: asList(parsed.tags),
    mitreTechniques: extractMitreTags(parsed.tags),
    logsource: {
      product: asText(logsource.product),
      service: asText(logsource.service),
      category: asText(logsource.category),
      definition: asText(logsource.definition),
    },
    logsourceLabel: logsourceLabel(logsource),
    falsepositives: asList(parsed.falsepositives),
    detection: parsed.detection ?? null,
    file: path.relative(repoRoot, filePath).replaceAll('\\', '/'),
  }
}

async function ingestSigma(repoDir) {
  const ruleRoots = ['rules', 'rules-emerging-threats', 'rules-threat-hunting', 'rules-placeholder']
    .map((dir) => path.join(repoDir, dir))

  const files = []
  for (const root of ruleRoots) {
    try {
      files.push(...(await walkYaml(root)))
    } catch {
      // directory may not exist in this clone
    }
  }

  const seenIds = new Set()
  const rules = []
  let skipped = 0

  for (const file of files) {
    const raw = await readFile(file, 'utf8')
    const rule = parseSigmaFile(file, repoDir, seenIds, raw)
    if (!rule) {
      skipped += 1
      continue
    }
    seenIds.add(rule.id)
    rules.push(rule)
  }

  rules.sort((a, b) => a.title.localeCompare(b.title, 'en'))

  return {
    source: 'SigmaHQ/sigma',
    sourceUrl: SIGMA_REPO,
    generatedAt: new Date().toISOString(),
    count: rules.length,
    skipped,
    rules,
  }
}

async function ensureSigmaClone() {
  const dest = path.join(CACHE, 'sigma')
  await mkdir(CACHE, { recursive: true })
  try {
    execFileSync('git', ['-C', dest, 'rev-parse', '--is-inside-work-tree'], { stdio: 'ignore' })
    execFileSync('git', ['-C', dest, 'fetch', '--depth', '1', 'origin', 'master'], { stdio: 'inherit' })
    execFileSync('git', ['-C', dest, 'reset', '--hard', 'origin/master'], { stdio: 'inherit' })
  } catch {
    await rm(dest, { recursive: true, force: true })
    execFileSync(
      'git',
      [
        'clone',
        '--depth',
        '1',
        '--filter=blob:none',
        '--sparse',
        SIGMA_REPO,
        dest,
      ],
      { stdio: 'inherit' },
    )
    execFileSync(
      'git',
      ['-C', dest, 'sparse-checkout', 'set', 'rules', 'rules-emerging-threats', 'rules-threat-hunting'],
      { stdio: 'inherit' },
    )
  }
  return dest
}

async function main() {
  await mkdir(CACHE, { recursive: true })
  await mkdir(OUT_DIR, { recursive: true })

  const mitrePath = path.join(CACHE, 'enterprise-attack.json')
  console.log('Downloading MITRE ATT&CK Enterprise STIX…')
  await download(MITRE_URL, mitrePath)
  const bundle = JSON.parse(await readFile(mitrePath, 'utf8'))
  const mitreCatalog = parseMitre(bundle)
  await writeFile(path.join(OUT_DIR, 'mitre-enterprise.json'), JSON.stringify(mitreCatalog))
  console.log(`Wrote ${mitreCatalog.count} ATT&CK techniques`)

  console.log('Cloning SigmaHQ rules…')
  const sigmaRepo = await ensureSigmaClone()
  const sigmaCatalog = await ingestSigma(sigmaRepo)
  await writeFile(path.join(OUT_DIR, 'sigma-rules.json'), JSON.stringify(sigmaCatalog))
  console.log(`Wrote ${sigmaCatalog.count} Sigma rules (skipped ${sigmaCatalog.skipped})`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
