import React, { useState, useEffect } from 'react';
import {
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useDashboard } from '../../hooks/useDashboard';
import { activityLogService, INITIAL_AUDIT_LOGS } from '../../services/activityLogService';
import type { AuditLogCategory, AuditLogEntry } from '../../types/activityLog.types';

const CATEGORY_TABS: AuditLogCategory[] = [
  'All',
  'Prices',
  'Settlements',
  'Collections',
  'Accounts',
];

function formatNumber(val: number): string {
  return new Intl.NumberFormat('en-US').format(val);
}

export const ActivityLogsPage: React.FC = () => {
  const { addToast } = useDashboard();

  const [logs, setLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [totalCount, setTotalCount] = useState<number>(2310);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<AuditLogCategory>('All');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  const pageSize = 5;

  const refreshLogs = (search: string, category: AuditLogCategory, page: number) => {
    setNoticeMessage(null);

    activityLogService
      .getAuditLogs({ search, category, page, pageSize })
      .then((res) => {
        setLogs(res.items);
        setTotalCount(res.totalCount);
      })
      .catch(() => {
        const query = search.trim().toLowerCase();
        const fallbackFiltered = INITIAL_AUDIT_LOGS.filter((entry) => {
          const matchesCat = category === 'All' || entry.category === category;
          if (!matchesCat) return false;
          if (!query) return true;
          return (
            entry.userName.toLowerCase().includes(query) ||
            entry.recordLabel.toLowerCase().includes(query) ||
            entry.action.toLowerCase().includes(query) ||
            entry.details.toLowerCase().includes(query)
          );
        });
        setLogs(fallbackFiltered.slice((page - 1) * pageSize, page * pageSize));
        setTotalCount(!query && category === 'All' ? 2310 : fallbackFiltered.length);
        setNoticeMessage('Showing sample audit entries (backend audit endpoint not yet active).');
      });
  };

  useEffect(() => {
    let ignore = false;

    activityLogService
      .getAuditLogs({
        search: searchQuery,
        category: activeCategory,
        page: currentPage,
        pageSize,
      })
      .then((res) => {
        if (!ignore) {
          setLogs(res.items);
          setTotalCount(res.totalCount);
          setNoticeMessage(null);
        }
      })
      .catch(() => {
        if (!ignore) {
          const query = searchQuery.trim().toLowerCase();
          const fallbackFiltered = INITIAL_AUDIT_LOGS.filter((entry) => {
            const matchesCat = activeCategory === 'All' || entry.category === activeCategory;
            if (!matchesCat) return false;
            if (!query) return true;
            return (
              entry.userName.toLowerCase().includes(query) ||
              entry.recordLabel.toLowerCase().includes(query) ||
              entry.action.toLowerCase().includes(query) ||
              entry.details.toLowerCase().includes(query)
            );
          });
          setLogs(fallbackFiltered.slice((currentPage - 1) * pageSize, currentPage * pageSize));
          setTotalCount(!query && activeCategory === 'All' ? 2310 : fallbackFiltered.length);
          setNoticeMessage('Showing sample audit entries (backend audit endpoint not yet active).');
        }
      });

    return () => {
      ignore = true;
    };
  }, [searchQuery, activeCategory, currentPage]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const startEntry = logs.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endEntry = Math.min(startEntry + logs.length - 1, totalCount);

  const handleExport = () => {
    activityLogService.exportAuditLogsCSV(logs);
    addToast({
      type: 'success',
      title: 'Export Complete',
      message: 'Audit log exported as CSV.',
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Audit log</h1>
          <p className="text-sm text-text-muted mt-0.5">
            Every price, weight, settlement and account change
          </p>
        </div>

        <button
          type="button"
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-text-primary bg-surface-card border border-border-default rounded-lg hover:bg-surface-muted transition-colors self-start sm:self-auto shadow-xs cursor-pointer"
        >
          <Download className="w-4 h-4 text-text-secondary" />
          Export
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-surface-card border border-border-default rounded-xl p-4 shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by user or record"
            aria-label="Search audit log by user or record"
            className="w-full pl-10 pr-4 py-2 bg-surface-card border border-border-default rounded-lg text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {CATEGORY_TABS.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setActiveCategory(cat);
                  setCurrentPage(1);
                }}
                className={`px-3.5 py-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-brand-primary text-text-on-primary border-brand-primary font-semibold'
                    : 'bg-surface-card text-text-secondary border-border-default hover:bg-surface-muted'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Offline/Endpoint Notice Banner */}
      {noticeMessage && (
        <div className="bg-status-warning-bg border border-status-warning-text/20 text-status-warning-text rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{noticeMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => refreshLogs(searchQuery, activeCategory, currentPage)}
            className="inline-flex items-center gap-1.5 font-semibold underline hover:no-underline cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      )}

      {/* Audit Log Table Card */}
      <div className="bg-surface-card border border-border-default rounded-xl shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[780px]">
            <thead>
              <tr className="border-b border-border-subtle text-xs font-medium text-text-muted">
                <th className="py-3.5 px-5 font-medium">Time</th>
                <th className="py-3.5 px-4 font-medium">User</th>
                <th className="py-3.5 px-4 font-medium">Action</th>
                <th className="py-3.5 px-4 font-medium">Record</th>
                <th className="py-3.5 px-5 font-medium">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle text-sm">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 px-5 text-center text-text-muted">
                    No audit entries match your search.
                  </td>
                </tr>
              ) : (
                logs.map((entry) => (
                  <tr key={entry.id} className="hover:bg-surface-muted/40 transition-colors">
                    <td className="py-4 px-5 text-text-muted whitespace-nowrap">
                      {entry.timeLabel}
                    </td>
                    <td className="py-4 px-4 font-medium text-text-primary whitespace-nowrap">
                      {entry.userName}
                    </td>
                    <td className="py-4 px-4 text-text-secondary whitespace-nowrap">
                      {entry.action}
                    </td>
                    <td className="py-4 px-4 font-semibold text-text-primary whitespace-nowrap">
                      {entry.recordLabel}
                    </td>
                    <td className="py-4 px-5 text-text-secondary">
                      {entry.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-5 py-3.5 border-t border-border-subtle flex items-center justify-between gap-4">
          <p className="text-xs text-text-muted">
            Showing {startEntry}–{endEntry} of {formatNumber(totalCount)}
          </p>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              aria-label="Previous page"
              className="w-8 h-8 inline-flex items-center justify-center rounded-lg border border-border-default text-text-secondary hover:bg-surface-muted disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage(1)}
              className={`w-8 h-8 inline-flex items-center justify-center rounded-lg text-xs font-semibold cursor-pointer ${
                currentPage === 1
                  ? 'bg-brand-primary text-text-on-primary'
                  : 'border border-border-default text-text-secondary hover:bg-surface-muted'
              }`}
            >
              1
            </button>
            {totalPages > 1 && currentPage > 1 && (
              <button
                type="button"
                className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-xs font-semibold bg-brand-primary text-text-on-primary"
              >
                {currentPage}
              </button>
            )}
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              aria-label="Next page"
              className="w-8 h-8 inline-flex items-center justify-center rounded-lg border border-border-default text-text-secondary hover:bg-surface-muted disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityLogsPage;
