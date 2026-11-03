import React from 'react';
import {
  Users,
  UserCheck,
  ClipboardList,
  Scale,
  Eye,
  Clock,
  Calculator,
  Landmark,
  ArrowUp,
  AlertCircle,
} from 'lucide-react';
import { useDashboard } from '../../hooks/useDashboard';

export const MetricCardsGrid: React.FC = () => {
  const { slips, farmers, setIsSettlementModalOpen, setActiveTab } = useDashboard();

  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
      {/* 1. Total Registered Farmers */}
      <div 
        onClick={() => setActiveTab('farmers')}
        className="group cursor-pointer rounded-2xl border border-[#ded8cc] bg-white p-4 shadow-2xs transition-all hover:border-emerald-400 hover:shadow-xs"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#69796e]">
            TOTAL REGISTERED FARMERS
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#f0f6f2] text-emerald-800">
            <Users className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-2xl font-extrabold tracking-tight text-[#16271c]">
            {farmers.length > 5 ? farmers.length.toLocaleString() : '1,428'}
          </span>
          <span className="text-xs font-semibold text-slate-500">growers</span>
        </div>
        <div className="mt-2.5 flex items-center justify-between text-xs border-t border-slate-100 pt-2">
          <span className="flex items-center gap-0.5 font-semibold text-emerald-700">
            <ArrowUp className="h-3 w-3" />
            +38 this month
          </span>
          <span className="text-slate-500 font-medium">98.2% active</span>
        </div>
      </div>

      {/* 2. Field Collectors */}
      <div 
        onClick={() => setActiveTab('collectors')}
        className="group cursor-pointer rounded-2xl border border-[#ded8cc] bg-white p-4 shadow-2xs transition-all hover:border-emerald-400 hover:shadow-xs"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#69796e]">
            FIELD COLLECTORS
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#f0f6f2] text-emerald-800">
            <UserCheck className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-2xl font-extrabold tracking-tight text-[#16271c]">
            24 / 26
          </span>
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
            92% Deployed
          </span>
        </div>
        <div className="mt-2.5 text-xs text-slate-500 border-t border-slate-100 pt-2">
          2 on scheduled factory leave
        </div>
      </div>

      {/* 3. Today's Collections */}
      <div 
        onClick={() => setActiveTab('collections')}
        className="group cursor-pointer rounded-2xl border border-[#ded8cc] bg-white p-4 shadow-2xs transition-all hover:border-emerald-400 hover:shadow-xs"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#69796e]">
            TODAY'S COLLECTIONS
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#f0f6f2] text-emerald-800">
            <ClipboardList className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-2xl font-extrabold tracking-tight text-[#16271c]">
            {184 + (slips.length - 6)}
          </span>
          <span className="text-xs font-semibold text-slate-500">
            / 210 slips target
          </span>
        </div>
        <div className="mt-2.5 flex items-center justify-between text-xs border-t border-slate-100 pt-2">
          <span className="text-slate-600">Intake progress</span>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full bg-emerald-600" style={{ width: '87.6%' }} />
            </div>
            <span className="font-bold text-slate-800">87.6%</span>
          </div>
        </div>
      </div>

      {/* 4. Gross Intake Weight */}
      <div className="rounded-2xl border border-[#ded8cc] bg-white p-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#69796e]">
            GROSS INTAKE WEIGHT
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#f0f6f2] text-emerald-800">
            <Scale className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-2xl font-extrabold tracking-tight text-[#16271c]">
            14,850.5
          </span>
          <span className="text-xs font-semibold text-slate-500">kg</span>
        </div>
        <div className="mt-2.5 flex items-center justify-between text-xs border-t border-slate-100 pt-2">
          <span className="flex items-center gap-0.5 font-semibold text-emerald-700">
            <ArrowUp className="h-3 w-3" />
            +6.4%
          </span>
          <span className="text-slate-600 font-medium">Net: 13,920 kg</span>
        </div>
      </div>

      {/* 5. Est. Intake Value */}
      <div className="rounded-2xl border border-[#ded8cc] bg-white p-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#69796e]">
            EST. INTAKE VALUE
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#f0f6f2] text-emerald-800">
            <Eye className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2">
          <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#16271c]">
            LKR 3,480,000
          </span>
        </div>
        <div className="mt-2.5 text-xs text-slate-500 border-t border-slate-100 pt-2">
          Base rate: <strong className="text-slate-800">250.00 /kg</strong>
        </div>
      </div>

      {/* 6. Pending Intakes */}
      <div 
        onClick={() => setActiveTab('collection-requests')}
        className="group cursor-pointer rounded-2xl border border-[#ded8cc] bg-white p-4 shadow-2xs transition-all hover:border-amber-400 hover:shadow-xs"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#69796e]">
            PENDING INTAKES
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#fff7ed] text-amber-700">
            <Clock className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-2xl font-extrabold tracking-tight text-amber-900">
            14
          </span>
          <span className="text-xs font-semibold text-slate-500">shed requests</span>
        </div>
        <div className="mt-2.5 flex items-center gap-1 text-xs font-semibold text-amber-700 border-t border-slate-100 pt-2">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">! Haputale & Hatton Sectors</span>
        </div>
      </div>

      {/* 7. Outstanding Deductions */}
      <div 
        onClick={() => setActiveTab('deductions')}
        className="group cursor-pointer rounded-2xl border border-[#ded8cc] bg-white p-4 shadow-2xs transition-all hover:border-emerald-400 hover:shadow-xs"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#69796e]">
            OUTSTANDING DEDUCTIONS
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#f0f6f2] text-emerald-800">
            <Calculator className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2">
          <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#16271c]">
            LKR 18.45M
          </span>
        </div>
        <div className="mt-2.5 flex items-center justify-between text-xs border-t border-slate-100 pt-2">
          <span className="text-slate-500">Fertilizer & Cash</span>
          <span className="font-semibold text-emerald-700">84.1% recov.</span>
        </div>
      </div>

      {/* 8. Settlement Due (OCT) - Highlighted Dark Card */}
      <div
        onClick={() => setIsSettlementModalOpen(true)}
        className="group relative cursor-pointer overflow-hidden rounded-2xl bg-[#0f3822] p-4 text-white shadow-md transition-all hover:bg-[#0c2f1d] hover:shadow-lg"
      >
        {/* Glow decoration */}
        <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-emerald-500/20 blur-xl" />

        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-200">
            SETTLEMENT DUE (OCT)
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/15 text-emerald-100 backdrop-blur-xs">
            <Landmark className="h-4 w-4" />
          </div>
        </div>

        <div className="mt-2">
          <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
            LKR 46.28M
          </span>
        </div>

        <div className="mt-2.5 flex items-center justify-between text-xs border-t border-white/15 pt-2">
          <span className="text-emerald-100/90 font-medium">Net farmer payout</span>
          <span className="rounded-full bg-emerald-500/25 px-2 py-0.5 text-[10px] font-bold text-emerald-200 border border-emerald-400/30">
            6 days left
          </span>
        </div>
      </div>
    </div>
  );
};

