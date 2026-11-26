export interface NavItem {
  path: string
  label: string
  short: string
  /** steep depth for the thumb-index tab, pale → dark */
  steep: number
}

export const navigation: NavItem[] = [
  { path: '/', label: 'Overview', short: 'Ov', steep: 1 },
  { path: '/collections', label: 'Collections', short: 'Co', steep: 2 },
  { path: '/farmers', label: 'Farmers', short: 'Fa', steep: 3 },
  { path: '/collectors', label: 'Collectors', short: 'Cl', steep: 4 },
  { path: '/settlements', label: 'Settlements', short: 'Se', steep: 5 },
  { path: '/reports', label: 'Reports', short: 'Re', steep: 6 },
  { path: '/activity', label: 'Activity', short: 'Ac', steep: 7 },
  { path: '/settings', label: 'Settings', short: 'St', steep: 8 },
]

export const folioOf = (pathname: string) => {
  const idx = navigation.findIndex((n) => (n.path === '/' ? pathname === '/' : pathname.startsWith(n.path)))
  return idx < 0 ? 0 : idx
}
