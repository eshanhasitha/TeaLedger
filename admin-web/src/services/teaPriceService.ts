import { apiClient } from './api';
import type {
  TeaPriceRecord,
  BackendTeaPriceDto,
  SetMonthlyTeaPricePayload,
  TeaPriceStatus,
} from '../types/teaPrice.types';

export const INITIAL_TEA_PRICES: TeaPriceRecord[] = [
  {
    id: 'tp-01',
    year: 2026,
    month: 12,
    effectiveFromIso: '2026-12-01',
    effectiveFromLabel: '1 Dec 2026',
    pricePerKg: 105.0,
    setBy: 'Sunil Jayawardena',
    changedOnLabel: '14 Nov 2026',
    status: 'Scheduled',
    appliesTo: 'All areas',
  },
  {
    id: 'tp-02',
    year: 2026,
    month: 10,
    effectiveFromIso: '2026-10-01',
    effectiveFromLabel: '1 Oct 2026',
    pricePerKg: 100.0,
    setBy: 'Sunil Jayawardena',
    changedOnLabel: '28 Sep 2026',
    status: 'Current',
    appliesTo: 'All areas',
  },
  {
    id: 'tp-03',
    year: 2026,
    month: 9,
    effectiveFromIso: '2026-09-01',
    effectiveFromLabel: '1 Sep 2026',
    pricePerKg: 95.0,
    setBy: 'Sunil Jayawardena',
    changedOnLabel: '29 Aug 2026',
    status: 'Past',
    appliesTo: 'All areas',
  },
  {
    id: 'tp-04',
    year: 2026,
    month: 8,
    effectiveFromIso: '2026-08-01',
    effectiveFromLabel: '1 Aug 2026',
    pricePerKg: 92.0,
    setBy: 'Sunil Jayawardena',
    changedOnLabel: '30 Jul 2026',
    status: 'Past',
    appliesTo: 'All areas',
  },
];

let teaPricesStore: TeaPriceRecord[] = [...INITIAL_TEA_PRICES];

function formatDisplayDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function determineStatus(effectiveFromIso: string, index: number, currentIso: string): TeaPriceStatus {
  const eff = new Date(effectiveFromIso).getTime();
  const now = new Date(currentIso).getTime();
  if (eff > now) return 'Scheduled';
  if (index === 0) return 'Current';
  return 'Past';
}

function mapDtoToRecord(
  dto: BackendTeaPriceDto,
  index: number,
  adminName = 'Estate Administrator'
): TeaPriceRecord {
  const todayIso = new Date().toISOString().split('T')[0];
  return {
    id: dto.id,
    collectorId: dto.collectorId,
    year: dto.year,
    month: dto.month,
    effectiveFromIso: dto.effectiveFrom,
    effectiveFromLabel: formatDisplayDate(dto.effectiveFrom),
    pricePerKg: Number(dto.pricePerKg),
    setBy: adminName,
    changedOnLabel: formatDisplayDate(dto.updatedAt || dto.createdAt),
    status: determineStatus(dto.effectiveFrom, index, todayIso),
    appliesTo: 'Selected collector',
  };
}

export const teaPriceService = {
  /**
   * Fetches tea price history for a selected collector via
   * GET /api/tea-prices/admin/collectors/{collectorId}/history
   */
  async getPriceHistory(collectorId?: string, adminName?: string): Promise<TeaPriceRecord[]> {
    const isMock = import.meta.env.VITE_USE_MOCK === 'true';

    if (!isMock && collectorId) {
      const response = await apiClient.get<BackendTeaPriceDto[]>(
        `/tea-prices/admin/collectors/${collectorId}/history`
      );
      return response.map((dto, idx) => mapDtoToRecord(dto, idx, adminName));
    }

    await new Promise((resolve) => setTimeout(resolve, 200));
    return [...teaPricesStore];
  },

  /**
   * Sets a monthly tea price via PUT /api/tea-prices/admin/collectors/{collectorId}/monthly
   */
  async setMonthlyPrice(params: {
    collectorId?: string;
    appliesToLabel: string;
    pricePerKg: number;
    effectiveFrom: string;
    setBy: string;
  }): Promise<TeaPriceRecord> {
    const isMock = import.meta.env.VITE_USE_MOCK === 'true';
    const effDate = new Date(params.effectiveFrom);
    const year = effDate.getFullYear();
    const month = effDate.getMonth() + 1;

    const payload: SetMonthlyTeaPricePayload = {
      year,
      month,
      pricePerKg: params.pricePerKg,
      effectiveFrom: effDate.toISOString(),
    };

    if (!isMock && params.collectorId) {
      const dto = await apiClient.put<BackendTeaPriceDto>(
        `/tea-prices/admin/collectors/${params.collectorId}/monthly`,
        payload
      );
      return mapDtoToRecord(dto, 0, params.setBy);
    }

    await new Promise((resolve) => setTimeout(resolve, 300));
    const now = new Date();
    const isFuture = effDate.getTime() > now.getTime();
    const newRecord: TeaPriceRecord = {
      id: `tp-${Date.now()}`,
      collectorId: params.collectorId,
      year,
      month,
      effectiveFromIso: params.effectiveFrom,
      effectiveFromLabel: formatDisplayDate(params.effectiveFrom),
      pricePerKg: params.pricePerKg,
      setBy: params.setBy,
      changedOnLabel: formatDisplayDate(now.toISOString()),
      status: isFuture ? 'Scheduled' : 'Current',
      appliesTo: params.appliesToLabel,
    };

    if (!isFuture) {
      teaPricesStore = teaPricesStore.map((item) =>
        item.status === 'Current' ? { ...item, status: 'Past' as const } : item
      );
    }

    teaPricesStore = [newRecord, ...teaPricesStore];
    return newRecord;
  },
};
