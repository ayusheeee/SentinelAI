import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCatalog } from '../catalog/CatalogProvider'
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

const PAGE_SIZE = 25

export function SigmaPage() {
  const catalogState = useCatalog()
  const [titleQuery, setTitleQuery] = useState('')
  const [idQuery, setIdQuery] = useState('')
  const [level, setLevel] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [logSource, setLogSource] = useState('all')
  const [mitre, setMitre] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<SigmaRuleRecord | null>(null)

  const rules = catalogState.catalog?.sigma.rules ?? []

  const filtered = useMemo(() => {
    const titleNeedle = titleQuery.trim().toLowerCase()
    const idNeedle = idQuery.trim().toLowerCase()
    const mitreNeedle = mitre.trim().toUpperCase()
    return rules.filter((rule) => {
      if (level !== 'all' && rule.level !== level) return false
      if (statusFilter !== 'all' && rule.status !== statusFilter) return false
      if (logSource !== 'all' && rule.logsourceLabel !== logSource) return false
      if (titleNeedle && !rule.title.toLowerCase().includes(titleNeedle)) return false
      if (idNeedle && !rule.id.toLowerCase().includes(idNeedle)) return false
      if (mitreNeedle && !rule.mitreTechniques.some((id) => id.includes(mitreNeedle))) return false
      return true
    })
  }, [rules, titleQuery, idQuery, level, statusFilter, logSource, mitre])

  const paged = paginate(filtered, page, PAGE_SIZE)
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
        Official SigmaHQ rule catalog stored locally. Rules are displayed for reference only — log matching is not
        implemented yet.
      </p>

      <div className="grid gap-3 rounded-xl border border-soc-border bg-soc-panel p-4 md:grid-cols-2 xl:grid-cols-3">
        <SearchInput
          label="Search by rule name"
          value={titleQuery}
          placeholder="Failed login, PowerShell…"
          onChange={(value) => {
            setTitleQuery(value)
            setPage(1)
          }}
        />
        <SearchInput
          label="Search by rule ID"
          value={idQuery}
          placeholder="UUID"
          onChange={(value) => {
            setIdQuery(value)
            setPage(1)
          }}
        />
        <SearchInput
          label="Filter by MITRE technique"
          value={mitre}
          placeholder="T1059.001"
          onChange={(value) => {
            setMitre(value)
            setPage(1)
          }}
        />
        <FilterSelect
          label="Severity"
          value={level}
          options={['all', ...(catalogState.catalog?.sigmaLevels ?? [])]}
          onChange={(value) => {
            setLevel(value)
            setPage(1)
          }}
        />
        <FilterSelect
          label="Status"
          value={statusFilter}
          options={['all', ...(catalogState.catalog?.sigmaStatuses ?? [])]}
          onChange={(value) => {
            setStatusFilter(value)
            setPage(1)
          }}
        />
        <FilterSelect
          label="Log source"
          value={logSource}
          options={['all', ...(catalogState.catalog?.sigmaLogSources ?? [])]}
          onChange={(value) => {
            setLogSource(value)
            setPage(1)
          }}
        />
      </div>

      {catalogState.status === 'ready' ? (
        <p className="text-xs text-soc-muted">
          {catalogState.catalog.sigma.count.toLocaleString()} SigmaHQ rules ingested
        </p>
      ) : null}

      <Panel title="Sigma rules">
        <DataState status={status} error={catalogState.error}>
          <SigmaRuleTable rules={paged.items} onOpen={setSelected} />
          <Pagination
            page={paged.page}
            pageCount={paged.pageCount}
            total={paged.total}
            onPageChange={setPage}
          />
        </DataState>
      </Panel>

      {selected ? (
        <Modal title="Sigma rule" onClose={() => setSelected(null)}>
          <SigmaRuleDetail rule={selected} />
          <Link
            to={`/sigma/${encodeURIComponent(selected.id)}`}
            className="mt-4 inline-block text-xs text-soc-accent hover:underline"
          >
            Open full page
          </Link>
        </Modal>
      ) : null}
    </div>
  )
}
