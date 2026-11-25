import React from 'react';
import type { DashboardStats } from '../../types/dashboard.types';

interface MetricCardsGridProps {
  stats: DashboardStats;
}

export const MetricCardsGrid: React.FC<MetricCardsGridProps> = ({ stats }) => {
  return (
    <div className="self-stretch grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 overflow-hidden">
      {/* 1. Collected today */}
      <div className="px-4 py-4 bg-surface-card rounded-2xl outline outline-1 outline-offset-[-1px] outline-border-default flex flex-col justify-start items-start gap-1.5 overflow-hidden shadow-xs hover:border-emerald-300 transition-colors">
        <div className="self-stretch justify-start text-text-secondary text-xs font-medium font-['Inter']">
          Collected today
        </div>
        <div className="self-stretch justify-start text-text-primary text-2xl sm:text-3xl font-bold font-['Inter']">
          {stats.collectedTodayKg.toLocaleString()} kg
        </div>
        <div className="self-stretch justify-start text-text-secondary text-xs font-normal font-['Inter']">
          Verified weight, {stats.verifiedSlipsCount} slips
        </div>
      </div>

      {/* 2. Open requests */}
      <div className="px-4 py-4 bg-surface-card rounded-2xl outline outline-1 outline-offset-[-1px] outline-border-default flex flex-col justify-start items-start gap-1.5 overflow-hidden shadow-xs hover:border-emerald-300 transition-colors">
        <div className="self-stretch justify-start text-text-secondary text-xs font-medium font-['Inter']">
          Open requests
        </div>
        <div className="self-stretch justify-start text-text-primary text-2xl sm:text-3xl font-bold font-['Inter']">
          {stats.openRequestsCount}
        </div>
        <div className="self-stretch justify-start text-text-secondary text-xs font-normal font-['Inter']">
          Tea-ready, awaiting collection
        </div>
      </div>

      {/* 3. Active collectors */}
      <div className="px-4 py-4 bg-surface-card rounded-2xl outline outline-1 outline-offset-[-1px] outline-border-default flex flex-col justify-start items-start gap-1.5 overflow-hidden shadow-xs hover:border-emerald-300 transition-colors">
        <div className="self-stretch justify-start text-text-secondary text-xs font-medium font-['Inter']">
          Active collectors
        </div>
        <div className="self-stretch justify-start text-text-primary text-2xl sm:text-3xl font-bold font-['Inter']">
          {stats.activeCollectorsCount} / {stats.totalCollectorsCount}
        </div>
        <div className="self-stretch justify-start text-text-secondary text-xs font-normal font-['Inter']">
          {stats.onLeaveCollectorsCount} on leave today
        </div>
      </div>

      {/* 4. Monthly settlement */}
      <div className="px-4 py-4 bg-surface-card rounded-2xl outline outline-1 outline-offset-[-1px] outline-border-default flex flex-col justify-start items-start gap-1.5 overflow-hidden shadow-xs hover:border-emerald-300 transition-colors">
        <div className="self-stretch justify-start text-text-secondary text-xs font-medium font-['Inter']">
          {stats.monthlySettlementMonth} settlement (LKR)
        </div>
        <div className="self-stretch justify-start text-text-primary text-2xl sm:text-3xl font-bold font-['Inter']">
          {stats.monthlySettlementFormatted}
        </div>
        <div>
          <div
            data-status="info"
            className="px-2.5 py-1 bg-status-info-bg rounded-[999px] inline-flex justify-start items-center"
          >
            <span className="justify-start text-status-info text-xs font-semibold font-['Inter']">
              {stats.isSettlementEstimated ? '≈ Estimated' : '● Finalized'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
