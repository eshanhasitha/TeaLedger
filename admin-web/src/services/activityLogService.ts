import { apiClient } from './api';
import type {
  AuditLogCategory,
  AuditLogEntry,
  AuditLogItemCategory,
  AuditLogListResponse,
  AuditLogQueryParams,
  BackendActivityLogDto,
} from '../types/activityLog.types';

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'log-01',
    timeLabel: '14 Nov 2026, 16:02',
    occurredAtIso: '2026-11-14T16:02:00Z',
    userName: 'Sunil Jayawardena',
    action: 'Tea price scheduled',
    recordLabel: 'Price 1 Dec',
    details: 'LKR 105.00/kg for all areas',
    category: 'Prices',
  },
  {
    id: 'log-02',
    timeLabel: '14 Nov 2026, 11:45',
    occurredAtIso: '2026-11-14T11:45:00Z',
    userName: 'Rohan Dias',
    action: 'Loan issued',
    recordLabel: 'LN-109',
    details: 'LKR 45,000 for Ruwan Silva',
    category: 'Accounts',
  },
  {
    id: 'log-03',
    timeLabel: '14 Nov 2026, 10:15',
    occurredAtIso: '2026-11-14T10:15:00Z',
    userName: 'Kamal Perera (Admin)',
    action: 'Weight discrepancy approved',
    recordLabel: 'Slip L-4812',
    details: 'Gross 38.0 -> Final 35.2 kg',
    category: 'Collections',
  },
  {
    id: 'log-04',
    timeLabel: '13 Nov 2026, 18:30',
    occurredAtIso: '2026-11-13T18:30:00Z',
    userName: 'Nimal Silva',
    action: 'Offline collection synced',
    recordLabel: 'Slip L-4811',
    details: 'Synced after 4h offline',
    category: 'Collections',
  },
  {
    id: 'log-05',
    timeLabel: '13 Nov 2026, 15:10',
    occurredAtIso: '2026-11-13T15:10:00Z',
    userName: 'Sunil Jayawardena',
    action: 'Deduction added',
    recordLabel: 'DED-401',
    details: 'Tea packets LKR 3,000 for Kamal P.',
    category: 'Settlements',
  },
];

function inferCategory(entityType: string, action: string): AuditLogItemCategory {
  const lower = `${entityType} ${action}`.toLowerCase();
  if (lower.includes('price')) return 'Prices';
  if (lower.includes('settlement') || lower.includes('deduction')) return 'Settlements';
  if (lower.includes('collection') || lower.includes('weight')) return 'Collections';
  return 'Accounts';
}

function formatLogTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const datePart = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d);
  const timePart = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(d);
  return `${datePart}, ${timePart}`;
}

function mapDtoToEntry(dto: BackendActivityLogDto): AuditLogEntry {
  return {
    id: dto.id,
    timeLabel: formatLogTime(dto.occurredAt),
    occurredAtIso: dto.occurredAt,
    userName: dto.actorName || dto.userName || 'System Admin',
    action: dto.action,
    recordLabel:
      dto.recordLabel ||
      (dto.entityId ? `${dto.entityType} ${dto.entityId.slice(0, 6)}` : dto.entityType),
    details: dto.details || '—',
    category: inferCategory(dto.entityType, dto.action),
  };
}

function filterMockLogs(
  logs: AuditLogEntry[],
  search: string,
  category: AuditLogCategory
): AuditLogEntry[] {
  const query = search.trim().toLowerCase();
  return logs.filter((entry) => {
    const matchesCategory = category === 'All' || entry.category === category;
    if (!matchesCategory) return false;
    if (!query) return true;
    return (
      entry.userName.toLowerCase().includes(query) ||
      entry.recordLabel.toLowerCase().includes(query) ||
      entry.action.toLowerCase().includes(query) ||
      entry.details.toLowerCase().includes(query)
    );
  });
}

export const activityLogService = {
  async getAuditLogs(params: AuditLogQueryParams = {}): Promise<AuditLogListResponse> {
    const search = params.search ?? '';
    const category = params.category ?? 'All';
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 5;

    if (import.meta.env.VITE_USE_MOCK === 'true') {
      const filtered = filterMockLogs(INITIAL_AUDIT_LOGS, search, category);
      const isUnfilteredDefault = !search.trim() && category === 'All';
      return {
        items: filtered.slice((page - 1) * pageSize, page * pageSize),
        totalCount: isUnfilteredDefault ? 2310 : filtered.length,
      };
    }

    const response = await apiClient.get<
      | { items?: BackendActivityLogDto[]; totalCount?: number }
      | BackendActivityLogDto[]
    >('/admin/activity-logs', {
      params: {
        search: search.trim() || undefined,
        category: category === 'All' ? undefined : category,
        page,
        pageSize,
      },
    });

    if (Array.isArray(response)) {
      const mapped = response.map(mapDtoToEntry);
      const filtered = filterMockLogs(mapped, search, category);
      return {
        items: filtered.slice((page - 1) * pageSize, page * pageSize),
        totalCount: filtered.length,
      };
    }

    const mapped = Array.isArray(response?.items) ? response.items.map(mapDtoToEntry) : [];
    return {
      items: mapped,
      totalCount: typeof response?.totalCount === 'number' ? response.totalCount : mapped.length,
    };
  },

  exportAuditLogsCSV(entries: AuditLogEntry[]): void {
    const header = ['Time', 'User', 'Action', 'Record', 'Details', 'Category'];
    const escapeCell = (val: string) => `"${val.replace(/"/g, '""')}"`;

    const lines = [
      header.map(escapeCell).join(','),
      ...entries.map((row) =>
        [row.timeLabel, row.userName, row.action, row.recordLabel, row.details, row.category]
          .map(escapeCell)
          .join(',')
      ),
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
};
