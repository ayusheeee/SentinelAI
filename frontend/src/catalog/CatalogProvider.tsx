import { useEffect, useState, type ReactNode } from 'react'
import { loadDetectionCatalog } from './loadCatalog'
import { CatalogContext, type CatalogState } from './useCatalog'

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CatalogState>({
    status: 'loading',
    catalog: null,
    error: null,
  })

  useEffect(() => {
    let cancelled = false
    loadDetectionCatalog()
      .then((catalog) => {
        if (!cancelled) setState({ status: 'ready', catalog, error: null })
      })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : 'Failed to load detection catalogs.'
        if (!cancelled) setState({ status: 'error', catalog: null, error: message })
      })
    return () => {
      cancelled = true
    }
  }, [])

  return <CatalogContext.Provider value={state}>{children}</CatalogContext.Provider>
}
