import React, { useState, useEffect } from 'react';
import {
  Download,
  Clock,
  Check,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  X,
  Loader2,
} from 'lucide-react';
import { useDashboard } from '../../hooks/useDashboard';
import {
  settlementService,
  INITIAL_MONTHLY_SETTLEMENTS,
} from '../../services/settlementService';
import type { MonthlySettlementPeriodRow } from '../../types/settlement.types';

function formatNumber(val: number): string {
  return new Intl.NumberFormat('en-US').format(val);
}

export const SettlementsPage: React.FC = () => {
  const { addToast } = useDashboard();

  const [rows, setRows] = useState<MonthlySettlementPeriodRow[]>(INITIAL_MONTHLY_SETTLEMENTS);
  const [totalCount, setTotalCount] = useState<number>(12);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<MonthlySettlementPeriodRow | null>(null);
  const [isFinalizing, setIsFinalizing] = useState<boolean>(false);

  const pageSize = 4;

  const loadSettlements = () => {
    setIsLoading(true);
    setErrorMessage(null);

    settlementService
      .getMonthlySettlements()
      .then((res) => {
        setRows(res.items);
        setTotalCount(res.totalCount);
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        setErrorMessage(
          err instanceof Error ? err.message : 'Failed to load settlements from backend.'
        );
        setRows(INITIAL_MONTHLY_SETTLEMENTS);
        setTotalCount(12);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    let ignore = false;

    settlementService
      .getMonthlySettlements()
      .then((res) => {
        if (!ignore) {
          setRows(res.items);
          setTotalCount(res.totalCount);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          setErrorMessage(
            err instanceof Error ? err.message : 'Failed to load settlements from backend.'
          );
          setRows(INITIAL_MONTHLY_SETTLEMENTS);
          setTotalCount(12);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const totalPages = Math.max(1, Math.ceil(Math.max(totalCount, rows.length) / pageSize));
  const pagedRows = rows.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const startEntry = rows.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endEntry = Math.min(currentPage * pageSize, Math.max(totalCount, rows.length));
  const displayedTotal = Math.max(totalCount, rows.length);

  const handleExportCsv = () => {
    settlementService.exportSettlementsCSV(rows);
    addToast({
      type: 'success',
      title: 'Export Complete',
      message: 'Settlement history exported as CSV.',
    });
  };

  const handleFinalizePeriod = async (row: MonthlySettlementPeriodRow) => {
    setIsFinalizing(true);
    try {
      await settlementService.finalizePeriod(row);
      addToast({
        type: 'success',
        title: 'Settlement Finalized',
        message: `${row.periodLabel} settlements finalized.`,
      });
      setSelectedPeriod(null);
      loadSettlements();
    } catch (err: unknown) {
      addToast({
        type: 'error',
        title: 'Finalization Failed',
        message:
          err instanceof Error ? err.message : 'Unable to finalize settlement period.',
      });
    } finally {
      setIsFinalizing(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Settlements</h1>
          <p className="text-sm text-text-muted mt-0.5">
            Monthly payouts across all tea farmers
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCsv}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-text-primary bg-surface-card border border-border-default rounded-lg hover:bg-surface-muted transition-colors self-start sm:self-auto shadow-xs cursor-pointer"
        >
          <Download className="w-4 h-4 text-text-secondary" />
          Export CSV
        </button>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="bg-status-error-bg border border-status-error-text/20 text-status-error-text rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage} (Showing fallback sample periods.)</span>
          </div>
          <button
            type="button"
            onClick={loadSettlements}
            className="inline-flex items-center gap-1.5 font-semibold underline hover:no-underline cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      )}

      {/* Monthly Settlement History Card */}
      <div className="bg-surface-card border border-border-default rounded-xl shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] overflow-hidden">
        <div className="px-5 py-4 border-b border-border-subtle flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-text-primary">
            Monthly settlement history
          </h2>
          {isLoading && (
            <span className="inline-flex items-center gap-1.5 text-xs text-text-muted">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Refreshing
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[780px]">
            <thead>
              <tr className="border-b border-border-subtle text-xs font-medium text-text-muted">
                <th className="py-3 px-5 font-medium">Period</th>
                <th className="py-3 px-4 font-medium text-right">Farmers</th>
                <th className="py-3 px-4 font-medium text-right">Verified (kg)</th>
                <th className="py-3 px-4 font-medium text-right">Gross (LKR)</th>
                <th className="py-3 px-4 font-medium text-right">Net payable (LKR)</th>
                <th className="py-3 px-5 font-medium">Finalized on</th>
                <th className="py-3 px-5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle text-sm">
              {pagedRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 px-5 text-center text-text-muted">
                    No settlement periods found.
                  </td>
                </tr>
              ) : (
                pagedRows.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => setSelectedPeriod(row)}
                    className="hover:bg-surface-muted/50 transition-colors cursor-pointer"
                  >
                    <td className="py-4 px-5 font-semibold text-text-primary whitespace-nowrap">
                      {row.periodLabel}
                    </td>
                    <td className="py-4 px-4 text-right text-text-secondary tabular-nums whitespace-nowrap">
                      {formatNumber(row.farmersCount)}
                    </td>
                    <td className="py-4 px-4 text-right text-text-secondary tabular-nums whitespace-nowrap">
                      {formatNumber(row.verifiedKg)}
                    </td>
                    <td className="py-4 px-4 text-right text-text-secondary tabular-nums whitespace-nowrap">
                      {formatNumber(row.grossLkr)}
                    </td>
                    <td className="py-4 px-4 text-right font-semibold text-text-primary tabular-nums whitespace-nowrap">
                      {formatNumber(row.netPayableLkr)}
                    </td>
                    <td className="py-4 px-5 text-text-secondary whitespace-nowrap">
                      {row.finalizedOnLabel}
                    </td>
                    <td className="py-4 px-5 whitespace-nowrap">
                      {row.status === 'Draft' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-status-warning-bg text-status-warning-text">
                          <Clock className="w-3 h-3" />
                          Draft
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-status-success-bg text-status-success-text">
                          <Check className="w-3 h-3" />
                          Finalized
                        </span>
                      )}
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
            Showing {startEntry}–{endEntry} of {formatNumber(displayedTotal)}
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
              disabled={currentPage >= totalPages || rows.length <= pageSize}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              aria-label="Next page"
              className="w-8 h-8 inline-flex items-center justify-center rounded-lg border border-border-default text-text-secondary hover:bg-surface-muted disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Period Summary / Finalize Modal */}
      {selectedPeriod && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-[1px] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-surface-card border border-border-default rounded-2xl max-w-md w-full p-6 shadow-xl space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-text-primary">
                  {selectedPeriod.periodLabel} Settlement
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Status: {selectedPeriod.status}
                  {selectedPeriod.finalizedOnLabel !== '—'
                    ? ` · Finalized ${selectedPeriod.finalizedOnLabel}`
                    : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPeriod(null)}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-muted cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm bg-surface-bg rounded-xl p-4 border border-border-subtle">
              <div>
                <p className="text-xs text-text-muted">Farmers</p>
                <p className="font-semibold text-text-primary mt-0.5">
                  {formatNumber(selectedPeriod.farmersCount)}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-muted">Verified leaf</p>
                <p className="font-semibold text-text-primary mt-0.5">
                  {formatNumber(selectedPeriod.verifiedKg)} kg
                </p>
              </div>
              <div>
                <p className="text-xs text-text-muted">Gross (LKR)</p>
                <p className="font-semibold text-text-primary mt-0.5">
                  {formatNumber(selectedPeriod.grossLkr)}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-muted">Net payable (LKR)</p>
                <p className="font-bold text-brand-primary mt-0.5">
                  {formatNumber(selectedPeriod.netPayableLkr)}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={() => setSelectedPeriod(null)}
                className="px-4 py-2 text-sm font-medium text-text-secondary border border-border-default rounded-lg hover:bg-surface-muted cursor-pointer"
              >
                Close
              </button>
              {selectedPeriod.status === 'Draft' && (
                <button
                  type="button"
                  disabled={isFinalizing}
                  onClick={() => handleFinalizePeriod(selectedPeriod)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-text-on-primary bg-brand-primary rounded-lg hover:bg-brand-primary/90 disabled:opacity-50 cursor-pointer"
                >
                  {isFinalizing && <Loader2 className="w-4 h-4 animate-spin" />}
                  Finalize & mark paid
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettlementsPage;
