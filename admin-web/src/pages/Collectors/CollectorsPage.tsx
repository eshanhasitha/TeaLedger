import React, { useState, useEffect } from 'react';
import { Search, AlertCircle, RefreshCw, X } from 'lucide-react';
import { useDashboard } from '../../hooks/useDashboard';
import { collectorService, INITIAL_FIGMA_COLLECTORS } from '../../services/collectorService';
import type { TeaCollector, CollectorStatus } from '../../types/collector.types';

export const CollectorsPage: React.FC = () => {
  const {
    collectors: contextCollectors,
    setIsAddCollectorModalOpen,
    setSelectedCollectorForDetail,
    addToast,
  } = useDashboard();

  const [collectors, setCollectors] = useState<TeaCollector[]>(INITIAL_FIGMA_COLLECTORS);
  const [totalCount, setTotalCount] = useState<number>(26);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<CollectorStatus | 'All'>('All');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const pageSize = 4;

  const fetchCollectors = (search: string, status: CollectorStatus | 'All', page: number) => {
    setIsLoading(true);
    setErrorMessage(null);

    collectorService
      .getCollectorsList({ search, status, page, pageSize })
      .then((res) => {
        setCollectors(res.items);
        setTotalCount(res.totalCount);
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        const msg =
          err instanceof Error ? err.message : 'Failed to fetch collectors from backend.';
        setErrorMessage(msg);
        setCollectors(INITIAL_FIGMA_COLLECTORS);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    let ignore = false;

    collectorService
      .getCollectorsList({ search: searchQuery, status: statusFilter, page: currentPage, pageSize })
      .then((res) => {
        if (!ignore) {
          setCollectors(res.items);
          setTotalCount(res.totalCount);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          const msg =
            err instanceof Error ? err.message : 'Failed to fetch collectors from backend.';
          setErrorMessage(msg);
          setCollectors(INITIAL_FIGMA_COLLECTORS);
        }
      });

    return () => {
      ignore = true;
    };
  }, [searchQuery, statusFilter, currentPage, contextCollectors.length]);

  const handleToggleStatus = async (
    e: React.MouseEvent,
    collector: TeaCollector
  ) => {
    e.stopPropagation();
    const nextStatus: CollectorStatus =
      collector.status === 'Active' ? 'On Leave' : 'Active';

    try {
      const updated = await collectorService.updateCollectorStatus(collector.id, nextStatus);
      setCollectors((prev) =>
        prev.map((c) => (c.id === collector.id ? { ...c, ...updated, status: nextStatus } : c))
      );
      addToast({
        type: 'info',
        title: 'Collector Status Updated',
        message: `${collector.fullName} (${collector.collectorCode || collector.id}) is now ${nextStatus}.`,
      });
    } catch {
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: `Could not update status for collector ${collector.fullName}.`,
      });
    }
  };

  const renderSyncBadge = (collector: TeaCollector) => {
    switch (collector.syncStatus) {
      case 'Pending':
        return (
          <div
            data-status="warning"
            className="px-2.5 py-1 bg-status-warning-bg rounded-[999px] inline-flex justify-start items-center"
          >
            <span className="justify-start text-status-warning text-xs font-semibold font-['Inter']">
              ◔ {collector.pendingSyncCount ?? 3} pending
            </span>
          </div>
        );
      case 'Failed':
        return (
          <div
            data-status="danger"
            className="px-2.5 py-1 bg-status-danger-bg rounded-[999px] inline-flex justify-start items-center"
          >
            <span className="justify-start text-status-danger text-xs font-semibold font-['Inter']">
              ! {collector.failedSyncCount ?? 1} failed
            </span>
          </div>
        );
      case 'No data':
        return (
          <div
            data-status="neutral"
            className="px-2.5 py-1 bg-status-neutral-bg rounded-[999px] inline-flex justify-start items-center"
          >
            <span className="justify-start text-status-neutral text-xs font-semibold font-['Inter']">
              ● No data
            </span>
          </div>
        );
      case 'Synced':
      default:
        return (
          <div
            data-status="success"
            className="px-2.5 py-1 bg-status-success-bg rounded-[999px] inline-flex justify-start items-center"
          >
            <span className="justify-start text-status-success text-xs font-semibold font-['Inter']">
              ✓ Synced
            </span>
          </div>
        );
    }
  };

  const renderStatusBadge = (status: CollectorStatus) => {
    if (status === 'Active') {
      return (
        <div
          data-status="success"
          className="px-2.5 py-1 bg-status-success-bg rounded-[999px] inline-flex justify-start items-center hover:opacity-80 transition-opacity"
        >
          <span className="justify-start text-status-success text-xs font-semibold font-['Inter']">
            ✓ Active
          </span>
        </div>
      );
    }

    return (
      <div
        data-status="neutral"
        className="px-2.5 py-1 bg-status-neutral-bg rounded-[999px] inline-flex justify-start items-center hover:opacity-80 transition-opacity"
      >
        <span className="justify-start text-status-neutral text-xs font-semibold font-['Inter']">
          ● {status === 'On Leave' ? 'On leave' : status}
        </span>
      </div>
    );
  };

  const startRecord = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalCount);
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div className="w-full max-w-[1280px] mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-start items-start gap-6 font-['Inter',sans-serif]">
      {/* Backend Connection Notice Banner */}
      {errorMessage && (
        <div className="w-full p-4 rounded-xl border border-amber-200 bg-amber-50/90 text-amber-900 flex items-center justify-between text-xs sm:text-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="size-4 sm:size-5 text-amber-700 shrink-0" />
            <div>
              <span className="font-semibold">Notice:</span> {errorMessage} Displaying offline cached roster.
            </div>
          </div>
          <button
            type="button"
            onClick={() => fetchCollectors(searchQuery, statusFilter, currentPage)}
            disabled={isLoading}
            className="px-3 py-1.5 bg-amber-200/60 hover:bg-amber-200 text-amber-900 rounded-lg font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`size-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Retry
          </button>
        </div>
      )}

      {/* 1. Header (Title, Subtitle & Add collector Action) */}
      <div className="self-stretch flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 overflow-hidden">
        <div className="flex-1 flex flex-col justify-start items-start gap-1 overflow-hidden">
          <h1 className="self-stretch justify-start text-text-primary text-2xl sm:text-3xl font-bold font-['Inter'] tracking-tight">
            Collectors
          </h1>
          <div className="self-stretch justify-start text-text-secondary text-xs sm:text-sm font-normal font-['Inter']">
            Manage collectors, assigned farmers and sync health
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsAddCollectorModalOpen(true)}
          className="w-full sm:w-auto px-5 py-3 sm:py-3.5 bg-brand-primary hover:bg-brand-primary-hover active:bg-emerald-800 rounded-xl flex justify-center items-center gap-2 cursor-pointer transition-colors shadow-xs text-white shrink-0"
        >
          <span className="text-text-on-primary text-sm sm:text-base font-semibold font-['Inter']">
            Add collector
          </span>
        </button>
      </div>

      {/* 2. Search & Status Filter Pills */}
      <div className="self-stretch flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 overflow-hidden">
        {/* Search Bar */}
        <div className="flex-1 px-3.5 py-2.5 bg-surface-card rounded-xl outline outline-1 outline-offset-[-1px] outline-border-default flex justify-start items-center gap-2 overflow-hidden shadow-xs focus-within:ring-2 focus-within:ring-emerald-200">
          <Search className="size-4 text-text-secondary shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search collectors"
            className="flex-1 justify-start text-text-primary placeholder:text-text-secondary text-xs sm:text-sm font-normal font-['Inter'] bg-transparent outline-none border-none focus:ring-0"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setCurrentPage(1);
              }}
              className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
              aria-label="Clear search"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Status Filter Pills: All / Active / On leave */}
        <div className="flex items-center gap-2 shrink-0 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => {
              setStatusFilter('All');
              setCurrentPage(1);
            }}
            className={`px-3.5 py-2 rounded-[999px] flex justify-start items-start overflow-hidden text-xs font-semibold font-['Inter'] cursor-pointer transition-all ${
              statusFilter === 'All'
                ? 'bg-brand-primary text-text-on-primary shadow-xs'
                : 'bg-surface-card outline outline-1 outline-offset-[-1px] outline-border-default text-text-secondary hover:text-text-primary hover:bg-slate-50'
            }`}
          >
            All
          </button>

          <button
            type="button"
            onClick={() => {
              setStatusFilter('Active');
              setCurrentPage(1);
            }}
            className={`px-3.5 py-2 rounded-[999px] flex justify-start items-start overflow-hidden text-xs font-semibold font-['Inter'] cursor-pointer transition-all ${
              statusFilter === 'Active'
                ? 'bg-brand-primary text-text-on-primary shadow-xs'
                : 'bg-surface-card outline outline-1 outline-offset-[-1px] outline-border-default text-text-secondary hover:text-text-primary hover:bg-slate-50'
            }`}
          >
            Active
          </button>

          <button
            type="button"
            onClick={() => {
              setStatusFilter('On Leave');
              setCurrentPage(1);
            }}
            className={`px-3.5 py-2 rounded-[999px] flex justify-start items-start overflow-hidden text-xs font-semibold font-['Inter'] cursor-pointer transition-all ${
              statusFilter === 'On Leave'
                ? 'bg-brand-primary text-text-on-primary shadow-xs'
                : 'bg-surface-card outline outline-1 outline-offset-[-1px] outline-border-default text-text-secondary hover:text-text-primary hover:bg-slate-50'
            }`}
          >
            On leave
          </button>
        </div>
      </div>

      {/* 3. Collectors Data Table */}
      <div className="self-stretch bg-surface-card rounded-2xl outline outline-1 outline-offset-[-1px] outline-border-default flex flex-col justify-start items-start overflow-hidden shadow-xs">
        <div className="w-full overflow-x-auto">
          <div className="min-w-[760px] w-full">
            {/* Table Header */}
            <div className="self-stretch px-5 py-3 bg-surface-muted flex justify-start items-center gap-4 overflow-hidden border-b border-border-default">
              <div className="w-14 justify-start text-text-secondary text-xs font-semibold font-['Inter']">
                ID
              </div>
              <div className="w-40 justify-start text-text-secondary text-xs font-semibold font-['Inter']">
                Name
              </div>
              <div className="w-32 justify-start text-text-secondary text-xs font-semibold font-['Inter']">
                Mobile
              </div>
              <div className="w-16 text-right justify-start text-text-secondary text-xs font-semibold font-['Inter']">
                Farmers
              </div>
              <div className="w-24 text-right justify-start text-text-secondary text-xs font-semibold font-['Inter']">
                Today (kg)
              </div>
              <div className="w-36 justify-start text-text-secondary text-xs font-semibold font-['Inter']">
                Sync
              </div>
              <div className="flex-1 justify-start text-text-secondary text-xs font-semibold font-['Inter']">
                Status
              </div>
            </div>

            {/* Data Rows */}
            {collectors.length === 0 ? (
              <div className="p-8 text-center text-text-secondary text-sm">
                No collectors found matching your criteria.
              </div>
            ) : (
              collectors.map((collector) => (
                <div
                  key={collector.id}
                  onClick={() => setSelectedCollectorForDetail(collector)}
                  className="self-stretch px-5 py-3 border-b border-border-default flex justify-start items-center gap-4 overflow-hidden hover:bg-slate-50/80 transition-colors cursor-pointer"
                >
                  <div className="w-14 justify-start text-text-primary text-xs font-normal font-['Inter'] truncate">
                    {collector.collectorCode || collector.id}
                  </div>
                  <div className="w-40 justify-start text-text-primary text-xs font-normal font-['Inter'] truncate">
                    {collector.fullName}
                  </div>
                  <div className="w-32 justify-start text-text-primary text-xs font-normal font-['Inter'] truncate">
                    {collector.phoneNumber}
                  </div>
                  <div className="w-16 text-right justify-start text-text-primary text-xs font-normal font-['Inter']">
                    {collector.activeFarmersCount}
                  </div>
                  <div className="w-24 text-right justify-start text-text-primary text-xs font-normal font-['Inter']">
                    {collector.todayIntakeKg === 0 ? '0' : collector.todayIntakeKg.toFixed(1)}
                  </div>
                  <div className="w-36 flex justify-start items-start overflow-hidden">
                    {renderSyncBadge(collector)}
                  </div>
                  <div className="flex-1 flex justify-start items-start overflow-hidden">
                    <button
                      type="button"
                      onClick={(e) => handleToggleStatus(e, collector)}
                      title="Click to toggle collector status"
                      className="cursor-pointer"
                    >
                      {renderStatusBadge(collector.status)}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pagination Footer */}
        <div className="self-stretch px-5 py-3 flex justify-between items-center gap-2 overflow-hidden bg-white">
          <div className="flex-1 justify-start text-text-secondary text-xs font-normal font-['Inter']">
            Showing {startRecord}–{endRecord} of {totalCount}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage <= 1}
              className={`px-3.5 py-2 rounded-[10px] outline outline-1 outline-offset-[-1px] outline-border-default flex justify-start items-start overflow-hidden text-brand-primary text-xs font-semibold font-['Inter'] transition-colors ${
                currentPage <= 1
                  ? 'opacity-40 cursor-not-allowed'
                  : 'hover:bg-slate-50 cursor-pointer active:bg-slate-100'
              }`}
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage >= totalPages}
              className={`px-3.5 py-2 rounded-[10px] outline outline-1 outline-offset-[-1px] outline-border-default flex justify-start items-start overflow-hidden text-brand-primary text-xs font-semibold font-['Inter'] transition-colors ${
                currentPage >= totalPages
                  ? 'opacity-40 cursor-not-allowed'
                  : 'hover:bg-slate-50 cursor-pointer active:bg-slate-100'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
