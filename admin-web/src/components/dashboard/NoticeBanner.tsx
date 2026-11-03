import React from 'react';
import { Megaphone, Droplets } from 'lucide-react';

export const NoticeBanner: React.FC = () => {
  return (
    <div className="grid grid-cols-1 gap-3.5 md:grid-cols-12">
      {/* Left: Sri Lanka Tea Board Notice */}
      <div className="flex items-center gap-3.5 rounded-2xl border border-[#eedec7] bg-[#fbf5eb] p-4 shadow-2xs md:col-span-8 lg:col-span-9">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#2e1d11] text-[#f4d9b6] shadow-xs">
          <Megaphone className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#3d291a]">
              SRI LANKA TEA BOARD NOTICE
            </span>
            <span className="rounded-full bg-[#3d291a] px-2 py-0.5 text-[10px] font-bold text-[#fce8d5]">
              CR-2024-11
            </span>
          </div>
          <p className="mt-1 text-xs text-[#523d2b] leading-relaxed">
            November 2024 recommended minimum green leaf base price revised upward to{' '}
            <strong className="font-bold text-[#2e1d11]">LKR 255.00/kg</strong>. Adjust settlement baseline calculators prior to Oct 31 rollover.
          </p>
        </div>
      </div>

      {/* Right: Intake Moisture Index */}
      <div className="flex items-center justify-between rounded-2xl border border-[#ded8cc] bg-white p-4 shadow-2xs md:col-span-4 lg:col-span-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
            <Droplets className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#69796e]">
              INTAKE MOISTURE INDEX
            </div>
            <div className="mt-0.5 text-2xl font-extrabold tracking-tight text-[#16271c]">
              11.2%
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
            Optimal Grade A
          </span>
          <span className="mt-1 text-[10px] font-medium text-slate-500">
            Tolerance: &lt;14.0%
          </span>
        </div>
      </div>
    </div>
  );
};

