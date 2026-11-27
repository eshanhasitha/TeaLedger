export type AuditLogCategory =
  | 'All'
  | 'Prices'
  | 'Settlements'
  | 'Collections'
  | 'Accounts';

export type AuditLogItemCategory = Exclude<AuditLogCategory, 'All'>;

export interface AuditLogEntry {
  id: string;
  timeLabel: string;
  occurredAtIso: string;
  userName: string;
  action: string;
  recordLabel: string;
  details: string;
  category: AuditLogItemCategory;
}

export interface BackendActivityLogDto {
  id: string;
  actorUserId?: string | null;
  actorName?: string | null;
  userName?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  recordLabel?: string | null;
  details?: string | null;
  occurredAt: string;
}

export interface AuditLogQueryParams {
  search?: string;
  category?: AuditLogCategory;
  page?: number;
  pageSize?: number;
}

export interface AuditLogListResponse {
  items: AuditLogEntry[];
  totalCount: number;
}
