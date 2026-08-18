import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCatalog } from '../catalog/useCatalog'
import { paginate } from '../catalog/loadCatalog'
import type { SigmaRuleRecord } from '../catalog/types'
import { DataState } from '../components/DataState'
import { FilterSelect } from '../components/FilterSelect'
import { Modal } from '../components/Modal'
import { Pagination } from '../components/Pagination'
import { Panel } from '../components/Panel'
import { SearchInput } from '../components/SearchInput'
import { SigmaRuleDetail } from '../components/SigmaRuleDetail'
import { SigmaRuleTable } from '../components/SigmaRuleTable'
import { RotateCcw } from 'lucide-react'

const PAGE_SIZE_OPTIONS = [25, 50, 100]

export function SigmaPage() {
  const catalogState = useCatalog()
  const [titleQuery, setTitleQuery] = useState('')
  const [idQuery, setIdQuery] = useState('')
  const [level, setLevel] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [logSource, setLogSource] = useState('all')
  const [mitre, setMitre] = useState('')
  const [pageSize, setPageSize] = useState(25)
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<SigmaRuleRecord | null>(null)

  const catalog = catalogState.catalog
  const totalCount = catalog?.sigma.count ?? 0

  const filtered = useMemo(() => {
    if (!catalog) return []
    const titleNeedle = titleQuery.trim().toLowerCase()
    const idNeedle = idQuery.trim().toLowerCase()
    const mitreNeedle = mitre.trim().toUpperCase()

    return catalog.sigma.rules.filter((rule) => {
      if (level !== 'all' && rule.level !== level) return false
      if (statusFilter !== 'all' && rule.status !== statusFilter) return false
      if (logSource !== 'all' && rule.logsourceLabel !== logSource) return false
      if (titleNeedle && !rule.title.toLowerCase().includes(titleNeedle)) return false
      if (idNeedle && !rule.id.toLowerCase().includes(idNeedle)) return false
      if (mitreNeedle && !rule.mitreTechniques.some((id) => id.includes(mitreNeedle))) return false
      return true
    })
  }, [catalog, titleQuery, idQuery, level, statusFilter, logSource, mitre])

  const paged = paginate(filtered, page, pageSize)

  const isFiltered =
    titleQuery.trim() !== '' ||
    idQuery.trim() !== '' ||
    mitre.trim() !== '' ||
    level !== 'all' ||
    statusFilter !== 'all' ||
    logSource !== 'all'

  const resetFilters = () => {
    setTitleQuery('')
    setIdQuery('')
    setMitre('')
    setLevel('all')
    setStatusFilter('all')
    setLogSource('all')
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
          Official SigmaHQ rule catalog stored locally. Rules are loaded and indexed for reference and cross-mapping.
        </p>
        {catalogState.status === 'ready' && (
          <span className="shrink-0 text-xs font-mono text-soc-muted">
            {totalCount.toLocaleString()} SigmaHQ rules loaded
          </span>
        )}
      </div>

      {/* Filter Controls */}
      <div className="rounded-xl border border-soc-border bg-soc-panel p-4 space-y-3">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <SearchInput
            label="Search by Rule Name / Title"
            value={titleQuery}
            placeholder="e.g. Failed login, PowerShell, Mimikatz…"
            onChange={(value) => {
              setTitleQuery(value)
              setPage(1)
            }}
          />
          <SearchInput
            label="Search by Rule ID (UUID)"
            value={idQuery}
            placeholder="e.g. 53c15703-b04c…"
            onChange={(value) => {
              setIdQuery(value)
              setPage(1)
            }}
          />
          <SearchInput
            label="Filter by MITRE Technique"
            value={mitre}
            placeholder="e.g. T1059.001 or T1110"
            onChange={(value) => {
              setMitre(value)
              setPage(1)
            }}
          />
          <FilterSelect
            label="Severity / Level"
            value={level}
            options={['all', ...(catalog?.sigmaLevels ?? [])]}
            onChange={(value) => {
              setLevel(value)
              setPage(1)
            }}
          />
          <FilterSelect
            label="Lifecycle Status"
            value={statusFilter}
            options={['all', ...(catalog?.sigmaStatuses ?? [])]}
            onChange={(value) => {
              setStatusFilter(value)
              setPage(1)
            }}
          />
          <FilterSelect
            label="Log Source"
            value={logSource}
            options={['all', ...(catalog?.sigmaLogSources ?? [])]}
            onChange={(value) => {
              setLogSource(value)
              setPage(1)
            }}
          />
        </div>

        {/* Action / Count Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs text-soc-muted border-t border-soc-border/40">
          <div className="flex items-center gap-2">
            <span>
              Showing <strong className="text-soc-text font-medium">{filtered.length.toLocaleString()}</strong> of{' '}
              {totalCount.toLocaleString()} Sigma rules
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

      {/* Rules Table */}
      <Panel title="SigmaHQ Detection Rules">
        <DataState
          status={status}
          error={catalogState.error}
          emptyMessage="No Sigma rules match the active search and filter criteria. Try resetting filters."
        >
          <SigmaRuleTable rules={paged.items} onOpen={setSelected} />
          <Pagination
            page={paged.page}
            pageCount={paged.pageCount}
            total={paged.total}
            onPageChange={setPage}
          />
        </DataState>
      </Panel>

      {/* Modal Preview */}
      {selected && (
        <Modal title="Sigma Detection Rule" onClose={() => setSelected(null)}>
          <SigmaRuleDetail rule={selected} />
          <div className="mt-4 pt-3 border-t border-soc-border flex justify-end">
            <Link
              to={`/sigma/${encodeURIComponent(selected.id)}`}
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
