import React, { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { useDashboard } from '../../hooks/useDashboard';
import type { CollectorStatus } from '../../types/collector.types';

type SyncHealth = 'Synced' | '3 pending' | '1 failed' | 'No data';

const getSyncBadge = (status: CollectorStatus, index: number): { label: SyncHealth; type: 'success' | 'warning' | 'danger' | 'neutral' } => {
  if (status === 'On Leave' || status === 'Inactive') {
    return { label: 'No data', type: 'neutral' };
  }
  if (index % 5 === 2) return { label: '3 pending', type: 'warning' };
  if (index % 5 === 3) return { label: '1 failed', type: 'danger' };
  return { label: 'Synced', type: 'success' };
};

export const CollectorsPage: React.FC = () => {
  const {
    collectors,
    setIsAddCollectorModalOpen,
    setSelectedCollectorForDetail,
  } = useDashboard();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'On Leave'>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;

  const filteredCollectors = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return collectors.filter((c) => {
      const matchesSearch =
        !query ||
        c.fullName.toLowerCase().includes(query) ||
        c.id.toLowerCase().includes(query) ||
        c.phoneNumber.toLowerCase().includes(query);
      const matchesStatus =
        statusFilter === 'All' ||
        (statusFilter === 'Active' && c.status === 'Active') ||
        (statusFilter === 'On Leave' && (c.status === 'On Leave' || c.status === 'Inactive'));
      return matchesSearch && matchesStatus;
    });
  }, [collectors, searchQuery, statusFilter]);

  const totalCount = filteredCollectors.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startRecord = totalCount === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endRecord = Math.min(safePage * pageSize, totalCount);
  const displayedCollectors = filteredCollectors.slice((safePage - 1) * pageSize, safePage * pageSize);

  const renderSyncPill = (sync: ReturnType<typeof getSyncBadge>) => {
    switch (sync.type) {
      case 'success':
        return (
          <span className="px-2.5 py-0.5 bg-[#E1F4E8] text-[#0B5D3B] rounded-full inline-flex items-center text-xs font-semibold">
            ✓ {sync.label}
          </span>
        );
      case 'warning':
        return (
          <span className="px-2.5 py-0.5 bg-[#FEF3C7] text-[#B45309] rounded-full inline-flex items-center text-xs font-semibold">
            ⟳ {sync.label}
          </span>
        );
      case 'danger':
        return (
          <span className="px-2.5 py-0.5 bg-[#FEF2F2] text-[#B91C1C] rounded-full inline-flex items-center text-xs font-semibold">
            ! {sync.label}
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 bg-[#F1F5F9] text-[#56625B] rounded-full inline-flex items-center text-xs font-semibold">
            ● {sync.label}
          </span>
        );
    }
  };

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 flex flex-col justify-start items-start gap-6 font-['Inter',sans-serif]">
      {/* Header */}
      <div className="self-stretch flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1 flex flex-col gap-1">
          <h1 className="text-[#17201B] text-2xl sm:text-[26px] font-bold tracking-tight">
            Collectors
          </h1>
          <p className="text-[#56625B] text-[13px]">
            Manage collectors, assigned farmers and sync health
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddCollectorModalOpen(true)}
          className="px-4 py-2.5 bg-[#0B5D3B] hover:bg-[#08472D] text-white rounded-lg text-sm font-semibold transition-colors cursor-pointer"
        >
          Add collector
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
            placeholder="Search collectors"
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

        <div className="flex items-center gap-2 shrink-0">
          {(['All', 'Active', 'On Leave'] as const).map((tab) => {
            const label = tab === 'On Leave' ? 'On leave' : tab;
            const active = statusFilter === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setStatusFilter(tab);
                  setCurrentPage(1);
                }}
                className={`px-3.5 py-2 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                  active
                    ? 'bg-[#0B5D3B] text-white'
                    : 'bg-white border border-[#DCE2DC] text-[#56625B] hover:text-[#17201B] hover:bg-[#F4F6F3]'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Collectors Table */}
      <div className="self-stretch bg-white rounded-xl border border-[#DCE2DC] flex flex-col overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[760px] text-left border-collapse">
            <thead>
              <tr className="bg-[#F4F6F3] border-b border-[#DCE2DC] text-[#56625B] text-xs font-semibold">
                <th className="py-3 px-5">ID</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Mobile</th>
                <th className="py-3 px-4 text-right">Farmers</th>
                <th className="py-3 px-4 text-right">Today (kg)</th>
                <th className="py-3 px-4">Sync</th>
                <th className="py-3 px-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE2DC] text-[13px] text-[#17201B]">
              {displayedCollectors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#56625B] text-sm">
                    No collectors found matching your criteria.
                  </td>
                </tr>
              ) : (
                displayedCollectors.map((collector, idx) => {
                  const sync = getSyncBadge(collector.status, idx);
                  const isActive = collector.status === 'Active';
                  return (
                    <tr
                      key={collector.id}
                      onClick={() => setSelectedCollectorForDetail(collector)}
                      className="hover:bg-[#F4F6F3]/60 transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-5 font-medium">{collector.id}</td>
                      <td className="py-3 px-4 font-medium">{collector.fullName}</td>
                      <td className="py-3 px-4 text-[#56625B]">{collector.phoneNumber}</td>
                      <td className="py-3 px-4 text-right tabular-nums">{collector.activeFarmersCount}</td>
                      <td className="py-3 px-4 text-right tabular-nums">{collector.todayIntakeKg.toLocaleString()}</td>
                      <td className="py-3 px-4">{renderSyncPill(sync)}</td>
                      <td className="py-3 px-5">
                        {isActive ? (
                          <span className="px-2.5 py-0.5 bg-[#E1F4E8] text-[#0B5D3B] rounded-full inline-flex items-center text-xs font-semibold">
                            ✓ Active
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 bg-[#F1F5F9] text-[#56625B] rounded-full inline-flex items-center text-xs font-semibold">
                            ● On leave
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
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
    </div>
  );
};
