import type { ReactNode } from 'react'

type ModalProps = {
  title: string
  onClose: () => void
  children: ReactNode
}

export function Modal({ title, onClose, children }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="my-8 w-full max-w-3xl rounded-xl border border-soc-border bg-soc-panel shadow-xl"
      >
        <header className="flex items-center justify-between gap-3 border-b border-soc-border px-4 py-3">
          <h2 className="text-sm font-semibold text-soc-text">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-soc-border px-2 py-1 text-xs text-soc-muted hover:text-soc-text"
          >
            Close
          </button>
        </header>
        <div className="max-h-[75vh] overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  )
}
