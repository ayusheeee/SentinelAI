import { Link, useParams } from 'react-router-dom'
import { useCatalog } from '../catalog/CatalogProvider'
import { relatedSigmaRules } from '../catalog/loadCatalog'
import { DataState } from '../components/DataState'
import { Panel } from '../components/Panel'
import { SigmaRuleTable } from '../components/SigmaRuleTable'
import { MITRE_TECHNIQUES } from '../mock/data'

export function MitreDetailPage() {
  const { techniqueId } = useParams()
  const catalogState = useCatalog()
  const decoded = techniqueId ? decodeURIComponent(techniqueId) : ''
  const technique = catalogState.catalog?.techniquesById.get(decoded)
  const relatedRules = catalogState.catalog && technique ? relatedSigmaRules(catalogState.catalog, technique.id) : []
  const mockHit = MITRE_TECHNIQUES.find((item) => item.id === decoded || decoded.startsWith(`${item.id}.`))

  if (catalogState.status === 'loading' || catalogState.status === 'error') {
    return <DataState status={catalogState.status} error={catalogState.error}>{null}</DataState>
  }

  if (!technique) {
    return (
      <DataState status="empty" emptyMessage={`Technique ${decoded} was not found in the Enterprise ATT&CK catalog.`}>
        {null}
      </DataState>
    )
  }

  return (
    <div className="space-y-5">
      <Link to="/mitre" className="text-xs text-soc-accent hover:underline">
        ← ATT&CK catalog
      </Link>

      <div className="rounded-xl border border-soc-border bg-soc-panel p-5">
        <p className="font-mono text-xs text-soc-accent">{technique.id}</p>
        <h2 className="mt-1 text-xl font-semibold text-soc-text">{technique.name}</h2>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <span className="rounded border border-soc-border px-2 py-1 text-soc-muted">
            {technique.isSubtechnique ? 'Sub-technique' : 'Technique'}
          </span>
          {technique.parentId ? (
            <Link
              to={`/mitre/${encodeURIComponent(technique.parentId)}`}
              className="rounded border border-soc-border px-2 py-1 font-mono text-soc-accent"
            >
              Parent {technique.parentId}
            </Link>
          ) : null}
          {technique.tactics.map((tactic) => (
            <span key={tactic} className="rounded border border-soc-border px-2 py-1 text-soc-muted">
              {tactic}
            </span>
          ))}
        </div>
      </div>

      <Panel title="Description">
        <p className="whitespace-pre-wrap text-sm leading-6 text-soc-muted">{technique.description}</p>
        <a
          href={technique.url}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-block text-xs text-soc-accent hover:underline"
        >
          View on attack.mitre.org
        </a>
      </Panel>

      {mockHit ? (
        <Panel title="Related demo incidents">
          <p className="text-xs text-soc-muted">From the mock SOC dataset (not live detection).</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {mockHit.relatedIncidents.map((id) => (
              <Link key={id} to="/incidents" className="font-mono text-xs text-soc-accent hover:underline">
                {id}
              </Link>
            ))}
          </div>
        </Panel>
      ) : null}

      <Panel title={`Related Sigma rules (${relatedRules.length})`}>
        {relatedRules.length ? (
          <SigmaRuleTable rules={relatedRules.slice(0, 50)} />
        ) : (
          <p className="text-sm text-soc-muted">No SigmaHQ rules in the local catalog tag this technique.</p>
        )}
        {relatedRules.length > 50 ? (
          <p className="mt-3 text-xs text-soc-muted">Showing 50 of {relatedRules.length}. Use the Sigma page to filter further.</p>
        ) : null}
      </Panel>
    </div>
  )
}
