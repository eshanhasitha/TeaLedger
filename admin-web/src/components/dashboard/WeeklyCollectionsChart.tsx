import React from 'react';
import type { DailyCollectionTrend } from '../../types/dashboard.types';

interface WeeklyCollectionsChartProps {
  trend: DailyCollectionTrend[];
}

export const WeeklyCollectionsChart: React.FC<WeeklyCollectionsChartProps> = ({ trend }) => {
  const maxKg = Math.max(...trend.map((t) => t.kg), 1240);
  const chartHeightPx = 160;

  return (
    <div className="flex-1 p-5 bg-white rounded-xl border border-[#DCE2DC] flex flex-col justify-start items-start gap-3.5">
      <div className="text-[#17201B] text-base font-semibold">
        Verified collections, last 7 days (kg)
      </div>

      <div className="self-stretch flex justify-between items-end overflow-x-auto min-h-[195px] pt-4 pb-1 gap-2">
        {trend.map((item) => {
          const calculatedHeight = Math.max(28, Math.round((item.kg / maxKg) * chartHeightPx));

          return (
            <div
              key={item.day}
              className="flex-1 min-w-[44px] inline-flex flex-col justify-end items-center gap-1.5 group cursor-pointer"
              title={`${item.day}: ${item.kg} kg verified intake`}
            >
              <div className="text-[#17201B] text-xs font-semibold group-hover:text-[#0B5D3B] transition-colors">
                {item.kg}
              </div>

              <div
                className="w-8 sm:w-10 bg-[#0B5D3B] rounded-t-md group-hover:bg-[#08472D] transition-all duration-300"
                style={{ height: `${calculatedHeight}px` }}
              />

              <div className="text-[#56625B] text-xs font-normal whitespace-nowrap">
                {item.day}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
