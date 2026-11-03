import { X, Calculator, CheckCircle2 } from 'lucide-react';
import { useDashboard } from '../../hooks/useDashboard';

export const MonthlySettlementModal = () => {
  const { isSettlementModalOpen, setIsSettlementModalOpen, settlement, addToast } = useDashboard();

  if (!isSettlementModalOpen) return null;

  const handleExecute = () => {
    addToast({
      type: 'success',
      title: 'Disbursal Pipeline Transmitted',
      message: 'Batch payment file dispatched to Commercial Bank & BOC API gateway.',
    });
    setIsSettlementModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-xl rounded-2xl border border-[#ded8cc] bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-[#ece8e0] bg-[#faf8f4] px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#183a27] text-white">
              <Calculator className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#18291e]">
                October 2024 Monthly Settlement Overview
              </h3>
              <p className="text-xs text-[#6e7d73]">
                Estate Smallholder Green Leaf Net Disbursal Reconciliation
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsSettlementModalOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/70"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-[#f5f9f6] p-4 border border-emerald-100">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Gross Leaf Intake Value
              </div>
              <div className="mt-1 text-xl font-extrabold text-[#183a27]">
                LKR {settlement.totalGrossValue.toLocaleString()}
              </div>
              <div className="mt-0.5 text-xs text-emerald-700 font-semibold">
                Baseline rate: 250.00 /kg
              </div>
            </div>

            <div className="rounded-xl bg-[#0e3822] p-4 text-white">
              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-200">
                Net Farmer Disbursal
              </div>
              <div className="mt-1 text-xl font-extrabold text-white">
                LKR {settlement.netFarmerPayout.toLocaleString()}
              </div>
              <div className="mt-0.5 text-xs text-emerald-200/80 font-medium">
                Target: Oct 31, 2024
              </div>
            </div>
          </div>

          {/* Breakdown Rows */}
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-medium">Fertilizer Subsidized Deductions:</span>
              <span className="font-bold text-amber-800">
                - LKR {settlement.fertilizerDeduction.toLocaleString()} (12.3%)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-medium">Cash Advance & Micro-Loan Repayments:</span>
              <span className="font-bold text-rose-700">
                - LKR {settlement.cashLoansDeduction.toLocaleString()} (8.2%)
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-200 pt-2">
              <span className="text-slate-600 font-medium">Estimated Factory Gross Margin:</span>
              <span className="font-bold text-emerald-800">
                {settlement.factoryGrossMarginPercentage}% (Export FOB Grade)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-medium">Banking Transmission Pipeline:</span>
              <span className="font-bold text-slate-900">{settlement.bankPartner}</span>
            </div>
          </div>

          <div className="rounded-xl bg-amber-50 p-3 border border-amber-200/80 flex items-start gap-2 text-xs">
            <div className="text-amber-800">
              <span className="font-bold">Pending Review:</span> {settlement.unresolvedClaimsCount} weighbridge weight discrepancy claims (LKR {settlement.unresolvedClaimsAmount.toLocaleString()}) flagged for chief admin review.
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              onClick={() => setIsSettlementModalOpen(false)}
              className="rounded-xl border border-[#ded8cc] px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Close
            </button>
            <button
              onClick={handleExecute}
              className="flex items-center gap-1.5 rounded-xl bg-[#183a27] px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#122e1e] transition-colors"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Authorize October Settlement</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
