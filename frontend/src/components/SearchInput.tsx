type SearchInputProps = {
  label: string
  value: string
  placeholder: string
  onChange: (value: string) => void
}

export function SearchInput({ label, value, placeholder, onChange }: SearchInputProps) {
  return (
    <label className="block text-xs text-soc-muted">
      {label}
      <input
        type="search"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-lg border border-soc-border bg-soc-elevated px-3 py-2 text-sm text-soc-text outline-none placeholder:text-soc-muted focus:border-soc-accent"
      />
    </label>
  )
}
