import { createContext, useCallback, useState, type ReactNode } from 'react'
import { Toasts } from '../components/ui/Toast'

export type Tone = 'success' | 'info' | 'danger'
export interface ToastItem {
  id: number
  message: string
  tone: Tone
}

interface Api {
  notify: (message: string, tone?: Tone) => void
}

// eslint-disable-next-line react-refresh/only-export-components
export const NotificationContext = createContext<Api | null>(null)

let seq = 0

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])

  const dismiss = useCallback((id: number) => setItems((xs) => xs.filter((x) => x.id !== id)), [])

  const notify = useCallback<Api['notify']>(
    (message, tone = 'success') => {
      const id = ++seq
      setItems((xs) => [...xs.slice(-3), { id, message, tone }])
      setTimeout(() => dismiss(id), 4200)
    },
    [dismiss],
  )

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      <Toasts items={items} onDismiss={dismiss} />
    </NotificationContext.Provider>
  )
}
