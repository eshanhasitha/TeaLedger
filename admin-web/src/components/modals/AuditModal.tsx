import { X, CheckCircle2, ShieldCheck, Download } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';

export const AuditModal = () => {
  const { isAuditModalOpen, setIsAuditModalOpen, addToast } = useDashboard();

  if (!isAuditModalOpen) return null;

  const handleExportAudit = () => {
    addToast({
      type: 'success',
      title: 'Audit PDF Generated',
      message: 'October 2024 General Ledger Reconciliation Audit Pack downloaded.',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl border border-[#ded8cc] bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-[#ece8e0] bg-[#faf8f4] px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#183a27] text-white">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#18291e]">
                Ledger Reconciliation Audit
              </h3>
              <p className="text-xs text-[#6e7d73]">
                Factory Gate Intake vs. Smallholder Payable Audit Trail
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAuditModalOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/70"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          <div className="rounded-xl bg-emerald-50 p-3.5 border border-emerald-200 text-emerald-900">
            <div className="flex items-center gap-2 font-bold">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Double-Entry Balance Verification Passed</span>
            </div>
            <p className="mt-1 text-[11px] text-emerald-800 leading-relaxed">
              Total electronic scale net weight tallies with factory withering trough intake batch logs with 99.98% parity.
            </p>
          </div>

          <div className="space-y-2 border border-slate-200 rounded-xl p-3.5 bg-slate-50">
            <div className="flex justify-between">
              <span className="text-slate-500">Gross Green Leaf Received:</span>
              <span className="font-bold text-slate-800">232,800.0 kg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Total Moisture / Bag Tare:</span>
              <span className="font-bold text-rose-600">-14,433.6 kg (6.2%)</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-1.5 font-bold">
              <span className="text-slate-700">Net Usable Factory Leaf:</span>
              <span className="text-emerald-800">218,366.4 kg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Calculated Payout Obligation:</span>
              <span className="font-bold text-slate-900">LKR 46,280,000.00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Pre-authorized Fertilizer Recovery:</span>
              <span className="font-bold text-slate-900">LKR 7,150,000.00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Cash Loan Advance Recovery:</span>
              <span className="font-bold text-slate-900">LKR 4,770,000.00</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              onClick={() => setIsAuditModalOpen(false)}
              className="rounded-xl border border-[#ded8cc] px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Close
            </button>
            <button
              onClick={handleExportAudit}
              className="flex items-center gap-1.5 rounded-xl bg-[#183a27] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#122e1e]"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export Audit Dossier</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
