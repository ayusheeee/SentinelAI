import { Link, useParams } from 'react-router-dom'
import { useCatalog } from '../catalog/useCatalog'
import { DataState } from '../components/DataState'
import { Panel } from '../components/Panel'
import { SigmaRuleDetail } from '../components/SigmaRuleDetail'
import { ArrowLeft } from 'lucide-react'

export function SigmaDetailPage() {
  const { ruleId } = useParams()
  const catalogState = useCatalog()
  const decoded = ruleId ? decodeURIComponent(ruleId).trim() : ''
  const rule = catalogState.catalog?.rulesById.get(decoded)

  if (catalogState.status === 'loading' || catalogState.status === 'error') {
    return (
      <div className="space-y-4">
        <Link to="/sigma" className="inline-flex items-center gap-1 text-xs text-soc-accent hover:underline">
          <ArrowLeft size={14} /> Back to Sigma catalog
        </Link>
        <DataState status={catalogState.status} error={catalogState.error}>
          {null}
        </DataState>
      </div>
    )
  }

  if (!rule) {
    return (
      <div className="space-y-4">
        <Link to="/sigma" className="inline-flex items-center gap-1 text-xs text-soc-accent hover:underline">
          <ArrowLeft size={14} /> Back to Sigma catalog
        </Link>
        <DataState
          status="empty"
          emptyMessage={`Sigma rule with ID "${decoded}" was not found in the local SigmaHQ catalog.`}
        >
          {null}
        </DataState>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <Link to="/sigma" className="inline-flex items-center gap-1 text-xs text-soc-accent hover:underline">
        <ArrowLeft size={14} /> Back to Sigma catalog
      </Link>

      <Panel title="Sigma Rule Specification">
        <SigmaRuleDetail rule={rule} />
      </Panel>
    </div>
  )
}
