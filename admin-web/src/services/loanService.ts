import { apiClient } from './api';
import type {
  AdminLoanRecord,
  BackendLoanDto,
  CreateLoanPayload,
  LoanRecordStatus,
  LoansOverviewResponse,
} from '../types/loan.types';

export const INITIAL_LOANS: AdminLoanRecord[] = [
  {
    id: 'A-112',
    loanCode: 'A-112',
    farmerId: '8492',
    farmerName: 'Kamal Perera',
    farmerCode: 'TR-8492',
    principalAmount: 40000,
    totalRepaid: 10000,
    outstandingBalance: 30000,
    nextRepaymentLabel: '22 Oct 2026',
    issuedAtIso: '2026-09-15T08:00:00Z',
    status: 'Active',
  },
  {
    id: 'A-131',
    loanCode: 'A-131',
    farmerId: '8333',
    farmerName: 'Ajith Bandara',
    farmerCode: 'TR-8333',
    principalAmount: 60000,
    totalRepaid: 18000,
    outstandingBalance: 42000,
    nextRepaymentLabel: '22 Oct 2026',
    issuedAtIso: '2026-09-10T08:00:00Z',
    status: 'Active',
  },
  {
    id: 'A-120',
    loanCode: 'A-120',
    farmerId: '8451',
    farmerName: 'Priya Kumari',
    farmerCode: 'TR-8451',
    principalAmount: 25000,
    totalRepaid: 12500,
    outstandingBalance: 12500,
    nextRepaymentLabel: '22 Oct 2026',
    issuedAtIso: '2026-08-20T08:00:00Z',
    status: 'Overdue',
  },
  {
    id: 'A-087',
    loanCode: 'A-087',
    farmerId: '8510',
    farmerName: 'Sunil Fernando',
    farmerCode: 'TR-8510',
    principalAmount: 20000,
    totalRepaid: 20000,
    outstandingBalance: 0,
    nextRepaymentLabel: '—',
    issuedAtIso: '2026-07-05T08:00:00Z',
    status: 'Repaid',
  },
];

let loansStore: AdminLoanRecord[] = [...INITIAL_LOANS];

function formatMillions(amount: number): string {
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(0)}K`;
  }
  return amount.toLocaleString();
}

function mapLoanStatus(status: string | number, outstanding: number): LoanRecordStatus {
  if (outstanding <= 0 || status === 'Closed' || status === 2) return 'Repaid';
  if (status === 'Cancelled' || status === 3) return 'Cancelled';
  return 'Active';
}

function formatNextRepayment(issuedAtIso: string, status: LoanRecordStatus): string {
  if (status === 'Repaid' || status === 'Closed' || status === 'Cancelled') return '—';
  const d = new Date(issuedAtIso);
  if (Number.isNaN(d.getTime())) return '—';
  d.setMonth(d.getMonth() + 1);
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

function mapDtoToLoan(dto: BackendLoanDto): AdminLoanRecord {
  const outstanding = Number(dto.outstandingBalance);
  const mappedStatus = mapLoanStatus(dto.status, outstanding);
  return {
    id: dto.id,
    loanCode: `A-${dto.id.slice(0, 3).toUpperCase()}`,
    farmerId: dto.farmerId,
    farmerName: dto.farmerName,
    farmerCode: dto.farmerCode,
    collectorId: dto.collectorId,
    principalAmount: Number(dto.principalAmount),
    totalRepaid: Number(dto.totalRepaid),
    outstandingBalance: outstanding,
    nextRepaymentLabel: formatNextRepayment(dto.issuedAt, mappedStatus),
    issuedAtIso: dto.issuedAt,
    status: mappedStatus,
    notes: dto.notes ?? undefined,
  };
}

export const loanService = {
  /**
   * Fetches all admin loans via GET /api/loans/admin.
   */
  async getAdminLoans(filters?: {
    farmerId?: string;
    collectorId?: string;
  }): Promise<LoansOverviewResponse> {
    const isMock = import.meta.env.VITE_USE_MOCK === 'true';

    if (!isMock) {
      const response = await apiClient.get<BackendLoanDto[]>('/loans/admin', {
        params: {
          farmerId: filters?.farmerId || undefined,
          collectorId: filters?.collectorId || undefined,
        },
      });
      const items = response.map(mapDtoToLoan);
      const activeCount = items.filter((l) => l.status === 'Active' || l.status === 'Overdue').length;
      const outstandingSum = items.reduce((sum, l) => sum + l.outstandingBalance, 0);
      const repaidSum = items.reduce((sum, l) => sum + l.totalRepaid, 0);

      return {
        items,
        activeLoansCount: activeCount,
        totalFarmersCount: 1428,
        outstandingTotalLkr: outstandingSum,
        outstandingFormatted: formatMillions(outstandingSum),
        repaidThisMonthLkr: repaidSum,
        repaidThisMonthFormatted: formatMillions(repaidSum),
        asOfLabel: new Intl.DateTimeFormat('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }).format(new Date()),
        totalCount: items.length,
      };
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
    const isDefaultUnfiltered = !filters?.farmerId && !filters?.collectorId && loansStore.length === 4;

    return {
      items: [...loansStore],
      activeLoansCount: isDefaultUnfiltered ? 212 : loansStore.filter((l) => l.status !== 'Repaid').length,
      totalFarmersCount: 1428,
      outstandingTotalLkr: 6400000,
      outstandingFormatted: isDefaultUnfiltered
        ? '6.4M'
        : formatMillions(loansStore.reduce((sum, l) => sum + l.outstandingBalance, 0)),
      repaidThisMonthLkr: 900000,
      repaidThisMonthFormatted: '0.9M',
      asOfLabel: '14 Nov 2026',
      totalCount: isDefaultUnfiltered ? 212 : loansStore.length,
    };
  },

  /**
   * Issues a new farmer loan (uses POST /api/loans/farmers/{farmerId} when live).
   */
  async createLoan(payload: CreateLoanPayload): Promise<AdminLoanRecord> {
    const isMock = import.meta.env.VITE_USE_MOCK === 'true';

    if (!isMock) {
      const dto = await apiClient.post<BackendLoanDto>(`/loans/farmers/${payload.farmerId}`, {
        principalAmount: payload.principalAmount,
        issuedAt: payload.issuedAt || new Date().toISOString(),
        notes: payload.notes,
      });
      return mapDtoToLoan(dto);
    }

    await new Promise((resolve) => setTimeout(resolve, 300));
    const nextCode = `A-${140 + loansStore.length}`;
    const issuedIso = payload.issuedAt || new Date().toISOString();
    const created: AdminLoanRecord = {
      id: nextCode,
      loanCode: nextCode,
      farmerId: payload.farmerId,
      farmerName: payload.farmerName,
      principalAmount: payload.principalAmount,
      totalRepaid: 0,
      outstandingBalance: payload.principalAmount,
      nextRepaymentLabel: formatNextRepayment(issuedIso, 'Active'),
      issuedAtIso: issuedIso,
      status: 'Active',
      notes: payload.notes,
    };

    loansStore = [created, ...loansStore];
    return created;
  },
};
