import { useContext } from 'react'
import { LedgerContext } from '../context/LedgerContext'

export function useLedger() {
  const ctx = useContext(LedgerContext)
  if (!ctx) throw new Error('useLedger must be used inside <LedgerProvider>')
  return ctx
}
