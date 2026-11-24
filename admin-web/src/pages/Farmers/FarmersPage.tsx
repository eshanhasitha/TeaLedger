import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, AlertCircle, RefreshCw, X } from 'lucide-react';
import { useDashboard } from '../../hooks/useDashboard';
import { farmerService, INITIAL_FARMERS } from '../../services/farmerService';
import type { Farmer, FarmerStatus } from '../../types/farmer.types';

export const FarmersPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useDashboard();

  const [farmers, setFarmers] = useState<Farmer[]>(INITIAL_FARMERS);
  const [totalFarmers, setTotalFarmers] = useState<number>(1428);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<FarmerStatus | 'All'>('All');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const pageSize = 5;

  // Asynchronous fetcher without synchronous setState in effect body
  const fetchFarmers = (search: string, status: FarmerStatus | 'All', page: number) => {
    setIsLoading(true);
    setErrorMessage(null);

    farmerService
      .getFarmers({ search, status, page, pageSize })
      .then((res) => {
        setFarmers(res.items);
        setTotalFarmers(res.total);
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Failed to fetch farmers from backend.';
        setErrorMessage(msg);
        setFarmers(INITIAL_FARMERS);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    let ignore = false;

    farmerService
      .getFarmers({ search: searchQuery, status: statusFilter, page: currentPage, pageSize })
      .then((res) => {
        if (!ignore) {
          setFarmers(res.items);
          setTotalFarmers(res.total);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          const msg = err instanceof Error ? err.message : 'Failed to fetch farmers from backend.';
          setErrorMessage(msg);
          setFarmers(INITIAL_FARMERS);
        }
      });

    return () => {
      ignore = true;
    };
  }, [searchQuery, statusFilter, currentPage]);

  const handleExport = async () => {
    try {
      await farmerService.exportFarmersReport(farmers);
      addToast({
        type: 'success',
        title: 'Farmers Registry Exported',
        message: 'The smallholders roster has been exported as CSV.',
      });
    } catch {
      addToast({
        type: 'error',
        title: 'Export Failed',
        message: 'Unable to export farmers roster at this time.',
      });
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: FarmerStatus) => {
    const nextStatus: FarmerStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    try {
      await farmerService.updateFarmerStatus(id, nextStatus);
      setFarmers((prev) =>
        prev.map((f) => (f.id === id ? { ...f, status: nextStatus } : f))
      );
      addToast({
        type: 'info',
        title: 'Farmer Status Updated',
        message: `Farmer ${id} status set to ${nextStatus}.`,
      });
    } catch {
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: `Could not update status for farmer ${id}.`,
      });
    }
  };

  const startRecord = (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalFarmers);
  const totalPages = Math.ceil(totalFarmers / pageSize);

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 flex flex-col justify-start items-start gap-6 font-['Inter',sans-serif]">
      {/* Backend Error Banner */}
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
            onClick={() => fetchFarmers(searchQuery, statusFilter, currentPage)}
            disabled={isLoading}
            className="px-3 py-1.5 bg-amber-200/60 hover:bg-amber-200 text-amber-900 rounded-lg font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`size-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Retry
          </button>
        </div>
      )}

      {/* 1. Header (Title, Subtitle & Action Buttons) */}
      <div className="self-stretch flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 overflow-hidden">
        <div className="flex-1 flex flex-col justify-start items-start gap-1 overflow-hidden">
          <h1 className="self-stretch justify-start text-text-primary text-2xl sm:text-3xl font-bold font-['Inter'] tracking-tight">
            Farmers
          </h1>
          <div className="self-stretch justify-start text-text-secondary text-xs sm:text-sm font-normal font-['Inter']">
            Manage farmer accounts and collector assignments
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
          {/* Secondary: Export */}
          <button
            type="button"
            onClick={handleExport}
            className="flex-1 sm:flex-initial px-4 sm:px-5 py-3 sm:py-3.5 bg-surface-card rounded-xl outline outline-[1.50px] outline-offset-[-1.50px] outline-border-default hover:bg-slate-50 active:bg-slate-100 flex justify-center items-center gap-2 cursor-pointer transition-colors shadow-xs"
          >
            <span className="text-brand-primary text-sm sm:text-base font-semibold font-['Inter']">
              Export
            </span>
          </button>

          {/* Primary: Add farmer */}
          <button
            type="button"
            onClick={() => navigate('/farmers/new')}
            className="flex-1 sm:flex-initial px-4 sm:px-5 py-3 sm:py-3.5 bg-brand-primary hover:bg-brand-primary-hover active:bg-emerald-800 rounded-xl flex justify-center items-center gap-2 cursor-pointer transition-colors shadow-xs text-white"
          >
            <span className="text-text-on-primary text-sm sm:text-base font-semibold font-['Inter']">
              Add farmer
            </span>
          </button>
        </div>
      </div>

      {/* 2. Search & Status Filter Bar */}
      <div className="self-stretch flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 overflow-hidden">
        {/* Search Bar */}
        <div className="flex-1 px-3.5 py-2.5 bg-surface-card rounded-xl outline outline-1 outline-offset-[-1px] outline-border-default flex justify-start items-center gap-2 overflow-hidden shadow-xs focus-within:ring-2 focus-within:ring-emerald-200">
          <Search className="size-4 text-text-secondary shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, ID or mobile"
            className="flex-1 justify-start text-text-primary placeholder:text-text-secondary text-xs sm:text-sm font-normal font-['Inter'] bg-transparent outline-none border-none focus:ring-0"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills: All / Active / Inactive */}
        <div className="flex items-center gap-2 shrink-0 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setStatusFilter('All')}
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
            onClick={() => setStatusFilter('Active')}
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
            onClick={() => setStatusFilter('Inactive')}
            className={`px-3.5 py-2 rounded-[999px] flex justify-start items-start overflow-hidden text-xs font-semibold font-['Inter'] cursor-pointer transition-all ${
              statusFilter === 'Inactive'
                ? 'bg-brand-primary text-text-on-primary shadow-xs'
                : 'bg-surface-card outline outline-1 outline-offset-[-1px] outline-border-default text-text-secondary hover:text-text-primary hover:bg-slate-50'
            }`}
          >
            Inactive
          </button>
        </div>
      </div>

      {/* 3. Farmers Data Table */}
      <div className="self-stretch bg-surface-card rounded-2xl outline outline-1 outline-offset-[-1px] outline-border-default flex flex-col justify-start items-start overflow-hidden shadow-xs">
        <div className="w-full overflow-x-auto">
          <div className="min-w-[760px] w-full">
            {/* Table Header */}
            <div className="self-stretch px-5 py-3 bg-surface-muted flex justify-start items-center gap-4 overflow-hidden border-b border-border-default">
              <div className="w-14 justify-start text-text-secondary text-xs font-semibold font-['Inter']">
                ID
              </div>
              <div className="w-44 justify-start text-text-secondary text-xs font-semibold font-['Inter']">
                Name
              </div>
              <div className="w-28 justify-start text-text-secondary text-xs font-semibold font-['Inter']">
                Area
              </div>
              <div className="w-32 justify-start text-text-secondary text-xs font-semibold font-['Inter']">
                Collector
              </div>
              <div className="w-28 justify-start text-text-secondary text-xs font-semibold font-['Inter']">
                Last collection
              </div>
              <div className="w-28 text-right justify-start text-text-secondary text-xs font-semibold font-['Inter']">
                Advance (LKR)
              </div>
              <div className="flex-1 justify-start text-text-secondary text-xs font-semibold font-['Inter']">
                Status
              </div>
            </div>

            {/* Table Rows */}
            {farmers.length === 0 ? (
              <div className="p-8 text-center text-text-secondary text-sm">
                No farmers found matching your criteria.
              </div>
            ) : (
              farmers.map((farmer) => (
                <div
                  key={farmer.id}
                  className="self-stretch px-5 py-3 border-b border-border-default flex justify-start items-center gap-4 overflow-hidden hover:bg-slate-50/80 transition-colors"
                >
                  <div className="w-14 justify-start text-text-primary text-xs font-normal font-['Inter']">
                    {farmer.id}
                  </div>
                  <div className="w-44 justify-start text-text-primary text-xs font-normal font-['Inter'] truncate">
                    {farmer.name}
                  </div>
                  <div className="w-28 justify-start text-text-primary text-xs font-normal font-['Inter'] truncate">
                    {farmer.area || farmer.division || 'Block 01'}
                  </div>
                  <div className="w-32 justify-start text-text-primary text-xs font-normal font-['Inter'] truncate">
                    {farmer.collectorName || 'Nimal Silva'}
                  </div>
                  <div className="w-28 justify-start text-text-primary text-xs font-normal font-['Inter']">
                    {farmer.lastCollectionDate || 'N/A'}
                  </div>
                  <div className="w-28 text-right justify-start text-text-primary text-xs font-normal font-['Inter']">
                    {(farmer.advanceLkr ?? 0).toLocaleString()}
                  </div>
                  <div className="flex-1 flex justify-start items-start overflow-hidden">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(farmer.id, farmer.status)}
                      title="Click to toggle status"
                      className="cursor-pointer"
                    >
                      {farmer.status === 'Active' ? (
                        <div
                          data-status="success"
                          className="px-2.5 py-1 bg-status-success-bg rounded-[999px] flex justify-start items-center hover:opacity-80 transition-opacity"
                        >
                          <span className="justify-start text-status-success text-xs font-semibold font-['Inter']">
                            ✓ Active
                          </span>
                        </div>
                      ) : (
                        <div
                          data-status="neutral"
                          className="px-2.5 py-1 bg-status-neutral-bg rounded-[999px] flex justify-start items-center hover:opacity-80 transition-opacity"
                        >
                          <span className="justify-start text-status-neutral text-xs font-semibold font-['Inter']">
                            ● Inactive
                          </span>
                        </div>
                      )}
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
            Showing {startRecord}–{endRecord} of {totalFarmers.toLocaleString()}
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
