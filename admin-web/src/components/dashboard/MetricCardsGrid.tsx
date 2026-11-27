import React from 'react';
import type { DashboardStats } from '../../types/dashboard.types';

interface MetricCardsGridProps {
  stats: DashboardStats;
}

export const MetricCardsGrid: React.FC<MetricCardsGridProps> = ({ stats }) => {
  return (
    <div className="self-stretch grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="p-4 bg-white rounded-xl border border-[#DCE2DC] flex flex-col justify-start items-start gap-1.5">
        <div className="text-[#56625B] text-xs font-medium">
          Collected today
        </div>
        <div className="text-[#17201B] text-2xl sm:text-[28px] font-bold leading-tight">
          {stats.collectedTodayKg.toLocaleString()} kg
        </div>
        <div className="text-[#56625B] text-xs font-normal">
          Verified weight, {stats.verifiedSlipsCount} slips
        </div>
      </div>

      <div className="p-4 bg-white rounded-xl border border-[#DCE2DC] flex flex-col justify-start items-start gap-1.5">
        <div className="text-[#56625B] text-xs font-medium">
          Open requests
        </div>
        <div className="text-[#17201B] text-2xl sm:text-[28px] font-bold leading-tight">
          {stats.openRequestsCount}
        </div>
        <div className="text-[#56625B] text-xs font-normal">
          Tea-ready, awaiting collection
        </div>
      </div>

      <div className="p-4 bg-white rounded-xl border border-[#DCE2DC] flex flex-col justify-start items-start gap-1.5">
        <div className="text-[#56625B] text-xs font-medium">
          Active collectors
        </div>
        <div className="text-[#17201B] text-2xl sm:text-[28px] font-bold leading-tight">
          {stats.activeCollectorsCount} / {stats.totalCollectorsCount}
        </div>
        <div className="text-[#56625B] text-xs font-normal">
          {stats.onLeaveCollectorsCount} on leave today
        </div>
      </div>

      <div className="p-4 bg-white rounded-xl border border-[#DCE2DC] flex flex-col justify-start items-start gap-1.5">
        <div className="text-[#56625B] text-xs font-medium">
          {stats.monthlySettlementMonth} settlement (LKR)
        </div>
        <div className="text-[#17201B] text-2xl sm:text-[28px] font-bold leading-tight">
          {stats.monthlySettlementFormatted}
        </div>
        <div>
          <span className="px-2.5 py-0.5 bg-[#EFF6FF] text-[#1D4ED8] rounded-full inline-flex items-center text-xs font-semibold">
            {stats.isSettlementEstimated ? '≡ Estimated' : '✓ Finalized'}
          </span>
        </div>
      </div>
    </div>
  );
};
