import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { ShieldCheck } from 'lucide-react';
import { DAILY_COLLECTION_DATA } from '../../services/mockData';

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const gross = payload.find((p) => p.name === 'Gross Intake')?.value || 0;
    const net = payload.find((p) => p.name === 'Net Usable')?.value || 0;
    const tare = Number((gross - net).toFixed(1));

    return (
      <div className="rounded-xl border border-[#ded8cc] bg-white p-3 shadow-lg text-xs">
        <div className="font-bold text-[#1e2e23]">{label}</div>
        <div className="mt-1.5 space-y-1">
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="h-2 w-2 rounded-full bg-[#163824]"></span>
              Gross Intake:
            </span>
            <span className="font-semibold text-slate-900">{gross.toLocaleString()} kg</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="h-2 w-2 rounded-full bg-[#34d399]"></span>
              Net Usable:
            </span>
            <span className="font-semibold text-emerald-800">{net.toLocaleString()} kg</span>
          </div>
          <div className="flex items-center justify-between gap-4 pt-1 border-t border-slate-100 text-[11px] text-slate-500">
            <span>Water/Tare Ded:</span>
            <span className="font-medium text-rose-600">-{tare.toLocaleString()} kg</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const DailyLeafTrendChart: React.FC = () => {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-[#ded8cc] bg-white p-5 shadow-xs transition-shadow hover:shadow-sm">
      {/* Chart Header */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-[#1a2b20]">
              Daily Leaf Collection Trend
            </h2>
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-200">
              14 Days
            </span>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-xs bg-[#163824]"></span>
              <span>Gross Intake</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-xs bg-[#34d399]"></span>
              <span>Net Usable</span>
            </div>
          </div>
        </div>

        <p className="mt-1 text-xs text-[#6e7d73]">
          Gross Intake (kg) vs. Usable Net Leaf across Nuwara Eliya, Talawakelle & Bogawantalawa
        </p>
      </div>

      {/* Area Chart Container */}
      <div className="relative mt-4 h-64 w-full">
        {/* Peak indicator callout overlay */}
        <div className="pointer-events-none absolute left-[56%] top-2 z-10 -translate-x-1/2 rounded-full bg-[#183a27] px-2 py-0.5 text-[10px] font-bold text-emerald-200 shadow-xs border border-emerald-500/30">
          Peak
        </div>

        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={DAILY_COLLECTION_DATA}
            margin={{ top: 20, right: 10, left: -15, bottom: 0 }}
          >
            <defs>
              <linearGradient id="grossGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#183a27" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#183a27" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="netGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0ebe1" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={{ stroke: '#ded8cc' }}
              tick={{ fill: '#738278', fontSize: 11 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#738278', fontSize: 11 }}
              tickFormatter={(val) => `${Math.round(val / 1000)}k`}
              domain={[8000, 19000]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="grossIntake"
              name="Gross Intake"
              stroke="#163824"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#grossGradient)"
            />
            <Area
              type="monotone"
              dataKey="netUsable"
              name="Net Usable"
              stroke="#10b981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#netGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Card Footer Bar */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#f0ece3] pt-3 text-xs text-[#526357]">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>
            Factory Water Tare Deduction avg:{' '}
            <strong className="font-semibold text-slate-800">6.2%</strong> (Dry conditions)
          </span>
        </div>
        <div>
          <span>
            Sector Highlights:{' '}
            <strong className="font-semibold text-emerald-800">Bogawantalawa (+11.8%)</strong>
          </span>
        </div>
      </div>
    </div>
  );
};

