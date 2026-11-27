import React, { useState, useEffect } from 'react';
import { Search, AlertCircle, RefreshCw, X, Loader2 } from 'lucide-react';
import { useDashboard } from '../../hooks/useDashboard';
import { collectionService, INITIAL_COLLECTIONS } from '../../services/collectionService';
import type { TeaCollectionRecord, CollectionRecordStatus } from '../../types/collection.types';

export const CollectionsPage: React.FC = () => {
  const { addToast } = useDashboard();

  const [collections, setCollections] = useState<TeaCollectionRecord[]>(INITIAL_COLLECTIONS);
  const [totalCount, setTotalCount] = useState<number>(184);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<CollectionRecordStatus | 'All'>('All');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedReviewId, setSelectedReviewId] = useState<string>('L-4815');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const pageSize = 5;

  const fetchCollections = (
    search: string,
    status: CollectionRecordStatus | 'All',
    page: number
  ) => {
    setIsLoading(true);
    setErrorMessage(null);

    collectionService
      .getCollections({ search, status, page, pageSize })
      .then((res) => {
        setCollections(res.items);
        setTotalCount(res.totalCount);
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        const msg =
          err instanceof Error ? err.message : 'Failed to load collections from backend.';
        setErrorMessage(msg);
        setCollections(INITIAL_COLLECTIONS);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    let ignore = false;

    collectionService
      .getCollections({ search: searchQuery, status: statusFilter, page: currentPage, pageSize })
      .then((res) => {
        if (!ignore) {
          setCollections(res.items);
          setTotalCount(res.totalCount);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          const msg =
            err instanceof Error ? err.message : 'Failed to load collections from backend.';
          setErrorMessage(msg);
          setCollections(INITIAL_COLLECTIONS);
        }
      });

    return () => {
      ignore = true;
    };
  }, [searchQuery, statusFilter, currentPage]);

  const handleExportCSV = async () => {
    try {
      await collectionService.exportCollectionsCSV(collections);
      addToast({
        type: 'success',
        title: 'Collections Exported',
        message: 'Collections summary CSV has been downloaded.',
      });
    } catch {
      addToast({
        type: 'error',
        title: 'Export Failed',
        message: 'Unable to export collections CSV right now.',
      });
    }
  };

  const activeReviewSlip =
    collections.find((c) => c.id === selectedReviewId && c.status === 'Needs review') ||
    collections.find((c) => c.status === 'Needs review') ||
    null;

  const handleAcceptServerWeight = async (slip: TeaCollectionRecord) => {
    setIsActionLoading(true);
    try {
      const updated = await collectionService.acceptServerWeight(slip);
      setCollections((prev) => prev.map((c) => (c.id === slip.id ? updated : c)));
      addToast({
        type: 'success',
        title: `Slip ${slip.slipId} Verified`,
        message: `Server-verified final weight (${updated.finalKg.toFixed(2)} kg) accepted.`,
      });
    } catch {
      addToast({
        type: 'error',
        title: 'Verification Failed',
        message: `Could not verify weight for slip ${slip.slipId}.`,
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleRequestRecheck = async (slip: TeaCollectionRecord) => {
    setIsActionLoading(true);
    try {
      const updated = await collectionService.requestRecheck(slip);
      setCollections((prev) => prev.map((c) => (c.id === slip.id ? updated : c)));
      addToast({
        type: 'info',
        title: `Recheck Requested (${slip.slipId})`,
        message: `${slip.collectorName} has been notified to recheck bag weights.`,
      });
    } catch {
      addToast({
        type: 'error',
        title: 'Request Failed',
        message: `Could not send recheck request for slip ${slip.slipId}.`,
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const renderStatusBadge = (status: CollectionRecordStatus) => {
    switch (status) {
      case 'Verified':
        return (
          <div
            data-status="success"
            className="px-2.5 py-1 bg-status-success-bg rounded-[999px] inline-flex justify-start items-center"
          >
            <span className="justify-start text-status-success text-xs font-semibold font-['Inter']">
              ✓ Verified
            </span>
          </div>
        );
      case 'Pending sync':
        return (
          <div
            data-status="warning"
            className="px-2.5 py-1 bg-status-warning-bg rounded-[999px] inline-flex justify-start items-center"
          >
            <span className="justify-start text-status-warning text-xs font-semibold font-['Inter']">
              ◔ Pending sync
            </span>
          </div>
        );
      case 'Needs review':
      default:
        return (
          <div
            data-status="danger"
            className="px-2.5 py-1 bg-status-danger-bg rounded-[999px] inline-flex justify-start items-center"
          >
            <span className="justify-start text-status-danger text-xs font-semibold font-['Inter']">
              ! Needs review
            </span>
          </div>
        );
    }
  };

  const startRecord = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalCount);
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div className="w-full max-w-[1280px] mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-start items-start gap-6 font-['Inter',sans-serif]">
      {/* Backend Error Banner */}
      {errorMessage && (
        <div className="w-full p-4 rounded-xl border border-amber-200 bg-amber-50/90 text-amber-900 flex items-center justify-between text-xs sm:text-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="size-4 sm:size-5 text-amber-700 shrink-0" />
            <div>
              <span className="font-semibold">Notice:</span> {errorMessage} Displaying offline cached collections.
            </div>
          </div>
          <button
            type="button"
            onClick={() => fetchCollections(searchQuery, statusFilter, currentPage)}
            disabled={isLoading}
            className="px-3 py-1.5 bg-amber-200/60 hover:bg-amber-200 text-amber-900 rounded-lg font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`size-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Retry
          </button>
        </div>
      )}

      {/* 1. Header */}
      <div className="self-stretch flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 overflow-hidden">
        <div className="flex-1 flex flex-col justify-start items-start gap-1 overflow-hidden">
          <h1 className="self-stretch justify-start text-text-primary text-2xl sm:text-3xl font-bold font-['Inter'] tracking-tight">
            Collections
          </h1>
          <div className="self-stretch justify-start text-text-secondary text-xs sm:text-sm font-normal font-['Inter']">
            Monitor recorded collections and verify weights
          </div>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          className="w-full sm:w-auto px-5 py-3 sm:py-3.5 bg-surface-card rounded-xl outline outline-[1.50px] outline-offset-[-1.50px] outline-border-default hover:bg-slate-50 active:bg-slate-100 flex justify-center items-center gap-2 cursor-pointer transition-colors shadow-xs shrink-0"
        >
          <span className="justify-start text-brand-primary text-sm sm:text-base font-semibold font-['Inter']">
            Export CSV
          </span>
        </button>
      </div>

      {/* 2. Search & Status Filter Bar */}
      <div className="self-stretch flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-3 overflow-hidden">
        {/* Search Input */}
        <div className="flex-1 px-3.5 py-2.5 bg-surface-card rounded-xl outline outline-1 outline-offset-[-1px] outline-border-default flex justify-start items-center gap-2 overflow-hidden shadow-xs focus-within:ring-2 focus-within:ring-emerald-200">
          <Search className="size-4 text-text-secondary shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search slip, farmer or collector"
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

        {/* Status Filter Pills */}
        <div className="flex items-center gap-2 shrink-0 overflow-x-auto pb-1 lg:pb-0">
          {(['All', 'Verified', 'Pending sync', 'Needs review'] as const).map((pill) => (
            <button
              key={pill}
              type="button"
              onClick={() => {
                setStatusFilter(pill);
                setCurrentPage(1);
              }}
              className={`px-3.5 py-2 rounded-[999px] flex justify-start items-start overflow-hidden text-xs font-semibold font-['Inter'] whitespace-nowrap cursor-pointer transition-all ${
                statusFilter === pill
                  ? 'bg-brand-primary text-text-on-primary shadow-xs'
                  : 'bg-surface-card outline outline-1 outline-offset-[-1px] outline-border-default text-text-secondary hover:text-text-primary hover:bg-slate-50'
              }`}
            >
              {pill}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Collections Data Table */}
      <div className="self-stretch bg-surface-card rounded-2xl outline outline-1 outline-offset-[-1px] outline-border-default flex flex-col justify-start items-start overflow-hidden shadow-xs">
        <div className="w-full overflow-x-auto">
          <div className="min-w-[780px] w-full">
            {/* Header Row */}
            <div className="self-stretch px-5 py-3 bg-surface-muted flex justify-start items-center gap-4 overflow-hidden border-b border-border-default">
              <div className="w-16 justify-start text-text-secondary text-xs font-semibold font-['Inter']">
                Slip
              </div>
              <div className="w-24 justify-start text-text-secondary text-xs font-semibold font-['Inter']">
                Date
              </div>
              <div className="w-36 justify-start text-text-secondary text-xs font-semibold font-['Inter']">
                Farmer
              </div>
              <div className="w-28 justify-start text-text-secondary text-xs font-semibold font-['Inter']">
                Collector
              </div>
              <div className="w-20 text-right justify-start text-text-secondary text-xs font-semibold font-['Inter']">
                Gross (kg)
              </div>
              <div className="w-24 text-right justify-start text-text-secondary text-xs font-semibold font-['Inter']">
                Reductions
              </div>
              <div className="w-20 text-right justify-start text-text-secondary text-xs font-semibold font-['Inter']">
                Final (kg)
              </div>
              <div className="flex-1 justify-start text-text-secondary text-xs font-semibold font-['Inter']">
                Status
              </div>
            </div>

            {/* Rows */}
            {collections.length === 0 ? (
              <div className="p-8 text-center text-text-secondary text-sm">
                No collections found matching your filters.
              </div>
            ) : (
              collections.map((slip) => (
                <div
                  key={slip.id}
                  onClick={() => {
                    if (slip.status === 'Needs review') {
                      setSelectedReviewId(slip.id);
                    }
                  }}
                  className={`self-stretch px-5 py-3 border-b border-border-default flex justify-start items-center gap-4 overflow-hidden transition-colors ${
                    slip.status === 'Needs review'
                      ? 'cursor-pointer hover:bg-rose-50/40'
                      : 'hover:bg-slate-50/80'
                  }`}
                >
                  <div className="w-16 justify-start text-text-primary text-xs font-normal font-['Inter'] truncate">
                    {slip.slipId}
                  </div>
                  <div className="w-24 justify-start text-text-primary text-xs font-normal font-['Inter']">
                    {slip.dateLabel}
                  </div>
                  <div className="w-36 justify-start text-text-primary text-xs font-normal font-['Inter'] truncate">
                    {slip.farmerName}
                  </div>
                  <div className="w-28 justify-start text-text-primary text-xs font-normal font-['Inter'] truncate">
                    {slip.collectorName}
                  </div>
                  <div className="w-20 text-right justify-start text-text-primary text-xs font-normal font-['Inter']">
                    {slip.grossKg.toFixed(2)}
                  </div>
                  <div className="w-24 text-right justify-start text-text-primary text-xs font-normal font-['Inter']">
                    {slip.reductionsKg < 0
                      ? `−${Math.abs(slip.reductionsKg).toFixed(2)}`
                      : '0.00'}
                  </div>
                  <div className="w-20 text-right justify-start text-text-primary text-xs font-semibold font-['Inter']">
                    {slip.finalKg.toFixed(2)}
                  </div>
                  <div className="flex-1 flex justify-start items-start overflow-hidden">
                    {renderStatusBadge(slip.status)}
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

      {/* 4. Needs Review Weight Discrepancy Resolution Card */}
      {activeReviewSlip && (
        <div className="self-stretch px-5 sm:px-6 py-5 bg-surface-card rounded-2xl outline outline-1 outline-offset-[-1px] outline-border-default flex flex-col justify-start items-start gap-4 overflow-hidden shadow-xs">
          {/* Card Header */}
          <div className="self-stretch flex flex-wrap justify-between items-center gap-2.5 overflow-hidden">
            <h2 className="flex-1 justify-start text-text-primary text-lg font-bold font-['Inter']">
              Needs review · Slip {activeReviewSlip.slipId}
            </h2>
            <div
              data-status="danger"
              className="px-2.5 py-1 bg-status-danger-bg rounded-[999px] flex justify-start items-center shrink-0"
            >
              <span className="justify-start text-status-danger text-xs font-semibold font-['Inter']">
                ! Needs review
              </span>
            </div>
          </div>

          {/* Discrepancy Description */}
          <p className="self-stretch justify-start text-text-secondary text-sm font-normal font-['Inter']">
            The collector’s final weight differs from the server recalculation by{' '}
            {(activeReviewSlip.serverReview?.discrepancyKg ?? 1.9).toFixed(2)} kg. Compare and
            choose how to resolve.
          </p>

          {/* Side-by-side Weight Comparison Cards */}
          <div className="self-stretch flex flex-col sm:flex-row justify-start items-stretch gap-4 overflow-hidden">
            {/* Left: Submitted by collector */}
            <div className="flex-1 px-4 py-3.5 bg-surface-muted rounded-xl flex flex-col justify-start items-start gap-1.5 overflow-hidden">
              <div className="self-stretch justify-start text-text-secondary text-xs font-semibold font-['Inter']">
                Submitted by collector
              </div>
              <div className="self-stretch justify-start text-text-primary text-base font-medium font-['Inter']">
                Gross {activeReviewSlip.grossKg.toFixed(2)} kg
              </div>
              <div className="self-stretch justify-start text-text-primary text-base font-medium font-['Inter']">
                Reductions −{Math.abs(activeReviewSlip.reductionsKg).toFixed(2)} kg
              </div>
              <div className="self-stretch justify-start text-text-primary text-base font-bold font-['Inter']">
                Final {activeReviewSlip.finalKg.toFixed(2)} kg
              </div>
            </div>

            {/* Right: Server-verified */}
            <div className="flex-1 px-4 py-3.5 bg-brand-tint rounded-xl flex flex-col justify-start items-start gap-1.5 overflow-hidden">
              <div className="self-stretch justify-start text-teal-950 text-xs font-semibold font-['Inter']">
                Server-verified
              </div>
              <div className="self-stretch justify-start text-teal-950 text-base font-medium font-['Inter']">
                Gross {(activeReviewSlip.serverReview?.grossKg ?? activeReviewSlip.grossKg).toFixed(2)} kg
              </div>
              <div className="self-stretch justify-start text-teal-950 text-base font-medium font-['Inter']">
                Reductions −
                {Math.abs(
                  activeReviewSlip.serverReview?.reductionsKg ?? activeReviewSlip.reductionsKg
                ).toFixed(2)}{' '}
                kg
              </div>
              <div className="self-stretch justify-start text-teal-950 text-base font-bold font-['Inter']">
                Final {(activeReviewSlip.serverReview?.finalKg ?? activeReviewSlip.finalKg).toFixed(2)} kg
              </div>
            </div>
          </div>

          {/* Resolution Action Buttons */}
          <div className="self-stretch flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-3 overflow-hidden">
            <button
              type="button"
              disabled={isActionLoading}
              onClick={() => handleRequestRecheck(activeReviewSlip)}
              className="px-5 py-3 sm:py-3.5 bg-surface-card rounded-xl outline outline-[1.50px] outline-offset-[-1.50px] outline-border-default hover:bg-slate-50 active:bg-slate-100 disabled:opacity-50 flex justify-center items-center gap-2 cursor-pointer transition-colors shadow-xs"
            >
              <span className="justify-start text-brand-primary text-sm sm:text-base font-semibold font-['Inter']">
                Request recheck
              </span>
            </button>

            <button
              type="button"
              disabled={isActionLoading}
              onClick={() => handleAcceptServerWeight(activeReviewSlip)}
              className="px-5 py-3 sm:py-3.5 bg-brand-primary hover:bg-brand-primary-hover active:bg-emerald-800 disabled:opacity-50 rounded-xl flex justify-center items-center gap-2 cursor-pointer transition-colors shadow-xs text-white"
            >
              {isActionLoading && <Loader2 className="size-4 animate-spin text-white" />}
              <span className="justify-start text-text-on-primary text-sm sm:text-base font-semibold font-['Inter']">
                Accept server weight
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
