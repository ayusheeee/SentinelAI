type PaginationProps = {
  page: number
  pageCount: number
  total: number
  onPageChange: (page: number) => void
}

export function Pagination({ page, pageCount, total, onPageChange }: PaginationProps) {
  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-soc-muted">
      <p>
        Page {page} of {pageCount} · {total.toLocaleString()} records
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="rounded-lg border border-soc-border px-3 py-1.5 disabled:opacity-40 hover:bg-soc-elevated"
        >
          Previous
        </button>
        <button
          type="button"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
          className="rounded-lg border border-soc-border px-3 py-1.5 disabled:opacity-40 hover:bg-soc-elevated"
        >
          Next
        </button>
      </div>
    </div>
  )
}
