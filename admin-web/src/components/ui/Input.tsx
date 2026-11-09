import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: ReactNode
  suffix?: string
}

export const Input = forwardRef<HTMLInputElement, Props>(function Input({ label, error, hint, suffix, id, className = '', ...rest }, ref) {
  const fid = id ?? `f-${rest.name ?? label.replace(/\s+/g, '-').toLowerCase()}`
  return (
    <label htmlFor={fid} className={`block ${className}`}>
      <span className="eyebrow">{label}</span>
      <span className="relative mt-1 flex items-baseline">
        <input ref={ref} id={fid} aria-invalid={error ? true : undefined} className="field" {...rest} />
        {suffix && <span className="figure pointer-events-none absolute right-1 text-[12px] text-[var(--ink-3)]">{suffix}</span>}
      </span>
      {error ? (
        <span className="mt-1 block text-[12px] text-[var(--danger)]">{error}</span>
      ) : hint ? (
        <span className="mt-1 block text-[12px] text-[var(--ink-3)]">{hint}</span>
      ) : null}
    </label>
  )
})
