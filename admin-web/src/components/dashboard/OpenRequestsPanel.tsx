import React from 'react';
import type { DashboardTeaReadyRequest } from '../../types/dashboard.types';

interface OpenRequestsPanelProps {
  requests: DashboardTeaReadyRequest[];
}

export const OpenRequestsPanel: React.FC<OpenRequestsPanelProps> = ({ requests }) => {
  return (
    <div className="w-full lg:w-80 px-5 py-4 bg-surface-card rounded-2xl outline outline-1 outline-offset-[-1px] outline-border-default flex flex-col justify-start items-start gap-3 overflow-hidden shadow-xs">
      <div className="self-stretch justify-start text-text-primary text-base font-semibold font-['Inter']">
        Open tea-ready requests
      </div>

      <div className="self-stretch flex flex-col justify-start items-stretch">
        {requests.map((req, index) => {
          const isPending = req.status === 'Pending';
          const isLast = index === requests.length - 1;

          return (
            <div
              key={req.id}
              className={`self-stretch py-2 ${
                !isLast ? 'border-b border-border-default' : ''
              } flex justify-between items-center gap-2 overflow-hidden hover:bg-slate-50/70 transition-colors rounded-lg px-1`}
            >
              <div className="flex-1 flex flex-col justify-start items-start gap-0.5 overflow-hidden">
                <div className="self-stretch justify-start text-text-primary text-sm font-semibold font-['Inter'] truncate">
                  {req.farmerName}
                </div>
                <div className="self-stretch justify-start text-text-secondary text-xs font-normal font-['Inter']">
                  {req.locationOrBlock} · {req.bagsCount} bags
                </div>
              </div>

              {isPending ? (
                <div
                  data-status="warning"
                  className="px-2.5 py-1 bg-status-warning-bg rounded-[999px] flex justify-start items-center shrink-0"
                >
                  <span className="justify-start text-status-warning text-xs font-semibold font-['Inter']">
                    ◔ Pending
                  </span>
                </div>
              ) : (
                <div
                  data-status="info"
                  className="px-2.5 py-1 bg-status-info-bg rounded-[999px] flex justify-start items-center shrink-0"
                >
                  <span className="justify-start text-status-info text-xs font-semibold font-['Inter']">
                    ● {req.status}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
