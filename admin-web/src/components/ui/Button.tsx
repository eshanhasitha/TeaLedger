import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'ink' | 'ghost' | 'line' | 'danger'

const styles: Record<Variant, string> = {
  ink: 'bg-[var(--ink)] text-[var(--paper)] hover:bg-[var(--leaf)] dark:hover:text-[#10170f]',
  ghost: 'text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--leaf-soft)]',
  line: 'border border-[var(--hair)] text-[var(--ink)] hover:border-[var(--ink)]',
  danger: 'bg-[var(--danger)] text-white hover:brightness-110',
}

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  icon?: ReactNode
  size?: 'sm' | 'md'
  loading?: boolean
}

export function Button({ variant = 'ink', icon, size = 'md', loading, children, className = '', disabled, ...rest }: Props) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-all duration-150 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-45 ${
        size === 'sm' ? 'h-8 px-3 text-[12.5px]' : 'h-10 px-4.5 text-[13.5px]'
      } ${styles[variant]} ${className}`}
    >
      {loading ? (
        <span className="size-3.5 animate-spin rounded-full border-[1.5px] border-current border-t-transparent" />
      ) : (
        icon
      )}
      {children}
    </button>
  )
}
