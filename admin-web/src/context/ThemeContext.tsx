import { createContext, useEffect, useState, type ReactNode } from 'react'
import { THEME_KEY } from '../utils/constants'

export type ThemePref = 'light' | 'dark' | 'system'
interface Api {
  pref: ThemePref
  resolved: 'light' | 'dark'
  setPref: (p: ThemePref) => void
}

// eslint-disable-next-line react-refresh/only-export-components
export const ThemeContext = createContext<Api | null>(null)

const mq = () => window.matchMedia('(prefers-color-scheme: dark)')

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [pref, setPrefState] = useState<ThemePref>(() => {
    try {
      return (localStorage.getItem(THEME_KEY) as ThemePref) || 'system'
    } catch {
      return 'system'
    }
  })
  const [systemDark, setSystemDark] = useState(() => mq().matches)

  useEffect(() => {
    const m = mq()
    const on = (e: MediaQueryListEvent) => setSystemDark(e.matches)
    m.addEventListener('change', on)
    return () => m.removeEventListener('change', on)
  }, [])

  const resolved = pref === 'system' ? (systemDark ? 'dark' : 'light') : pref

  useEffect(() => {
    document.documentElement.dataset.theme = resolved
  }, [resolved])

  const setPref = (p: ThemePref) => {
    setPrefState(p)
    try {
      localStorage.setItem(THEME_KEY, p)
    } catch {
      /* ignore */
    }
  }

  return <ThemeContext.Provider value={{ pref, resolved, setPref }}>{children}</ThemeContext.Provider>
}
