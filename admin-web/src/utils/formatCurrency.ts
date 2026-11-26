const fmt = new Intl.NumberFormat('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const compact = new Intl.NumberFormat('en-LK', { notation: 'compact', maximumFractionDigits: 1 })

export const formatCurrency = (n: number) => `Rs ${fmt.format(n)}`
export const formatCurrencyCompact = (n: number) => `Rs ${compact.format(n)}`
