const one = new Intl.NumberFormat('en-LK', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const int = new Intl.NumberFormat('en-LK', { maximumFractionDigits: 0 })

export const formatKg = (n: number) => `${one.format(n)} kg`
export const formatNumber = (n: number, decimals = 0) =>
  decimals === 0 ? int.format(n) : n.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
export const round2 = (n: number) => Math.round(n * 100) / 100
