import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCatalog } from '../catalog/useCatalog'
import { paginate, ruleCountMap } from '../catalog/loadCatalog'
import { DataState } from '../components/DataState'
import { FilterSelect } from '../components/FilterSelect'
import { Pagination } from '../components/Pagination'
import { Panel } from '../components/Panel'
import { SearchInput } from '../components/SearchInput'
import { TechniqueTable } from '../components/TechniqueTable'
import { MITRE_TECHNIQUES } from '../mock/data'
import { RotateCcw } from 'lucide-react'

const PAGE_SIZE_OPTIONS = [25, 50, 100]

export function MitrePage() {
  const catalogState = useCatalog()
  const [query, setQuery] = useState('')
  const [tactic, setTactic] = useState('all')
  const [kind, setKind] = useState('all')
  const [pageSize, setPageSize] = useState(25)
  const [page, setPage] = useState(1)

  const catalog = catalogState.catalog
  const tactics = catalog?.tactics ?? []
  const totalCount = catalog?.mitre.count ?? 0

  const filtered = useMemo(() => {
    if (!catalog) return []
    const needle = query.trim().toLowerCase()
    return catalog.mitre.techniques.filter((technique) => {
      if (tactic !== 'all' && !technique.tactics.includes(tactic)) return false
      if (kind === 'technique' && technique.isSubtechnique) return false
      if (kind === 'subtechnique' && !technique.isSubtechnique) return false
      if (!needle) return true
      return (
        technique.id.toLowerCase().includes(needle) ||
        technique.name.toLowerCase().includes(needle) ||
        (technique.parentId && technique.parentId.toLowerCase().includes(needle))
      )
    })
  }, [catalog, query, tactic, kind])

  const counts = useMemo(() => {
    return catalog ? ruleCountMap(catalog.rulesByTechnique) : new Map<string, number>()
  }, [catalog])

  const paged = paginate(filtered, page, pageSize)
  const isFiltered = query.trim() !== '' || tactic !== 'all' || kind !== 'all'

  const resetFilters = () => {
    setQuery('')
    setTactic('all')
    setKind('all')
    setPage(1)
  }

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
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-soc-muted">
          Official MITRE ATT&CK Enterprise dataset loaded locally as source of truth for threat technique mapping.
        </p>
        {catalogState.status === 'ready' && (
          <span className="shrink-0 text-xs font-mono text-soc-muted">
            {totalCount.toLocaleString()} techniques · {catalogState.catalog.mitre.collectionName}
          </span>
        )}
      </div>

      <Panel title="Observed in Demo Incidents">
        <div className="flex flex-wrap gap-2">
          {MITRE_TECHNIQUES.map((technique) => (
            <Link
              key={technique.id}
              to={`/mitre/${encodeURIComponent(technique.id)}`}
              className="rounded-lg border border-soc-border bg-soc-elevated/60 px-3 py-2 font-mono text-xs text-soc-accent hover:border-soc-accent/40 hover:bg-soc-elevated transition-colors"
            >
              <span className="font-semibold">{technique.id}</span> — {technique.name}
            </Link>
          ))}
        </div>
      </Panel>

      <div className="rounded-xl border border-soc-border bg-soc-panel p-4 space-y-3">
        <div className="grid gap-3 md:grid-cols-3">
          <SearchInput
            label="Search by Technique ID / Name"
            value={query}
            placeholder="e.g. T1059 or PowerShell"
            onChange={(value) => {
              setQuery(value)
              setPage(1)
            }}
          />
          <FilterSelect
            label="Filter by Tactic"
            value={tactic}
            options={['all', ...tactics]}
            onChange={(value) => {
              setTactic(value)
              setPage(1)
            }}
          />
          <FilterSelect
            label="Filter by Type"
            value={kind}
            options={['all', 'technique', 'subtechnique']}
            onChange={(value) => {
              setKind(value)
              setPage(1)
            }}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-soc-muted border-t border-soc-border/40">
          <div className="flex items-center gap-2">
            <span>
              Showing <strong className="text-soc-text font-medium">{filtered.length.toLocaleString()}</strong> of{' '}
              {totalCount.toLocaleString()} techniques
            </span>
            {isFiltered && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1 text-soc-accent hover:underline ml-2"
              >
                <RotateCcw size={12} /> Reset filters
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span>Per page:</span>
            {PAGE_SIZE_OPTIONS.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => {
                  setPageSize(size)
                  setPage(1)
                }}
                className={`px-2 py-0.5 rounded border text-xs transition-colors ${
                  pageSize === size
                    ? 'border-soc-accent bg-soc-accent-dim text-soc-accent'
                    : 'border-soc-border text-soc-muted hover:text-soc-text'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Panel title="Enterprise ATT&CK Techniques Catalog">
        <DataState
          status={status}
          error={catalogState.error}
          emptyMessage="No MITRE techniques matched the selected filters. Try broadening your search or resetting filters."
        >
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
