import React from 'react';
import type { DailyCollectionTrend } from '../../types/dashboard.types';

interface WeeklyCollectionsChartProps {
  trend: DailyCollectionTrend[];
}

export const WeeklyCollectionsChart: React.FC<WeeklyCollectionsChartProps> = ({ trend }) => {
  // Peak weight for proportional bar height calculations (max height 160px)
  const maxKg = Math.max(...trend.map((t) => t.kg), 1240);
  const chartHeightPx = 160;

  return (
    <div className="flex-1 px-5 py-4 bg-surface-card rounded-2xl outline outline-1 outline-offset-[-1px] outline-border-default flex flex-col justify-start items-start gap-3.5 overflow-hidden shadow-xs">
      {/* Title */}
      <div className="self-stretch justify-start text-text-primary text-base font-semibold font-['Inter']">
        Verified collections, last 7 days (kg)
      </div>

      {/* Bars Container */}
      <div className="self-stretch flex justify-between items-end overflow-x-auto min-h-[190px] pt-4 pb-1">
        {trend.map((item) => {
          // Dynamic calculated pixel height proportional to max intake
          const calculatedHeight = Math.max(32, Math.round((item.kg / maxKg) * chartHeightPx));

          return (
            <div
              key={item.day}
              className="inline-flex flex-col justify-end items-center gap-1.5 overflow-hidden group cursor-pointer"
              title={`${item.day}: ${item.kg} kg verified intake`}
            >
              {/* Value on top */}
              <div className="justify-start text-text-primary text-xs font-semibold font-['Inter'] group-hover:text-brand-primary transition-colors">
                {item.kg}
              </div>

              {/* Bar */}
              <div
                className="w-8 sm:w-10 bg-brand-primary rounded-md group-hover:bg-brand-primary-hover transition-all duration-300"
                style={{ height: `${calculatedHeight}px` }}
              />

              {/* Day label */}
              <div className="justify-start text-text-secondary text-xs font-normal font-['Inter'] whitespace-nowrap">
                {item.day}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
