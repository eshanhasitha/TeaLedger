import { forwardRef, type SelectHTMLAttributes } from 'react'

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  error?: string
  options: { value: string; label: string }[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, Props>(function Select(
  { label, error, options, placeholder, id, className = '', ...rest },
  ref,
) {
  const fid = id ?? `s-${rest.name ?? label.replace(/\s+/g, '-').toLowerCase()}`
  return (
    <label htmlFor={fid} className={`block ${className}`}>
      <span className="eyebrow">{label}</span>
      <select ref={ref} id={fid} aria-invalid={error ? true : undefined} className="field mt-1" {...rest}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <span className="mt-1 block text-[12px] text-[var(--danger)]">{error}</span>}
    </label>
  )
})
