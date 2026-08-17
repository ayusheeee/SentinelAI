import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { CatalogProvider } from './catalog/CatalogProvider'
import { AppLayout } from './components/AppLayout'
import { AlertDetailPage } from './pages/AlertDetailPage'
import { AlertsPage } from './pages/AlertsPage'
import { DashboardPage } from './pages/DashboardPage'
import { IncidentsPage } from './pages/IncidentsPage'
import { InvestigationDetailPage, InvestigationsPage } from './pages/InvestigationsPage'
import { LogsPage } from './pages/LogsPage'
import { MitreDetailPage } from './pages/MitreDetailPage'
import { MitrePage } from './pages/MitrePage'
import { ReportsPage } from './pages/ReportsPage'
import { SettingsPage } from './pages/SettingsPage'
import { SigmaDetailPage } from './pages/SigmaDetailPage'
import { SigmaPage } from './pages/SigmaPage'

export default function App() {
  return (
    <BrowserRouter>
      <CatalogProvider>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/alerts/:alertId" element={<AlertDetailPage />} />
            <Route path="/incidents" element={<IncidentsPage />} />
            <Route path="/logs" element={<LogsPage />} />
            <Route path="/investigations" element={<InvestigationsPage />} />
            <Route path="/investigations/:investigationId" element={<InvestigationDetailPage />} />
            <Route path="/sigma" element={<SigmaPage />} />
            <Route path="/sigma/:ruleId" element={<SigmaDetailPage />} />
            <Route path="/mitre" element={<MitrePage />} />
            <Route path="/mitre/:techniqueId" element={<MitreDetailPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </CatalogProvider>
    </BrowserRouter>
  )
}
