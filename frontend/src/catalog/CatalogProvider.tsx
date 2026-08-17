import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { loadDetectionCatalog, type DetectionCatalog } from './loadCatalog'

type CatalogState =
  | { status: 'loading'; catalog: null; error: null }
  | { status: 'error'; catalog: null; error: string }
  | { status: 'ready'; catalog: DetectionCatalog; error: null }

const CatalogContext = createContext<CatalogState>({
  status: 'loading',
  catalog: null,
  error: null,
})

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

export function useCatalog() {
  return useContext(CatalogContext)
}
