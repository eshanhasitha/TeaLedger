import React, { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { useDashboard } from '../../hooks/useDashboard';
import type { IntakeSlip } from '../../types/dashboard.types';
import { exportToCsv } from '../../utils/exportToCsv';

type FilterTab = 'All' | 'Verified' | 'Pending sync' | 'Needs review';

export const CollectionsPage: React.FC = () => {
  const { slips, verifySlip, reviewSlip, addToast } = useDashboard();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<FilterTab>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSlipId, setSelectedSlipId] = useState<string | null>(null);
  const pageSize = 5;

  const normalizeStatus = (status: IntakeSlip['status']): 'Verified' | 'Pending sync' | 'Needs review' => {
    if (status === 'Verified') return 'Verified';
    if (status === 'Pending') return 'Pending sync';
    return 'Needs review';
  };

  const filteredSlips = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return slips.filter((s) => {
      const norm = normalizeStatus(s.status);
      const matchesSearch =
        !q ||
        s.id.toLowerCase().includes(q) ||
        s.farmerName.toLowerCase().includes(q) ||
        s.collectorName.toLowerCase().includes(q);
      const matchesTab = filterTab === 'All' || norm === filterTab;
      return matchesSearch && matchesTab;
    });
  }, [slips, searchQuery, filterTab]);

  const totalCount = filteredSlips.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startRecord = totalCount === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endRecord = Math.min(safePage * pageSize, totalCount);
  const displayedSlips = filteredSlips.slice((safePage - 1) * pageSize, safePage * pageSize);

  const reviewTarget = useMemo(() => {
    if (selectedSlipId) {
      const found = slips.find((s) => s.id === selectedSlipId);
      if (found) return found;
    }
    return slips.find((s) => normalizeStatus(s.status) === 'Needs review') || slips[0] || null;
  }, [slips, selectedSlipId]);

  const handleExportCsv = () => {
    exportToCsv(
      'tealedger-collections.csv',
      filteredSlips.map((s) => ({
        Slip: s.id,
        Date: s.timestamp,
        Farmer: s.farmerName,
        Collector: s.collectorName,
        GrossKg: s.grossKg.toFixed(2),
        ReductionsKg: s.tareKg.toFixed(2),
        FinalKg: s.netKg.toFixed(2),
        Status: normalizeStatus(s.status),
      }))
    );
    addToast({
      type: 'success',
      title: 'Collections Exported',
      message: `Exported ${filteredSlips.length} collection slips to CSV.`,
    });
  };

  const renderStatusBadge = (status: IntakeSlip['status']) => {
    const norm = normalizeStatus(status);
    if (norm === 'Verified') {
      return (
        <span className="px-2.5 py-0.5 bg-[#E1F4E8] text-[#0B5D3B] rounded-full inline-flex items-center text-xs font-semibold">
          ✓ Verified
        </span>
      );
    }
    if (norm === 'Pending sync') {
      return (
        <span className="px-2.5 py-0.5 bg-[#FEF3C7] text-[#B45309] rounded-full inline-flex items-center text-xs font-semibold">
          ⟳ Pending sync
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 bg-[#FEF2F2] text-[#B91C1C] rounded-full inline-flex items-center text-xs font-semibold">
        ! Needs review
      </span>
    );
  };

  // Server recalculation comparison values for review card
  const submittedGross = reviewTarget ? reviewTarget.grossKg : 41.0;
  const submittedReduction = reviewTarget ? -Math.abs(reviewTarget.tareKg) : -3.2;
  const submittedFinal = Number((submittedGross + submittedReduction).toFixed(2));
  const serverReduction = Number((submittedReduction - 1.9).toFixed(2));
  const serverFinal = Number((submittedGross + serverReduction).toFixed(2));
  const diffKg = Math.abs(submittedFinal - serverFinal).toFixed(2);

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 flex flex-col gap-6 font-['Inter',sans-serif]">
      {/* Header */}
      <div className="self-stretch flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1 flex flex-col gap-1">
          <h1 className="text-[#17201B] text-2xl sm:text-[26px] font-bold tracking-tight">
            Collections
          </h1>
          <p className="text-[#56625B] text-[13px]">
            Monitor recorded collections and verify weights
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCsv}
          className="px-4 py-2.5 bg-white border border-[#DCE2DC] hover:bg-[#F4F6F3] text-[#17201B] rounded-lg text-sm font-semibold transition-colors cursor-pointer"
        >
          Export CSV
        </button>
      </div>

      {/* Search & Filter Pills */}
      <div className="self-stretch flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <div className="flex-1 px-3.5 py-2.5 bg-white rounded-lg border border-[#DCE2DC] flex items-center gap-2 focus-within:border-[#0B5D3B] focus-within:ring-2 focus-within:ring-[#E1F4E8]">
          <Search className="size-4 text-[#56625B] shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search slip, farmer or collector"
            className="flex-1 text-[#17201B] placeholder:text-[#56625B] text-sm bg-transparent outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-[#56625B] hover:text-[#17201B] p-0.5 cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0 overflow-x-auto">
          {(['All', 'Verified', 'Pending sync', 'Needs review'] as const).map((tab) => {
            const active = filterTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setFilterTab(tab);
                  setCurrentPage(1);
                }}
                className={`px-3.5 py-2 rounded-full text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap ${
                  active
                    ? 'bg-[#0B5D3B] text-white'
                    : 'bg-white border border-[#DCE2DC] text-[#56625B] hover:text-[#17201B] hover:bg-[#F4F6F3]'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* Collections Table */}
      <div className="self-stretch bg-white rounded-xl border border-[#DCE2DC] flex flex-col overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[820px] text-left border-collapse">
            <thead>
              <tr className="bg-[#F4F6F3] border-b border-[#DCE2DC] text-[#56625B] text-xs font-semibold">
                <th className="py-3 px-5">Slip</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Farmer</th>
                <th className="py-3 px-4">Collector</th>
                <th className="py-3 px-4 text-right">Gross (kg)</th>
                <th className="py-3 px-4 text-right">Reductions</th>
                <th className="py-3 px-4 text-right">Final (kg)</th>
                <th className="py-3 px-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE2DC] text-[13px] text-[#17201B]">
              {displayedSlips.map((slip) => (
                <tr
                  key={slip.id}
                  onClick={() => setSelectedSlipId(slip.id)}
                  className={`hover:bg-[#F4F6F3]/60 transition-colors cursor-pointer ${
                    reviewTarget?.id === slip.id ? 'bg-[#F4F6F3]/40' : ''
                  }`}
                >
                  <td className="py-3 px-5 font-medium">{slip.id}</td>
                  <td className="py-3 px-4 text-[#56625B]">{slip.timestamp}</td>
                  <td className="py-3 px-4">{slip.farmerName}</td>
                  <td className="py-3 px-4">{slip.collectorName}</td>
                  <td className="py-3 px-4 text-right tabular-nums">{slip.grossKg.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right tabular-nums">
                    {slip.tareKg !== 0 ? `−${Math.abs(slip.tareKg).toFixed(2)}` : '0.00'}
                  </td>
                  <td className="py-3 px-4 text-right font-semibold tabular-nums">{slip.netKg.toFixed(2)}</td>
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
              disabled={safePage <= 1}
              className={`px-3.5 py-1.5 rounded-lg border border-[#DCE2DC] text-[#17201B] text-xs font-semibold transition-colors ${
                safePage <= 1 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-[#F4F6F3] cursor-pointer'
              }`}
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={safePage >= totalPages}
              className={`px-3.5 py-1.5 rounded-lg border border-[#DCE2DC] text-[#17201B] text-xs font-semibold transition-colors ${
                safePage >= totalPages ? 'opacity-40 cursor-not-allowed' : 'hover:bg-[#F4F6F3] cursor-pointer'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Detail Card: Weight Verification Review (Figma A7) */}
      {reviewTarget && (
        <div className="self-stretch p-5 bg-white rounded-xl border border-[#DCE2DC] flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <h2 className="text-[#17201B] text-base font-bold">
                Needs review · Slip {reviewTarget.id}
              </h2>
              <span className="px-2.5 py-0.5 bg-[#FEF2F2] text-[#B91C1C] rounded-full text-xs font-semibold">
                ! Needs review
              </span>
            </div>
          </div>

          <p className="text-[#56625B] text-xs sm:text-[13px]">
            The collector&apos;s final weight differs from the server recalculation by {diffKg} kg. Compare and choose how to resolve.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left: Submitted by collector */}
            <div className="p-4 rounded-lg bg-[#F4F6F3] border border-[#DCE2DC] flex flex-col gap-2">
              <div className="text-[#56625B] text-xs font-semibold uppercase tracking-wide">
                Submitted by collector
              </div>
              <div className="flex justify-between text-xs text-[#17201B]">
                <span>Gross</span>
                <span className="tabular-nums">{submittedGross.toFixed(2)} kg</span>
              </div>
              <div className="flex justify-between text-xs text-[#17201B]">
                <span>Reductions</span>
                <span className="tabular-nums">{submittedReduction.toFixed(2)} kg</span>
              </div>
              <div className="pt-2 border-t border-[#DCE2DC] flex justify-between text-sm font-bold text-[#17201B]">
                <span>Final</span>
                <span className="tabular-nums">{submittedFinal.toFixed(2)} kg</span>
              </div>
            </div>

            {/* Right: Server-verified */}
            <div className="p-4 rounded-lg bg-[#E1F4E8] border border-[#0B5D3B]/20 flex flex-col gap-2">
              <div className="text-[#0B5D3B] text-xs font-semibold uppercase tracking-wide">
                Server-verified
              </div>
              <div className="flex justify-between text-xs text-[#17201B]">
                <span>Gross</span>
                <span className="tabular-nums">{submittedGross.toFixed(2)} kg</span>
              </div>
              <div className="flex justify-between text-xs text-[#17201B]">
                <span>Reductions</span>
                <span className="tabular-nums">{serverReduction.toFixed(2)} kg</span>
              </div>
              <div className="pt-2 border-t border-[#0B5D3B]/20 flex justify-between text-sm font-bold text-[#0B5D3B]">
                <span>Final</span>
                <span className="tabular-nums">{serverFinal.toFixed(2)} kg</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end items-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={() =>
                addToast({
                  type: 'info',
                  title: 'Recheck Requested',
                  message: `Field recheck dispatched to ${reviewTarget.collectorName} for Slip ${reviewTarget.id}.`,
                })
              }
              className="px-4 py-2 bg-white border border-[#DCE2DC] hover:bg-[#F4F6F3] text-[#17201B] rounded-lg text-xs sm:text-sm font-semibold cursor-pointer transition-colors"
            >
              Request recheck
            </button>
            <button
              type="button"
              onClick={() => {
                reviewSlip(reviewTarget.id, Math.abs(serverReduction), reviewTarget.ratePerKg);
                verifySlip(reviewTarget.id);
              }}
              className="px-4 py-2 bg-[#0B5D3B] hover:bg-[#08472D] text-white rounded-lg text-xs sm:text-sm font-semibold cursor-pointer transition-colors"
            >
              Accept server weight
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

