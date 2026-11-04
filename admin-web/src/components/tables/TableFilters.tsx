interface Props<V extends string> {
  value: V
  onChange: (v: V) => void
  options: { value: V; label: string; count?: number }[]
}

/** Segmented filter that reads like ledger column tabs, with a tally count. */
export function TableFilters<V extends string>({ value, onChange, options }: Props<V>) {
  return (
    <div role="tablist" className="flex flex-wrap items-center gap-x-1 gap-y-2">
      {options.map((o) => {
        const on = o.value === value
        return (
          <button
            key={o.value}
            role="tab"
            aria-selected={on}
            onClick={() => onChange(o.value)}
            className={`relative rounded-full px-3 py-1.5 text-[12.5px] transition-colors ${
              on ? 'bg-[var(--ink)] text-[var(--paper)]' : 'text-[var(--ink-2)] hover:bg-[var(--leaf-soft)]'
            }`}
          >
            {o.label}
            {o.count !== undefined && <span className={`figure ml-1.5 text-[11px] ${on ? 'opacity-60' : 'text-[var(--ink-3)]'}`}>{o.count}</span>}
          </button>
        )
      })}
    </div>
  )
}
