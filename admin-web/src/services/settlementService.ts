import { apiClient } from './api';
import type {
  BackendSettlementDto,
  BackendSettlementStatus,
  CreateSettlementPayload,
  MonthlySettlementPeriodRow,
  SettlementHistoryResponse,
} from '../types/settlement.types';

export const INITIAL_MONTHLY_SETTLEMENTS: MonthlySettlementPeriodRow[] = [
  {
    id: '2026-10',
    year: 2026,
    month: 10,
    periodLabel: 'October 2026',
    farmersCount: 1428,
    verifiedKg: 84320,
    grossLkr: 8432000,
    netPayableLkr: 5840200,
    finalizedOnLabel: '—',
    status: 'Draft',
    settlementIds: [],
    draftSettlementIds: [],
  },
  {
    id: '2026-09',
    year: 2026,
    month: 9,
    periodLabel: 'September 2026',
    farmersCount: 1419,
    verifiedKg: 81200,
    grossLkr: 7714000,
    netPayableLkr: 5310450,
    finalizedOnLabel: '3 Oct 2026',
    status: 'Finalized',
    settlementIds: [],
    draftSettlementIds: [],
  },
  {
    id: '2026-08',
    year: 2026,
    month: 8,
    periodLabel: 'August 2026',
    farmersCount: 1405,
    verifiedKg: 76540,
    grossLkr: 7041680,
    netPayableLkr: 4890120,
    finalizedOnLabel: '2 Sep 2026',
    status: 'Finalized',
    settlementIds: [],
    draftSettlementIds: [],
  },
  {
    id: '2026-07',
    year: 2026,
    month: 7,
    periodLabel: 'July 2026',
    farmersCount: 1392,
    verifiedKg: 72180,
    grossLkr: 6640560,
    netPayableLkr: 4612800,
    finalizedOnLabel: '2 Aug 2026',
    status: 'Finalized',
    settlementIds: [],
    draftSettlementIds: [],
  },
];

let monthlySettlementsStore: MonthlySettlementPeriodRow[] = [...INITIAL_MONTHLY_SETTLEMENTS];

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function isDraftStatus(status: BackendSettlementStatus): boolean {
  return status === 1 || status === 'Draft';
}

function isPaidStatus(status: BackendSettlementStatus): boolean {
  return status === 2 || status === 'Paid';
}

function formatDateShort(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

function aggregateByMonth(settlements: BackendSettlementDto[]): MonthlySettlementPeriodRow[] {
  const groups = new Map<string, BackendSettlementDto[]>();

  for (const s of settlements) {
    const key = `${s.year}-${String(s.month).padStart(2, '0')}`;
    const bucket = groups.get(key) ?? [];
    bucket.push(s);
    groups.set(key, bucket);
  }

  const rows: MonthlySettlementPeriodRow[] = [];

  for (const [key, list] of groups.entries()) {
    const first = list[0];
    const uniqueFarmers = new Set(list.map((s) => s.farmerId));
    const verifiedKg = list.reduce((sum, s) => sum + Number(s.totalTeaQuantityKg || 0), 0);
    const grossLkr = list.reduce((sum, s) => sum + Number(s.grossTeaIncome || 0), 0);
    const netPayableLkr = list.reduce((sum, s) => sum + Number(s.netSettlementAmount || 0), 0);

    const draftIds = list.filter((s) => isDraftStatus(s.status)).map((s) => s.id);
    const paidDates = list
      .filter((s) => isPaidStatus(s.status) && s.paidAt)
      .map((s) => s.paidAt as string)
      .sort();
    const latestPaidAt = paidDates.length > 0 ? paidDates[paidDates.length - 1] : null;
    const allFinalized = list.length > 0 && draftIds.length === 0;

    rows.push({
      id: key,
      year: first.year,
      month: first.month,
      periodLabel: `${MONTH_NAMES[first.month - 1] ?? `Month ${first.month}`} ${first.year}`,
      farmersCount: uniqueFarmers.size,
      verifiedKg: Math.round(verifiedKg),
      grossLkr: Math.round(grossLkr),
      netPayableLkr: Math.round(netPayableLkr),
      finalizedOnLabel: allFinalized ? formatDateShort(latestPaidAt) : '—',
      status: allFinalized ? 'Finalized' : 'Draft',
      settlementIds: list.map((s) => s.id),
      draftSettlementIds: draftIds,
    });
  }

  return rows.sort((a, b) => (b.year !== a.year ? b.year - a.year : b.month - a.month));
}

export const settlementService = {
  async getMonthlySettlements(filters?: {
    year?: number;
    month?: number;
    status?: string;
  }): Promise<SettlementHistoryResponse> {
    if (import.meta.env.VITE_USE_MOCK === 'true') {
      return {
        items: [...monthlySettlementsStore],
        totalCount: 12,
        rawSettlements: [],
      };
    }

    const raw = await apiClient.get<BackendSettlementDto[]>('/settlements/admin', {
      params: {
        year: filters?.year,
        month: filters?.month,
        status: filters?.status,
      },
    });

    const list = Array.isArray(raw) ? raw : [];
    const aggregated = aggregateByMonth(list);
    return {
      items: aggregated,
      totalCount: aggregated.length,
      rawSettlements: list,
    };
  },

  async createSettlement(payload: CreateSettlementPayload): Promise<BackendSettlementDto> {
    return apiClient.post<BackendSettlementDto>('/settlements', payload);
  },

  async markSettlementPaid(settlementId: string): Promise<BackendSettlementDto> {
    return apiClient.post<BackendSettlementDto>(`/settlements/${settlementId}/pay`);
  },

  async finalizePeriod(row: MonthlySettlementPeriodRow): Promise<void> {
    if (import.meta.env.VITE_USE_MOCK === 'true') {
      const todayLabel = formatDateShort(new Date().toISOString());
      monthlySettlementsStore = monthlySettlementsStore.map((item) =>
        item.id === row.id
          ? {
              ...item,
              status: 'Finalized',
              finalizedOnLabel: todayLabel,
              draftSettlementIds: [],
            }
          : item
      );
      return;
    }

    for (const id of row.draftSettlementIds) {
      await apiClient.post<BackendSettlementDto>(`/settlements/${id}/pay`);
    }
  },

  exportSettlementsCSV(rows: MonthlySettlementPeriodRow[]): void {
    const header = [
      'Period',
      'Farmers',
      'Verified (kg)',
      'Gross (LKR)',
      'Net payable (LKR)',
      'Finalized on',
      'Status',
    ];
    const escapeCell = (val: string | number) =>
      `"${String(val).replace(/"/g, '""')}"`;

    const lines = [
      header.map(escapeCell).join(','),
      ...rows.map((r) =>
        [
          r.periodLabel,
          r.farmersCount,
          r.verifiedKg,
          r.grossLkr,
          r.netPayableLkr,
          r.finalizedOnLabel,
          r.status,
        ]
          .map(escapeCell)
          .join(',')
      ),
    ];

    const csv = lines.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `settlements-history-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
};
