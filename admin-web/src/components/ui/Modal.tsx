import { X } from 'lucide-react'
import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface Props {
  open: boolean
  onClose: () => void
  title: string
  eyebrow?: string
  children: ReactNode
  footer?: ReactNode
  width?: number
}

/** A "loose leaf" sheet that slides over the ledger. Esc / backdrop closes; focus is trapped inside. */
export function Modal({ open, onClose, title, eyebrow, children, footer, width = 520 }: Props) {
  const panel = useRef<HTMLDivElement>(null)
  const closeRef = useRef(onClose)
  useEffect(() => {
    closeRef.current = onClose
  })

  useEffect(() => {
    if (!open) return
    const prev = document.activeElement as HTMLElement | null
    const t = setTimeout(() => {
      panel.current?.querySelector<HTMLElement>('input,select,textarea,button:not([data-close])')?.focus()
    }, 30)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeRef.current()
      if (e.key === 'Tab' && panel.current) {
        const f = panel.current.querySelectorAll<HTMLElement>('input,select,textarea,button,[href]')
        if (!f.length) return
        const first = f[0]
        const last = f[f.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      clearTimeout(t)
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      prev?.focus()
    }
  }, [open])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6">
      <div className="absolute inset-0 bg-[#1d221d]/35 backdrop-blur-[2px]" onClick={onClose} style={{ animation: 'rise .2s both' }} />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="ledger-paper rise relative max-h-[92vh] w-full overflow-auto rounded-t-2xl border border-[var(--hair)] shadow-[var(--shadow)] sm:rounded-2xl"
        style={{ maxWidth: width }}
      >
        <div className="relative pl-16 pr-6 pt-6 max-md:pl-6">
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h2 className="font-display mt-1 text-[34px] leading-none">{title}</h2>
          <button
            data-close
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 grid size-8 place-items-center rounded-full text-[var(--ink-3)] hover:bg-[var(--leaf-soft)] hover:text-[var(--ink)]"
          >
            <X size={16} />
          </button>
        </div>
        <div className="pb-6 pl-16 pr-6 pt-5 max-md:pl-6">{children}</div>
        {footer && (
          <div className="sticky bottom-0 flex justify-end gap-2 border-t border-[var(--hair)] bg-[var(--paper)] px-6 py-4">{footer}</div>
        )}
      </div>
    </div>,
    document.body,
  )
}
