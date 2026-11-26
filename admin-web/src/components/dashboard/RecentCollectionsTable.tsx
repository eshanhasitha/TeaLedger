import React, { useState } from 'react';
import type { DashboardCollectionSlip } from '../../types/dashboard.types';

interface RecentCollectionsTableProps {
  collections: DashboardCollectionSlip[];
  totalCount: number;
}

export const RecentCollectionsTable: React.FC<RecentCollectionsTableProps> = ({
  collections,
  totalCount,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const totalPages = Math.ceil(totalCount / pageSize);

  const startRecord = (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalCount);

  const handlePrevious = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const renderStatusBadge = (status: DashboardCollectionSlip['status']) => {
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
      case 'Flagged Wt':
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

  return (
    <div className="self-stretch flex flex-col justify-start items-start gap-3">
      {/* Table Section Title */}
      <div className="self-stretch flex justify-start items-center overflow-hidden">
        <h2 className="flex-1 justify-start text-text-primary text-lg font-bold font-['Inter']">
          Recent collections
        </h2>
      </div>

      {/* Table Card */}
      <div className="self-stretch bg-surface-card rounded-2xl outline outline-1 outline-offset-[-1px] outline-border-default flex flex-col justify-start items-start overflow-hidden shadow-xs">
        <div className="w-full overflow-x-auto">
          <div className="min-w-[760px] w-full">
            {/* Header Row */}
            <div className="self-stretch px-5 py-3 bg-surface-muted flex justify-start items-center gap-4 overflow-hidden border-b border-border-default">
              <div className="w-24 justify-start text-text-secondary text-xs font-semibold font-['Inter']">
                Slip
              </div>
              <div className="w-48 justify-start text-text-secondary text-xs font-semibold font-['Inter']">
                Farmer
              </div>
              <div className="w-36 justify-start text-text-secondary text-xs font-semibold font-['Inter']">
                Collector
              </div>
              <div className="w-24 text-right justify-start text-text-secondary text-xs font-semibold font-['Inter']">
                Gross (kg)
              </div>
              <div className="w-28 text-right justify-start text-text-secondary text-xs font-semibold font-['Inter']">
                Reductions (kg)
              </div>
              <div className="w-24 text-right justify-start text-text-secondary text-xs font-semibold font-['Inter']">
                Final (kg)
              </div>
              <div className="flex-1 justify-start text-text-secondary text-xs font-semibold font-['Inter']">
                Status
              </div>
            </div>

            {/* Data Rows */}
            {collections.map((slip) => (
              <div
                key={slip.id}
                className="self-stretch px-5 py-3 border-b border-border-default flex justify-start items-center gap-4 overflow-hidden hover:bg-slate-50/80 transition-colors"
              >
                <div className="w-24 justify-start text-text-primary text-xs font-semibold sm:font-normal font-['Inter']">
                  {slip.id}
                </div>
                <div className="w-48 justify-start text-text-primary text-xs font-normal font-['Inter'] truncate">
                  {slip.farmerName}
                </div>
                <div className="w-36 justify-start text-text-primary text-xs font-normal font-['Inter'] truncate">
                  {slip.collectorName}
                </div>
                <div className="w-24 text-right justify-start text-text-primary text-xs font-normal font-['Inter']">
                  {slip.grossKg.toFixed(2)}
                </div>
                <div className="w-28 text-right justify-start text-text-primary text-xs font-normal font-['Inter'] text-rose-700">
                  {slip.reductionsKg < 0 ? `−${Math.abs(slip.reductionsKg).toFixed(2)}` : `0.00`}
                </div>
                <div className="w-24 text-right justify-start text-text-primary text-xs font-semibold font-['Inter'] text-emerald-800">
                  {slip.finalKg.toFixed(2)}
                </div>
                <div className="flex-1 flex justify-start items-start overflow-hidden">
                  {renderStatusBadge(slip.status)}
                </div>
              </div>
            ))}
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
              onClick={handlePrevious}
              disabled={currentPage <= 1}
              className={`px-3.5 py-2 rounded-[10px] outline outline-1 outline-offset-[-1px] outline-border-default flex justify-start items-start overflow-hidden text-brand-primary text-xs font-semibold font-['Inter'] transition-colors ${
                currentPage <= 1 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-50 cursor-pointer active:bg-slate-100'
              }`}
            >
              Previous
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={currentPage >= totalPages}
              className={`px-3.5 py-2 rounded-[10px] outline outline-1 outline-offset-[-1px] outline-border-default flex justify-start items-start overflow-hidden text-brand-primary text-xs font-semibold font-['Inter'] transition-colors ${
                currentPage >= totalPages ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-50 cursor-pointer active:bg-slate-100'
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
