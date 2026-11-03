import { X } from 'lucide-react'
import { createPortal } from 'react-dom'
import type { ToastItem } from '../../context/NotificationContext'

const dot: Record<ToastItem['tone'], string> = {
  success: 'bg-[var(--leaf)]',
  info: 'bg-[var(--amber)]',
  danger: 'bg-[var(--danger)]',
}

/** Toasts appear as torn receipt slips stacked at the bottom-left of the page. */
export function Toasts({ items, onDismiss }: { items: ToastItem[]; onDismiss: (id: number) => void }) {
  return createPortal(
    <div aria-live="polite" className="pointer-events-none fixed bottom-5 left-1/2 z-[60] flex w-[min(380px,calc(100vw-32px))] -translate-x-1/2 flex-col gap-2 md:left-24 md:translate-x-0 max-md:bottom-20">
      {items.map((t) => (
        <div
          key={t.id}
          className="rise pointer-events-auto flex items-center gap-3 rounded-lg bg-[var(--ink)] py-3 pl-4 pr-2 text-[13px] text-[var(--paper)] shadow-[var(--shadow)]"
        >
          <span className={`size-2 shrink-0 rounded-full ${dot[t.tone]}`} />
          <span className="flex-1 leading-5">{t.message}</span>
          <button
            onClick={() => onDismiss(t.id)}
            aria-label="Dismiss"
            className="grid size-7 place-items-center rounded-full opacity-60 hover:bg-white/10 hover:opacity-100"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>,
    document.body,
  )
}
