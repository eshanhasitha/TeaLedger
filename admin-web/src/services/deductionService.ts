import { apiClient } from './api';
import type {
  AdminDeductionRecord,
  BackendDeductionDto,
  CreateDeductionPayload,
  DeductionFilterCategory,
  DeductionListResponse,
  DeductionSummaryData,
} from '../types/deduction.types';

export const INITIAL_DEDUCTIONS: AdminDeductionRecord[] = [
  {
    id: 'D-5021',
    deductionCode: 'D-5021',
    farmerId: '8492',
    farmerName: 'Kamal Perera',
    farmerCode: 'TR-8492',
    collectorId: 'C-02',
    category: 'Materials',
    description: 'Materials (fertilizer)',
    quantity: 1,
    unit: 'issue',
    unitPrice: 1800,
    amount: 1800,
    occurredAtIso: '2026-10-10T09:30:00Z',
    occurredAtLabel: '10 Oct 2026',
    postedBy: 'Sunil J.',
    status: 'Posted',
  },
  {
    id: 'D-5020',
    deductionCode: 'D-5020',
    farmerId: '8492',
    farmerName: 'Kamal Perera',
    farmerCode: 'TR-8492',
    collectorId: 'C-02',
    category: 'Loan repayment',
    description: 'Scheduled loan installment',
    quantity: 1,
    unit: 'installment',
    unitPrice: 5000,
    amount: 5000,
    occurredAtIso: '2026-10-08T11:15:00Z',
    occurredAtLabel: '08 Oct 2026',
    postedBy: 'System',
    status: 'Posted',
  },
  {
    id: 'D-5018',
    deductionCode: 'D-5018',
    farmerId: '8451',
    farmerName: 'Priya Kumari',
    farmerCode: 'TR-8451',
    collectorId: 'C-04',
    category: 'Materials',
    description: 'Fertilizer bag issue (reversed)',
    quantity: 1,
    unit: 'bag',
    unitPrice: 3200,
    amount: 3200,
    occurredAtIso: '2026-10-07T14:00:00Z',
    occurredAtLabel: '07 Oct 2026',
    postedBy: 'Sunil J.',
    status: 'Reversed',
  },
  {
    id: 'D-5014',
    deductionCode: 'D-5014',
    farmerId: '8333',
    farmerName: 'Ajith Bandara',
    farmerCode: 'TR-8333',
    collectorId: 'C-04',
    category: 'Materials',
    description: 'Estate store issue',
    quantity: 1,
    unit: 'issue',
    unitPrice: 2400,
    amount: 2400,
    occurredAtIso: '2026-10-03T10:20:00Z',
    occurredAtLabel: '03 Oct 2026',
    postedBy: 'Sunil J.',
    status: 'Posted',
  },
];

export const INITIAL_DEDUCTION_SUMMARY: DeductionSummaryData = {
  from: '2026-10-01',
  to: '2026-10-31',
  deductionCount: 96,
  totalAmount: 184500,
  categories: [
    { category: 'Materials', count: 52, totalAmount: 98000 },
    { category: 'Loan repayment', count: 31, totalAmount: 62500 },
    { category: 'Other', count: 13, totalAmount: 24000 },
  ],
};

let deductionsStore: AdminDeductionRecord[] = [...INITIAL_DEDUCTIONS];

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

function mapCategoryEnumValue(categoryLabel: string): number {
  const lower = categoryLabel.toLowerCase();
  if (lower.includes('material') || lower.includes('fertilizer')) return 1; // Fertilizer
  if (lower.includes('dolomite')) return 2;
  if (lower.includes('tea') || lower.includes('bag')) return 3;
  if (lower.includes('transport')) return 4;
  return 5; // Other
}

function mapDtoToDeduction(dto: BackendDeductionDto): AdminDeductionRecord {
  const normalizedCategory =
    dto.category === 'Fertilizer' || dto.category === 'Dolomite' || dto.category === 'TeaBags'
      ? 'Materials'
      : dto.category;

  return {
    id: dto.id,
    deductionCode: `D-${dto.id.slice(0, 4).toUpperCase()}`,
    farmerId: dto.farmerId,
    farmerName: dto.farmerName,
    farmerCode: dto.farmerCode,
    collectorId: dto.collectorId,
    category: normalizedCategory,
    description: dto.description,
    quantity: Number(dto.quantity),
    unit: dto.unit,
    unitPrice: Number(dto.unitPrice),
    amount: Number(dto.amount),
    occurredAtIso: dto.occurredAt,
    occurredAtLabel: formatDate(dto.occurredAt),
    postedBy: 'Sunil J.',
    status: 'Posted',
    notes: dto.notes ?? undefined,
  };
}

export const deductionService = {
  /**
   * Fetches all deductions for admin review via GET /api/deductions/admin.
   */
  async getAdminDeductions(filters?: {
    search?: string;
    category?: DeductionFilterCategory;
    farmerId?: string;
    collectorId?: string;
    from?: string;
    to?: string;
  }): Promise<DeductionListResponse> {
    const isMock = import.meta.env.VITE_USE_MOCK === 'true';
    let items: AdminDeductionRecord[];

    if (!isMock) {
      const response = await apiClient.get<BackendDeductionDto[]>('/deductions/admin', {
        params: {
          farmerId: filters?.farmerId || undefined,
          collectorId: filters?.collectorId || undefined,
          from: filters?.from || undefined,
          to: filters?.to || undefined,
        },
      });
      items = response.map(mapDtoToDeduction);
    } else {
      await new Promise((resolve) => setTimeout(resolve, 250));
      items = [...deductionsStore];
    }

    if (filters?.search?.trim()) {
      const q = filters.search.toLowerCase().trim();
      items = items.filter(
        (d) =>
          d.deductionCode.toLowerCase().includes(q) ||
          d.farmerName.toLowerCase().includes(q) ||
          d.category.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q)
      );
    }

    if (filters?.category && filters.category !== 'All') {
      items = items.filter((d) => {
        if (filters.category === 'Other') {
          return d.category !== 'Materials' && d.category !== 'Loan repayment';
        }
        return d.category === filters.category;
      });
    }

    const isDefaultUnfiltered =
      isMock &&
      !filters?.search?.trim() &&
      (!filters?.category || filters.category === 'All') &&
      deductionsStore.length === 4;

    return {
      items,
      totalCount: isDefaultUnfiltered ? 96 : items.length,
    };
  },

  /**
   * Posts a new deduction via POST /api/deductions/farmers/{farmerId} when live.
   */
  async createDeduction(payload: CreateDeductionPayload): Promise<AdminDeductionRecord> {
    const isMock = import.meta.env.VITE_USE_MOCK === 'true';

    if (!isMock) {
      const dto = await apiClient.post<BackendDeductionDto>(
        `/deductions/farmers/${payload.farmerId}`,
        {
          category: mapCategoryEnumValue(payload.categoryLabel),
          description: payload.reason?.trim() || payload.categoryLabel,
          quantity: 1,
          unit: 'entry',
          unitPrice: payload.amount,
          occurredAt: new Date(payload.occurredAt).toISOString(),
          notes: payload.reason?.trim() || undefined,
        }
      );
      return mapDtoToDeduction(dto);
    }

    await new Promise((resolve) => setTimeout(resolve, 300));
    const code = payload.referenceCode || `D-${5022 + deductionsStore.length}`;
    const uiCategory = payload.categoryLabel.toLowerCase().includes('material')
      ? 'Materials'
      : payload.categoryLabel.toLowerCase().includes('loan')
      ? 'Loan repayment'
      : 'Other';

    const created: AdminDeductionRecord = {
      id: code,
      deductionCode: code,
      farmerId: payload.farmerId,
      farmerName: payload.farmerName,
      farmerCode: `TR-${payload.farmerId}`,
      collectorId: 'C-02',
      category: uiCategory,
      description: payload.reason?.trim() || payload.categoryLabel,
      quantity: 1,
      unit: 'entry',
      unitPrice: payload.amount,
      amount: payload.amount,
      occurredAtIso: new Date(payload.occurredAt).toISOString(),
      occurredAtLabel: formatDate(payload.occurredAt),
      postedBy: payload.postedBy,
      status: 'Posted',
      notes: payload.reason?.trim() || undefined,
    };

    deductionsStore = [created, ...deductionsStore];
    return created;
  },

  /**
   * Fetches deduction totals & category summary via GET /api/deductions/admin/summary.
   */
  async getAdminSummary(from: string, to: string): Promise<DeductionSummaryData> {
    const isMock = import.meta.env.VITE_USE_MOCK === 'true';

    if (!isMock) {
      return apiClient.get<DeductionSummaryData>('/deductions/admin/summary', {
        params: { from, to },
      });
    }

    await new Promise((resolve) => setTimeout(resolve, 200));
    return INITIAL_DEDUCTION_SUMMARY;
  },
};
