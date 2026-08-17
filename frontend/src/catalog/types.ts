export type AttackTechnique = {
  id: string
  name: string
  description: string
  tactics: string[]
  isSubtechnique: boolean
  parentId: string | null
  platforms: string[]
  url: string
  version: string
}

export type MitreCatalog = {
  source: string
  sourceUrl: string
  attackSpecVersion: string
  collectionName: string
  generatedAt: string
  count: number
  techniques: AttackTechnique[]
}

export type SigmaLogSource = {
  product: string
  service: string
  category: string
  definition: string
}

export type SigmaRuleRecord = {
  id: string
  title: string
  status: string
  level: string
  description: string
  author: string
  date: string
  modified: string
  references: string[]
  tags: string[]
  mitreTechniques: string[]
  logsource: SigmaLogSource
  logsourceLabel: string
  falsepositives: string[]
  detection: unknown
  file: string
}

export type SigmaCatalog = {
  source: string
  sourceUrl: string
  generatedAt: string
  count: number
  skipped: number
  rules: SigmaRuleRecord[]
}
