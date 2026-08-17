import { Link, useParams } from 'react-router-dom'
import { useCatalog } from '../catalog/CatalogProvider'
import { DataState } from '../components/DataState'
import { Panel } from '../components/Panel'
import { SigmaRuleDetail } from '../components/SigmaRuleDetail'

export function SigmaDetailPage() {
  const { ruleId } = useParams()
  const catalogState = useCatalog()
  const decoded = ruleId ? decodeURIComponent(ruleId) : ''
  const rule = catalogState.catalog?.rulesById.get(decoded)

  if (catalogState.status === 'loading' || catalogState.status === 'error') {
    return <DataState status={catalogState.status} error={catalogState.error}>{null}</DataState>
  }

  if (!rule) {
    return (
      <div className="space-y-3">
        <Link to="/sigma" className="text-xs text-soc-accent hover:underline">
          ← Sigma catalog
        </Link>
        <DataState status="empty" emptyMessage={`Rule ${decoded} was not found in the local SigmaHQ catalog.`}>
          {null}
        </DataState>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <Link to="/sigma" className="text-xs text-soc-accent hover:underline">
        ← Sigma catalog
      </Link>
      <Panel title="Rule details">
        <SigmaRuleDetail rule={rule} />
      </Panel>
    </div>
  )
}
