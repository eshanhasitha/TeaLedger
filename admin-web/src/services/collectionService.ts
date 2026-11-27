import { apiClient } from './api';
import type {
  TeaCollectionRecord,
  BackendCollectionDto,
  BackendCollectionStatus,
  CollectionQueryFilters,
  CollectionListResponse,
  CollectionRecordStatus,
} from '../types/collection.types';

export const INITIAL_COLLECTIONS: TeaCollectionRecord[] = [
  {
    id: 'L-4819',
    slipId: 'L-4819',
    dateLabel: '14 Oct',
    collectedAtIso: '2026-10-14T11:42:00Z',
    farmerName: 'Kamal Perera',
    collectorName: 'Nimal Silva',
    grossKg: 26.4,
    reductionsKg: -2.4,
    finalKg: 24.0,
    waterReductionKg: 1.4,
    bagWeightKg: 1.0,
    otherReductionKg: 0,
    status: 'Verified',
  },
  {
    id: 'L-4818',
    slipId: 'L-4818',
    dateLabel: '14 Oct',
    collectedAtIso: '2026-10-14T11:28:00Z',
    farmerName: 'Sunil Fernando',
    collectorName: 'Nimal Silva',
    grossKg: 20.1,
    reductionsKg: -1.6,
    finalKg: 18.5,
    waterReductionKg: 0.8,
    bagWeightKg: 0.8,
    otherReductionKg: 0,
    status: 'Verified',
  },
  {
    id: 'L-4817',
    slipId: 'L-4817',
    dateLabel: '14 Oct',
    collectedAtIso: '2026-10-14T11:15:00Z',
    farmerName: 'Priya Kumari',
    collectorName: 'Rohan Dias',
    grossKg: 33.0,
    reductionsKg: -2.8,
    finalKg: 30.2,
    waterReductionKg: 1.8,
    bagWeightKg: 1.0,
    otherReductionKg: 0,
    status: 'Pending sync',
  },
  {
    id: 'L-4816',
    slipId: 'L-4816',
    dateLabel: '14 Oct',
    collectedAtIso: '2026-10-14T10:55:00Z',
    farmerName: 'Ajith Bandara',
    collectorName: 'Rohan Dias',
    grossKg: 24.5,
    reductionsKg: -2.5,
    finalKg: 22.0,
    waterReductionKg: 1.5,
    bagWeightKg: 1.0,
    otherReductionKg: 0,
    status: 'Verified',
  },
  {
    id: 'L-4815',
    slipId: 'L-4815',
    dateLabel: '14 Oct',
    collectedAtIso: '2026-10-14T10:30:00Z',
    farmerName: 'Mala Jayasinghe',
    collectorName: 'Nimal Silva',
    grossKg: 41.0,
    reductionsKg: -3.2,
    finalKg: 37.8,
    waterReductionKg: 3.1,
    bagWeightKg: 2.0,
    otherReductionKg: 0,
    status: 'Needs review',
    serverReview: {
      grossKg: 41.0,
      reductionsKg: -5.1,
      finalKg: 35.9,
      discrepancyKg: 1.9,
    },
  },
];

let collectionsStore: TeaCollectionRecord[] = [...INITIAL_COLLECTIONS];

function mapBackendStatus(status: BackendCollectionStatus): CollectionRecordStatus {
  if (status === 'Pending' || status === 0) return 'Pending sync';
  if (status === 'Cancelled' || status === 2) return 'Needs review';
  return 'Verified';
}

function formatShortDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
  }).format(d);
}

function mapDtoToRecord(dto: BackendCollectionDto): TeaCollectionRecord {
  const totalReduction =
    Number(dto.waterReduction || 0) +
    Number(dto.bagWeight || 0) +
    Number(dto.otherReduction || 0);
  const expectedFinal = Number((Number(dto.grossWeight) - totalReduction).toFixed(2));
  const discrepancy = Number(Math.abs(expectedFinal - Number(dto.finalWeight)).toFixed(2));
  const status = discrepancy > 0.05 ? 'Needs review' : mapBackendStatus(dto.status);

  return {
    id: dto.id,
    slipId: `L-${dto.id.slice(0, 4).toUpperCase()}`,
    dateLabel: formatShortDate(dto.collectedAt),
    collectedAtIso: dto.collectedAt,
    farmerId: dto.farmerId,
    farmerName: dto.farmerName,
    farmerCode: dto.farmerCode,
    collectorId: dto.collectorId ?? undefined,
    collectorName: dto.collectorName || 'Estate Collector',
    grossKg: Number(dto.grossWeight),
    reductionsKg: totalReduction > 0 ? -totalReduction : 0,
    finalKg: Number(dto.finalWeight),
    waterReductionKg: Number(dto.waterReduction || 0),
    bagWeightKg: Number(dto.bagWeight || 0),
    otherReductionKg: Number(dto.otherReduction || 0),
    pricePerKg: Number(dto.pricePerKg),
    totalAmountLkr: Number(dto.totalAmount),
    status,
    serverReview:
      status === 'Needs review'
        ? {
            grossKg: Number(dto.grossWeight),
            reductionsKg: -totalReduction,
            finalKg: expectedFinal,
            discrepancyKg: discrepancy,
          }
        : undefined,
  };
}

export const collectionService = {
  /**
   * Fetches collections from GET /api/admin/collections with optional date/farmer/search/status filters.
   */
  async getCollections(filters?: CollectionQueryFilters): Promise<CollectionListResponse> {
    const isMock = import.meta.env.VITE_USE_MOCK === 'true';
    const page = filters?.page ?? 1;
    const pageSize = filters?.pageSize ?? 5;

    let records: TeaCollectionRecord[];

    if (!isMock) {
      const response = await apiClient.get<BackendCollectionDto[]>('/admin/collections', {
        params: {
          from: filters?.from || undefined,
          to: filters?.to || undefined,
          farmerId: filters?.farmerId || undefined,
        },
      });
      records = response.map(mapDtoToRecord);
    } else {
      await new Promise((resolve) => setTimeout(resolve, 250));
      records = [...collectionsStore];
    }

    if (filters?.search?.trim()) {
      const q = filters.search.toLowerCase().trim();
      records = records.filter(
        (r) =>
          r.slipId.toLowerCase().includes(q) ||
          r.farmerName.toLowerCase().includes(q) ||
          r.collectorName.toLowerCase().includes(q) ||
          (r.farmerCode && r.farmerCode.toLowerCase().includes(q))
      );
    }

    if (filters?.status && filters.status !== 'All') {
      records = records.filter((r) => r.status === filters.status);
    }

    const isDefaultUnfiltered =
      isMock && !filters?.search?.trim() && (!filters?.status || filters.status === 'All');

    return {
      items: records,
      totalCount: isDefaultUnfiltered ? 184 : records.length,
      page,
      pageSize,
    };
  },

  /**
   * Accepts the server-recalculated weight and resolves a flagged collection slip.
   * Endpoint: POST /api/collections/{id}/verify-weight
   */
  async acceptServerWeight(record: TeaCollectionRecord): Promise<TeaCollectionRecord> {
    const isMock = import.meta.env.VITE_USE_MOCK === 'true';
    const serverGross = record.serverReview?.grossKg ?? record.grossKg;
    const serverReductions = record.serverReview?.reductionsKg ?? record.reductionsKg;
    const serverFinal = record.serverReview?.finalKg ?? record.finalKg;

    if (!isMock) {
      const totalReductionAbs = Math.abs(serverReductions);
      const water = record.waterReductionKg ?? Number((totalReductionAbs * 0.6).toFixed(2));
      const bag = record.bagWeightKg ?? Number((totalReductionAbs - water).toFixed(2));

      const dto = await apiClient.post<BackendCollectionDto>(
        `/collections/${record.id}/verify-weight`,
        {
          grossWeight: serverGross,
          waterReduction: water,
          bagWeight: bag,
          otherReduction: record.otherReductionKg ?? 0,
        }
      );
      return mapDtoToRecord(dto);
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
    const updated: TeaCollectionRecord = {
      ...record,
      grossKg: serverGross,
      reductionsKg: serverReductions,
      finalKg: serverFinal,
      status: 'Verified',
      serverReview: undefined,
    };

    collectionsStore = collectionsStore.map((c) => (c.id === record.id ? updated : c));
    return updated;
  },

  /**
   * Flags a collection slip back to the collector for physical recheck.
   */
  async requestRecheck(record: TeaCollectionRecord): Promise<TeaCollectionRecord> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const updated: TeaCollectionRecord = {
      ...record,
      status: 'Pending sync',
    };
    collectionsStore = collectionsStore.map((c) => (c.id === record.id ? updated : c));
    return updated;
  },

  /**
   * Exports collections CSV via GET /api/reports/collections/export or local fallback.
   */
  async exportCollectionsCSV(records: TeaCollectionRecord[] = collectionsStore): Promise<void> {
    const isMock = import.meta.env.VITE_USE_MOCK === 'true';

    if (!isMock) {
      const baseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/+$/, '');
      window.open(`${baseUrl}/reports/collections/export`, '_blank');
      return;
    }

    const headers = [
      'Slip',
      'Date',
      'Farmer',
      'Collector',
      'Gross (kg)',
      'Reductions (kg)',
      'Final (kg)',
      'Status',
    ];
    const rows = records.map((r) => [
      r.slipId,
      `"${r.dateLabel}"`,
      `"${r.farmerName.replace(/"/g, '""')}"`,
      `"${r.collectorName.replace(/"/g, '""')}"`,
      r.grossKg.toFixed(2),
      r.reductionsKg.toFixed(2),
      r.finalKg.toFixed(2),
      r.status,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `TeaLedger_Collections_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
};
