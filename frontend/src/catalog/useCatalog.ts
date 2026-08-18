import { createContext, useContext } from 'react'
import type { DetectionCatalog } from './loadCatalog'

export type CatalogState =
  | { status: 'loading'; catalog: null; error: null }
  | { status: 'error'; catalog: null; error: string }
  | { status: 'ready'; catalog: DetectionCatalog; error: null }

export const CatalogContext = createContext<CatalogState>({
  status: 'loading',
  catalog: null,
  error: null,
})

export function useCatalog(): CatalogState {
  return useContext(CatalogContext)
}
