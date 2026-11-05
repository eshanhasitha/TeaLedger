import React from 'react';
import { FileText, ArrowUpRight, AlertCircle, Building2 } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';

export const OctoberFinancialStream: React.FC = () => {
  const { settlement, setIsAuditModalOpen, setIsSettlementModalOpen } = useDashboard();

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-[#ded8cc] bg-white p-5 shadow-xs transition-shadow hover:shadow-sm">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#1a2b20]">
              October Financial Stream
            </h2>
            <p className="mt-0.5 text-xs text-[#6e7d73]">
              Gross Value vs Deductions & Payouts
            </p>
          </div>
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
            LKR 58.2M Tot
          </span>
        </div>

        {/* Payout Distribution Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">
              Payout Distribution Model
            </span>
            <span className="text-[11px] text-slate-500">
              Target Disbursal: <strong>Oct 31</strong>
            </span>
          </div>

          <div className="mt-2 flex h-3 w-full overflow-hidden rounded-full bg-slate-100 p-0.5">
            <div
              className="rounded-l-full bg-[#183a27] transition-all duration-500"
              style={{ width: '79.5%' }}
              title="Net Payout: 79.5%"
            />
            <div
              className="bg-[#b45309] transition-all duration-500"
              style={{ width: '12.3%' }}
              title="Fertilizer Deductions: 12.3%"
            />
            <div
              className="rounded-r-full bg-[#e11d48] transition-all duration-500"
              style={{ width: '8.2%' }}
              title="Cash Loans: 8.2%"
            />
          </div>
        </div>

        {/* 3 Metric Columns */}
        <div className="mt-4 grid grid-cols-3 gap-2 border-b border-[#f0ece3] pb-4 text-center">
          <div className="rounded-xl bg-[#f7faf8] p-2.5 border border-emerald-100">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              NET PAYOUT
            </div>
            <div className="mt-1 text-xs sm:text-sm font-bold text-[#183a27]">
              LKR 46.28M
            </div>
            <div className="mt-0.5 text-[11px] font-semibold text-emerald-700">
              79.5%
            </div>
          </div>

          <div className="rounded-xl bg-[#fefcf8] p-2.5 border border-amber-100">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              FERTILIZER
            </div>
            <div className="mt-1 text-xs sm:text-sm font-bold text-[#92400e]">
              LKR 7.15M
            </div>
            <div className="mt-0.5 text-[11px] font-semibold text-amber-700">
              12.3%
            </div>
          </div>

          <div className="rounded-xl bg-[#fdfafb] p-2.5 border border-rose-100">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              CASH LOANS
            </div>
            <div className="mt-1 text-xs sm:text-sm font-bold text-[#be123c]">
              LKR 4.77M
            </div>
            <div className="mt-0.5 text-[11px] font-semibold text-rose-600">
              8.2%
            </div>
          </div>
        </div>

        {/* Financial Detail Points */}
        <div className="mt-3.5 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[#65756a]">Est. Factory Gross Margin:</span>
            <span className="font-semibold text-slate-900">
              {settlement.factoryGrossMarginPercentage}% (Export FOB Grade)
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-[#65756a]">
              <Building2 className="h-3.5 w-3.5 text-slate-400" />
              Bank Disbursal Pipeline:
            </span>
            <span className="font-semibold text-emerald-800">
              {settlement.bankPartner}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-[#65756a]">
              <AlertCircle className="h-3.5 w-3.5 text-rose-500" />
              Pending Weight Claims:
            </span>
            <span className="font-semibold text-rose-600">
              {settlement.unresolvedClaimsCount} unresolved (LKR{' '}
              {settlement.unresolvedClaimsAmount.toLocaleString()})
            </span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-5 flex gap-2">
        <button
          onClick={() => setIsAuditModalOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#ded8cc] bg-white py-2 text-xs font-semibold text-slate-700 hover:border-emerald-600 hover:bg-[#f6fbf8] hover:text-[#183a27] transition-all shadow-2xs"
        >
          <FileText className="h-3.5 w-3.5 text-emerald-700" />
          <span>Open Ledger Reconciliation Audit</span>
        </button>
        <button
          onClick={() => setIsSettlementModalOpen(true)}
          className="flex items-center justify-center rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors border border-emerald-200"
          title="Manage Settlement"
        >
          <ArrowUpRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

