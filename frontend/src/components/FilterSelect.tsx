type FilterSelectProps = {
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
}

export function FilterSelect({ label, value, options, onChange }: FilterSelectProps) {
  return (
    <label className="block text-xs text-soc-muted">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-lg border border-soc-border bg-soc-elevated px-3 py-2 text-sm text-soc-text outline-none focus:border-soc-accent"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}
