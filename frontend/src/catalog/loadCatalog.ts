import type { AttackTechnique, MitreCatalog, SigmaCatalog, SigmaRuleRecord } from './types'

const MITRE_PATH = '/data/mitre-enterprise.json'
const SIGMA_PATH = '/data/sigma-rules.json'

export class CatalogLoadError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CatalogLoadError'
  }
}

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(path)
  if (!response.ok) {
    throw new CatalogLoadError(`Could not load ${path} (${response.status}). Run npm run ingest:detection-data.`)
  }
  return (await response.json()) as T
}

export type DetectionCatalog = {
  mitre: MitreCatalog
  sigma: SigmaCatalog
  techniquesById: Map<string, AttackTechnique>
  rulesById: Map<string, SigmaRuleRecord>
  rulesByTechnique: Map<string, SigmaRuleRecord[]>
  tactics: string[]
  sigmaStatuses: string[]
  sigmaLevels: string[]
  sigmaLogSources: string[]
}

function indexCatalog(mitre: MitreCatalog, sigma: SigmaCatalog): DetectionCatalog {
  const techniquesById = new Map(mitre.techniques.map((technique) => [technique.id, technique]))
  const rulesById = new Map(sigma.rules.map((rule) => [rule.id, rule]))
  const rulesByTechnique = new Map<string, SigmaRuleRecord[]>()

  for (const rule of sigma.rules) {
    for (const techniqueId of rule.mitreTechniques) {
      const list = rulesByTechnique.get(techniqueId) ?? []
      list.push(rule)
      rulesByTechnique.set(techniqueId, list)
    }
  }

  const tactics = [...new Set(mitre.techniques.flatMap((technique) => technique.tactics))].sort()
  const sigmaStatuses = [...new Set(sigma.rules.map((rule) => rule.status))].sort()
  const sigmaLevels = [...new Set(sigma.rules.map((rule) => rule.level))].sort()
  const sigmaLogSources = [...new Set(sigma.rules.map((rule) => rule.logsourceLabel))].sort()

  return {
    mitre,
    sigma,
    techniquesById,
    rulesById,
    rulesByTechnique,
    tactics,
    sigmaStatuses,
    sigmaLevels,
    sigmaLogSources,
  }
}

let catalogPromise: Promise<DetectionCatalog> | null = null

export function loadDetectionCatalog(): Promise<DetectionCatalog> {
  if (!catalogPromise) {
    catalogPromise = Promise.all([
      fetchJson<MitreCatalog>(MITRE_PATH),
      fetchJson<SigmaCatalog>(SIGMA_PATH),
    ]).then(([mitre, sigma]) => indexCatalog(mitre, sigma))
  }
  return catalogPromise
}

export function relatedSigmaRules(catalog: DetectionCatalog, techniqueId: string) {
  const direct = catalog.rulesByTechnique.get(techniqueId) ?? []
  const parent = catalog.techniquesById.get(techniqueId)?.parentId
  const parentRules = parent ? (catalog.rulesByTechnique.get(parent) ?? []) : []
  const seen = new Set<string>()
  return [...direct, ...parentRules].filter((rule) => {
    if (seen.has(rule.id)) return false
    seen.add(rule.id)
    return true
  })
}

export function paginate<T>(items: T[], page: number, pageSize: number) {
  const total = items.length
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(Math.max(1, page), pageCount)
  const start = (safePage - 1) * pageSize
  return {
    items: items.slice(start, start + pageSize),
    total,
    page: safePage,
    pageCount,
    pageSize,
  }
}
