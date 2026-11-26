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
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const startRecord = (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalCount);

  const renderStatusBadge = (status: DashboardCollectionSlip['status']) => {
    switch (status) {
      case 'Verified':
        return (
          <span className="px-2.5 py-0.5 bg-[#E1F4E8] text-[#0B5D3B] rounded-full inline-flex items-center text-xs font-semibold">
            ✓ Verified
          </span>
        );
      case 'Pending sync':
        return (
          <span className="px-2.5 py-0.5 bg-[#FEF3C7] text-[#B45309] rounded-full inline-flex items-center text-xs font-semibold">
            ⟳ Pending sync
          </span>
        );
      case 'Needs review':
      case 'Flagged Wt':
      default:
        return (
          <span className="px-2.5 py-0.5 bg-[#FEF2F2] text-[#B91C1C] rounded-full inline-flex items-center text-xs font-semibold">
            ! Needs review
          </span>
        );
    }
  };

  return (
    <div className="self-stretch flex flex-col justify-start items-start gap-3">
      <h2 className="text-[#17201B] text-base font-bold">
        Recent collections
      </h2>

      <div className="self-stretch bg-white rounded-xl border border-[#DCE2DC] flex flex-col overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[760px] text-left border-collapse">
            <thead>
              <tr className="bg-[#F4F6F3] border-b border-[#DCE2DC] text-[#56625B] text-xs font-semibold">
                <th className="py-3 px-5">Slip</th>
                <th className="py-3 px-4">Farmer</th>
                <th className="py-3 px-4">Collector</th>
                <th className="py-3 px-4 text-right">Gross (kg)</th>
                <th className="py-3 px-4 text-right">Reductions (kg)</th>
                <th className="py-3 px-4 text-right">Final (kg)</th>
                <th className="py-3 px-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE2DC] text-[13px] text-[#17201B]">
              {collections.map((slip) => (
                <tr key={slip.id} className="hover:bg-[#F4F6F3]/60 transition-colors">
                  <td className="py-3 px-5 font-medium">{slip.id}</td>
                  <td className="py-3 px-4">{slip.farmerName}</td>
                  <td className="py-3 px-4">{slip.collectorName}</td>
                  <td className="py-3 px-4 text-right tabular-nums">{slip.grossKg.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right tabular-nums">
                    {slip.reductionsKg < 0 ? `−${Math.abs(slip.reductionsKg).toFixed(2)}` : '0.00'}
                  </td>
                  <td className="py-3 px-4 text-right font-semibold tabular-nums">{slip.finalKg.toFixed(2)}</td>
                  <td className="py-3 px-5">{renderStatusBadge(slip.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 flex justify-between items-center gap-2 border-t border-[#DCE2DC] bg-white">
          <div className="text-[#56625B] text-xs">
            Showing {startRecord}–{endRecord} of {totalCount}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage <= 1}
              className={`px-3.5 py-1.5 rounded-lg border border-[#DCE2DC] text-[#17201B] text-xs font-semibold transition-colors ${
                currentPage <= 1 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-[#F4F6F3] cursor-pointer'
              }`}
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage >= totalPages}
              className={`px-3.5 py-1.5 rounded-lg border border-[#DCE2DC] text-[#17201B] text-xs font-semibold transition-colors ${
                currentPage >= totalPages ? 'opacity-40 cursor-not-allowed' : 'hover:bg-[#F4F6F3] cursor-pointer'
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
