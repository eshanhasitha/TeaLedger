import { Search, X } from 'lucide-react'

export function TableSearch({ value, onChange, placeholder = 'Search' }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="relative w-full sm:w-72">
      <Search size={14} className="pointer-events-none absolute left-1 top-1/2 -translate-y-1/2 text-[var(--ink-3)]" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="field !pl-6 !pr-7"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute right-0 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-full text-[var(--ink-3)] hover:text-[var(--ink)]"
        >
          <X size={13} />
        </button>
      )}
    </div>
  )
}
