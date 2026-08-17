import { AlertTable } from '../components/AlertTable'
import { Panel } from '../components/Panel'
import { ALERTS } from '../mock/data'

export function AlertsPage() {
  return (
    <Panel title="Active and recent alerts">
      <p className="mb-4 text-xs text-soc-muted">
        Select an alert to open the investigation-ready detail view. Detection engines are mocked.
      </p>
      <AlertTable alerts={ALERTS} />
    </Panel>
  )
}
