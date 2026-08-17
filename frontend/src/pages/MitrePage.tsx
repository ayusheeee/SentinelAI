import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCatalog } from '../catalog/CatalogProvider'
import { paginate } from '../catalog/loadCatalog'
import { DataState } from '../components/DataState'
import { FilterSelect } from '../components/FilterSelect'
import { Pagination } from '../components/Pagination'
import { Panel } from '../components/Panel'
import { SearchInput } from '../components/SearchInput'
import { TechniqueTable, ruleCountMap } from '../components/TechniqueTable'
import { MITRE_TECHNIQUES } from '../mock/data'

const PAGE_SIZE = 25

export function MitrePage() {
  const catalogState = useCatalog()
  const [query, setQuery] = useState('')
  const [tactic, setTactic] = useState('all')
  const [kind, setKind] = useState('all')
  const [page, setPage] = useState(1)

  const techniques = catalogState.catalog?.mitre.techniques ?? []
  const tactics = catalogState.catalog?.tactics ?? []

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return techniques.filter((technique) => {
      if (tactic !== 'all' && !technique.tactics.includes(tactic)) return false
      if (kind === 'technique' && technique.isSubtechnique) return false
      if (kind === 'subtechnique' && !technique.isSubtechnique) return false
      if (!needle) return true
      return (
        technique.id.toLowerCase().includes(needle) || technique.name.toLowerCase().includes(needle)
      )
    })
  }, [techniques, query, tactic, kind])

  const paged = paginate(filtered, page, PAGE_SIZE)
  const counts = catalogState.catalog ? ruleCountMap(catalogState.catalog.rulesByTechnique) : new Map<string, number>()

  const status =
    catalogState.status === 'loading'
      ? 'loading'
      : catalogState.status === 'error'
        ? 'error'
        : filtered.length === 0
          ? 'empty'
          : 'ready'

  return (
    <div className="space-y-5">
      <p className="text-sm text-soc-muted">
        Official MITRE ATT&CK Enterprise catalog loaded locally. Detection is not executed — this is the mapping
        reference the Sigma engine will use later.
      </p>

      <Panel title="Observed in demo incidents">
        <div className="flex flex-wrap gap-2">
          {MITRE_TECHNIQUES.map((technique) => (
            <Link
              key={technique.id}
              to={`/mitre/${encodeURIComponent(technique.id)}`}
              className="rounded-lg border border-soc-border bg-soc-elevated/50 px-3 py-2 font-mono text-xs text-soc-accent hover:bg-soc-elevated"
            >
              {technique.id} — {technique.name}
            </Link>
          ))}
        </div>
      </Panel>

      <div className="grid gap-3 rounded-xl border border-soc-border bg-soc-panel p-4 md:grid-cols-3">
        <SearchInput
          label="Search ID / name"
          value={query}
          placeholder="T1059 or PowerShell"
          onChange={(value) => {
            setQuery(value)
            setPage(1)
          }}
        />
        <FilterSelect
          label="Tactic"
          value={tactic}
          options={['all', ...tactics]}
          onChange={(value) => {
            setTactic(value)
            setPage(1)
          }}
        />
        <FilterSelect
          label="Type"
          value={kind}
          options={['all', 'technique', 'subtechnique']}
          onChange={(value) => {
            setKind(value)
            setPage(1)
          }}
        />
      </div>

      {catalogState.status === 'ready' ? (
        <p className="text-xs text-soc-muted">
          {catalogState.catalog.mitre.count.toLocaleString()} techniques/sub-techniques · source{' '}
          {catalogState.catalog.mitre.collectionName}
        </p>
      ) : null}

      <Panel title="Enterprise ATT&CK techniques">
        <DataState status={status} error={catalogState.error}>
          <TechniqueTable techniques={paged.items} ruleCounts={counts} />
          <Pagination
            page={paged.page}
            pageCount={paged.pageCount}
            total={paged.total}
            onPageChange={setPage}
          />
        </DataState>
      </Panel>
    </div>
  )
}
