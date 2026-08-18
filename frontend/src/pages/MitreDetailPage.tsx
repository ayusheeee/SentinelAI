import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useCatalog } from '../catalog/useCatalog'
import { paginate, relatedSigmaRules } from '../catalog/loadCatalog'
import type { SigmaRuleRecord } from '../catalog/types'
import { DataState } from '../components/DataState'
import { Modal } from '../components/Modal'
import { Pagination } from '../components/Pagination'
import { Panel } from '../components/Panel'
import { SigmaRuleDetail } from '../components/SigmaRuleDetail'
import { SigmaRuleTable } from '../components/SigmaRuleTable'
import { MITRE_TECHNIQUES } from '../mock/data'
import { ArrowLeft, ExternalLink, Layers, ShieldCheck } from 'lucide-react'

const RULES_PAGE_SIZE = 15

export function MitreDetailPage() {
  const { techniqueId } = useParams()
  const catalogState = useCatalog()
  const [selectedRule, setSelectedRule] = useState<SigmaRuleRecord | null>(null)
  const [rulesPage, setRulesPage] = useState(1)

  const decoded = techniqueId ? decodeURIComponent(techniqueId).trim().toUpperCase() : ''
  const catalog = catalogState.catalog
  const technique = catalog?.techniquesById.get(decoded)
  const subtechniques = catalog && technique ? (catalog.subtechniquesByParent.get(technique.id) ?? []) : []
  const parentTechnique = catalog && technique?.parentId ? catalog.techniquesById.get(technique.parentId) : null

  const relatedRules = catalog && technique ? relatedSigmaRules(catalog, technique.id) : []
  const pagedRules = paginate(relatedRules, rulesPage, RULES_PAGE_SIZE)
  const mockHit = MITRE_TECHNIQUES.find((item) => item.id === decoded || decoded.startsWith(`${item.id}.`))

  if (catalogState.status === 'loading' || catalogState.status === 'error') {
    return (
      <div className="space-y-4">
        <Link to="/mitre" className="inline-flex items-center gap-1 text-xs text-soc-accent hover:underline">
          <ArrowLeft size={14} /> Back to ATT&CK catalog
        </Link>
        <DataState status={catalogState.status} error={catalogState.error}>
          {null}
        </DataState>
      </div>
    )
  }

  if (!technique) {
    return (
      <div className="space-y-4">
        <Link to="/mitre" className="inline-flex items-center gap-1 text-xs text-soc-accent hover:underline">
          <ArrowLeft size={14} /> Back to ATT&CK catalog
        </Link>
        <DataState
          status="empty"
          emptyMessage={`Technique "${decoded}" was not found in the Enterprise ATT&CK catalog.`}
        >
          {null}
        </DataState>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <Link to="/mitre" className="inline-flex items-center gap-1 text-xs text-soc-accent hover:underline">
        <ArrowLeft size={14} /> Back to ATT&CK catalog
      </Link>

      {/* Technique Header Banner */}
      <div className="rounded-xl border border-soc-border bg-soc-panel p-5 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-soc-accent bg-soc-accent-dim px-2.5 py-0.5 rounded border border-soc-accent/30">
                {technique.id}
              </span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium border ${
                  technique.isSubtechnique
                    ? 'border-soc-border bg-soc-elevated text-soc-muted'
                    : 'border-soc-accent/40 bg-soc-accent-dim text-soc-accent'
                }`}
              >
                {technique.isSubtechnique ? 'Sub-technique' : 'Technique'}
              </span>
              {technique.version && (
                <span className="text-xs text-soc-muted">v{technique.version}</span>
              )}
            </div>
            <h1 className="mt-2 text-2xl font-bold text-soc-text">{technique.name}</h1>
          </div>

          <a
            href={technique.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-soc-border bg-soc-elevated/80 px-3 py-1.5 text-xs font-medium text-soc-accent hover:bg-soc-elevated hover:border-soc-accent/40 transition-colors"
          >
            MITRE ATT&CK Matrix <ExternalLink size={12} />
          </a>
        </div>

        <div className="grid gap-3 pt-2 border-t border-soc-border/50 sm:grid-cols-2 lg:grid-cols-3 text-xs">
          <div>
            <span className="text-soc-muted block mb-1 uppercase tracking-wider text-[10px]">Tactics</span>
            <div className="flex flex-wrap gap-1">
              {technique.tactics.map((tactic) => (
                <span key={tactic} className="rounded bg-soc-elevated border border-soc-border px-2 py-0.5 text-soc-text">
                  {tactic}
                </span>
              ))}
            </div>
          </div>

          {technique.platforms && technique.platforms.length > 0 && (
            <div>
              <span className="text-soc-muted block mb-1 uppercase tracking-wider text-[10px]">Platforms</span>
              <div className="flex flex-wrap gap-1">
                {technique.platforms.map((platform) => (
                  <span key={platform} className="rounded bg-soc-elevated border border-soc-border px-2 py-0.5 text-soc-muted">
                    {platform}
                  </span>
                ))}
              </div>
            </div>
          )}

          {technique.parentId && (
            <div>
              <span className="text-soc-muted block mb-1 uppercase tracking-wider text-[10px]">Parent Technique</span>
              <Link
                to={`/mitre/${encodeURIComponent(technique.parentId)}`}
                className="font-mono text-soc-accent hover:underline inline-flex items-center gap-1 font-medium"
              >
                {technique.parentId} {parentTechnique ? `(${parentTechnique.name})` : ''}
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <Panel title="Description & Adversary Use">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-soc-muted">
          {technique.description || 'No description provided in the STIX data.'}
        </p>
      </Panel>

      {/* Sub-techniques list (if parent technique) */}
      {subtechniques.length > 0 && (
        <Panel title={`Sub-techniques (${subtechniques.length})`}>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {subtechniques.map((sub) => (
              <Link
                key={sub.id}
                to={`/mitre/${encodeURIComponent(sub.id)}`}
                className="flex flex-col rounded-lg border border-soc-border bg-soc-elevated/40 p-3 hover:border-soc-accent/40 hover:bg-soc-elevated transition-colors"
              >
                <span className="font-mono text-xs font-semibold text-soc-accent">{sub.id}</span>
                <span className="text-sm font-medium text-soc-text mt-1">{sub.name}</span>
              </Link>
            ))}
          </div>
        </Panel>
      )}

      {/* Related Demo Incidents */}
      {mockHit && (
        <Panel title="Observed in Demo Incidents">
          <div className="flex items-center gap-2 text-xs text-soc-muted mb-2">
            <ShieldCheck size={14} className="text-soc-accent" />
            <span>Associated incidents from the mock SOC dataset</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {mockHit.relatedIncidents.map((id) => (
              <Link
                key={id}
                to="/incidents"
                className="rounded-lg border border-soc-border bg-soc-elevated/60 px-3 py-1.5 font-mono text-xs text-soc-accent hover:underline"
              >
                Incident {id}
              </Link>
            ))}
          </div>
        </Panel>
      )}

      {/* Related Sigma Rules */}
      <Panel
        title={`Related Sigma Detection Rules (${relatedRules.length.toLocaleString()})`}
        action={
          <Link
            to={`/sigma`}
            className="text-xs text-soc-accent hover:underline"
          >
            Explore all Sigma rules
          </Link>
        }
      >
        {relatedRules.length > 0 ? (
          <div>
            <p className="text-xs text-soc-muted mb-3">
              Official SigmaHQ detection rules mapped to this technique or its hierarchical parent/sub-techniques.
            </p>
            <SigmaRuleTable rules={pagedRules.items} onOpen={setSelectedRule} />
            {relatedRules.length > RULES_PAGE_SIZE && (
              <Pagination
                page={pagedRules.page}
                pageCount={pagedRules.pageCount}
                total={pagedRules.total}
                onPageChange={setRulesPage}
              />
            )}
          </div>
        ) : (
          <div className="py-6 text-center text-sm text-soc-muted">
            <Layers className="mx-auto mb-2 text-soc-muted/40" size={24} />
            No SigmaHQ rules in the local catalog currently map directly to this technique.
          </div>
        )}
      </Panel>

      {/* Sigma Rule Modal */}
      {selectedRule && (
        <Modal title="Sigma Detection Rule" onClose={() => setSelectedRule(null)}>
          <SigmaRuleDetail rule={selectedRule} />
          <div className="mt-4 pt-3 border-t border-soc-border flex justify-end">
            <Link
              to={`/sigma/${encodeURIComponent(selectedRule.id)}`}
              className="rounded-lg border border-soc-accent/40 bg-soc-accent-dim px-3 py-1.5 text-xs font-medium text-soc-accent hover:bg-soc-accent/20 transition-colors"
            >
              Open Full Rule Page →
            </Link>
          </div>
        </Modal>
      )}
    </div>
  )
}
