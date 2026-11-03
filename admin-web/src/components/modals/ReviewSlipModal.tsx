import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';

export const ReviewSlipModal: React.FC = () => {
  const { selectedSlipForReview, setSelectedSlipForReview, reviewSlip } = useDashboard();
  const [tareKg, setTareKg] = useState<number>(0);
  const [rate, setRate] = useState<number>(250.0);

  useEffect(() => {
    if (selectedSlipForReview) {
      setTareKg(Math.abs(selectedSlipForReview.tareKg));
      setRate(selectedSlipForReview.ratePerKg);
    }
  }, [selectedSlipForReview]);

  if (!selectedSlipForReview) return null;

  const currentGross = selectedSlipForReview.grossKg;
  const netKg = Number(Math.max(0, currentGross - tareKg).toFixed(1));
  const totalPayable = Number((netKg * rate).toFixed(2));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    reviewSlip(selectedSlipForReview.id, tareKg, rate);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl border border-[#ded8cc] bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-[#ece8e0] bg-[#faf8f4] px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-white">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#18291e]">
                Review Flagged Weight Slip
              </h3>
              <p className="text-xs text-[#6e7d73]">
                {selectedSlipForReview.id} • {selectedSlipForReview.farmerName}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedSlipForReview(null)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/70"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div className="rounded-xl bg-amber-50 p-3 text-xs text-amber-900 border border-amber-200">
            <strong>Flag Reason:</strong> Moisture / excessive water tare flagged on Weighbridge (recorded 14.8% moisture index, exceeding 14% threshold).
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Gross Weight:</span>
              <span className="font-bold text-slate-800">{currentGross} kg</span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5f6f65] mb-1">
                Adjusted Tare / Water Deduction (kg)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={tareKg}
                onChange={(e) => setTareKg(parseFloat(e.target.value) || 0)}
                className="w-full rounded-xl border border-[#ded8cc] px-3.5 py-2 text-sm font-bold text-rose-600 focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between border-b border-slate-100 pb-2 pt-1">
              <span className="text-slate-500">Resulting Usable Net Weight:</span>
              <span className="font-extrabold text-slate-900 text-sm">{netKg} kg</span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-slate-500">Adjusted Total Payable:</span>
              <span className="font-extrabold text-emerald-800 text-base">
                LKR {totalPayable.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setSelectedSlipForReview(null)}
              className="rounded-xl border border-[#ded8cc] px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-xl bg-[#183a27] px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#122e1e] transition-colors"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Approve & Verify Slip</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

