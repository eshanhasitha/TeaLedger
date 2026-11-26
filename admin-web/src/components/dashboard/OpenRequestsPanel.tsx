import React from 'react';
import type { DashboardTeaReadyRequest } from '../../types/dashboard.types';

interface OpenRequestsPanelProps {
  requests: DashboardTeaReadyRequest[];
}

export const OpenRequestsPanel: React.FC<OpenRequestsPanelProps> = ({ requests }) => {
  return (
    <div className="w-full lg:w-[360px] p-5 bg-white rounded-xl border border-[#DCE2DC] flex flex-col justify-start items-start gap-3">
      <div className="text-[#17201B] text-base font-semibold">
        Open tea-ready requests
      </div>

      <div className="self-stretch flex flex-col">
        {requests.map((req, index) => {
          const isPending = req.status === 'Pending';
          const isLast = index === requests.length - 1;

          return (
            <div
              key={req.id}
              className={`self-stretch py-2.5 ${
                !isLast ? 'border-b border-[#DCE2DC]' : ''
              } flex justify-between items-center gap-2`}
            >
              <div className="flex-1 flex flex-col justify-start items-start gap-0.5 overflow-hidden">
                <div className="text-[#17201B] text-sm font-semibold truncate">
                  {req.farmerName}
                </div>
                <div className="text-[#56625B] text-xs font-normal">
                  {req.locationOrBlock} · {req.bagsCount} bags
                </div>
              </div>

              {isPending ? (
                <span className="px-2.5 py-0.5 bg-[#FEF3C7] text-[#B45309] rounded-full inline-flex items-center shrink-0 text-xs font-semibold">
                  ◔ Pending
                </span>
              ) : (
                <span className="px-2.5 py-0.5 bg-[#EFF6FF] text-[#1D4ED8] rounded-full inline-flex items-center shrink-0 text-xs font-semibold">
                  ● {req.status}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
