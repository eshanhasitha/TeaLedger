import React from 'react';
import { Truck, Navigation, Wind, Thermometer } from 'lucide-react';
import { useDashboard } from '../../hooks/useDashboard';

export const EstateLogisticsGrid: React.FC = () => {
  const { stationStatus } = useDashboard();

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-[#ded8cc] bg-white p-5 shadow-xs transition-shadow hover:shadow-sm">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#f0ece3] pb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-[#1a2b20]">
              Estate Logistics Grid
            </h2>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600"></span>
            </span>
            GPS Live
          </span>
        </div>

        {/* Topographic Central Highlands Map Visual */}
        <div className="relative mt-3.5 h-36 w-full overflow-hidden rounded-xl border border-[#ded8cc] bg-[#e3eae3]">
          {/* Stylized contour map with hills and routes */}
          <svg className="absolute inset-0 h-full w-full opacity-70" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="gridPattern" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#cfdbd0" strokeWidth="0.8" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#gridPattern)" />
            {/* Mountain contour curves */}
            <path
              d="M -20,80 Q 80,20 180,60 T 380,40 T 580,90"
              fill="none"
              stroke="#a7c2ac"
              strokeWidth="2.5"
            />
            <path
              d="M -10,120 Q 90,60 210,100 T 420,70 T 600,120"
              fill="none"
              stroke="#8ba890"
              strokeWidth="2"
            />
            <path
              d="M 50,-10 Q 150,90 280,50 T 490,130"
              fill="none"
              stroke="#6b8f71"
              strokeWidth="1.5"
              strokeDasharray="4 2"
            />

            {/* GPS tracker dots */}
            <circle cx="75" cy="45" r="4.5" fill="#16a34a" />
            <circle cx="160" cy="70" r="4.5" fill="#16a34a" />
            <circle cx="240" cy="35" r="5" fill="#047857" />
            <circle cx="310" cy="85" r="4" fill="#16a34a" />
            <circle cx="390" cy="50" r="4.5" fill="#059669" />
          </svg>

          {/* Map Overlay Badge */}
          <div className="absolute inset-x-2 bottom-2 rounded-lg bg-white/90 p-2 shadow-sm backdrop-blur-xs border border-emerald-100 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#1b3424]">
              <Navigation className="h-3.5 w-3.5 text-emerald-700" />
              <span>CENTRAL HIGHLANDS BASIN</span>
            </div>
            <span className="text-[10px] font-semibold text-emerald-800">
              24 Collector GPS Trackers Active
            </span>
          </div>
        </div>

        {/* Station Status Indicators */}
        <div className="mt-4 space-y-3">
          {/* Withering Trough */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-[#1a2b20]">
              <span>Withering Trough 01</span>
              <span className="text-emerald-800">
                0{stationStatus.capacityPercentage}% Capacity
              </span>
            </div>
            <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-[#183a27]"
                style={{ width: `${stationStatus.capacityPercentage}%` }}
              />
            </div>
          </div>

          {/* Environmental Gauges */}
          <div className="flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 rounded-lg bg-[#f8faf8] px-2.5 py-1.5 border border-slate-200/80">
              <Wind className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-slate-600">Silica Gel Dehumidifier:</span>
              <span className="font-bold text-emerald-700">
                {stationStatus.dehumidifierStatus}
              </span>
            </div>

            <div className="flex items-center gap-1.5 rounded-lg bg-[#f8faf8] px-2.5 py-1.5 border border-slate-200/80">
              <Thermometer className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-slate-600">Optimal</span>
              <span className="font-bold text-emerald-700">
                {stationStatus.optimalTemp}
              </span>
            </div>
          </div>

          {/* Active Weighbridge Live Card */}
          {stationStatus.activeBatch && (
            <div className="mt-2 flex items-center justify-between rounded-xl border border-emerald-200/90 bg-[#f4f9f5] p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#183a27] text-white">
                  <Truck className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#162a1e]">
                    {stationStatus.activeBatch.batchNumber}
                  </div>
                  <div className="text-[11px] text-[#607166]">
                    Driver: {stationStatus.activeBatch.driverName} •{' '}
                    <strong className="text-slate-800">
                      {stationStatus.activeBatch.grossWeightTons} tons
                    </strong>
                  </div>
                </div>
              </div>

              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-800">
                {stationStatus.activeBatch.status}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

