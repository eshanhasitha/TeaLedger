import { useState } from 'react';
import { X, Scale, Check } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';

export const RecordCollectionModal = () => {
  const { isRecordModalOpen, setIsRecordModalOpen, addSlip, farmers } = useDashboard();

  const [selectedFarmerId, setSelectedFarmerId] = useState(farmers[0]?.id || '');
  const [collectorName, setCollectorName] = useState('Dilshan Perera');
  const [collectorId, setCollectorId] = useState('C-08');
  const [grossKg, setGrossKg] = useState<number>(120);
  const [tareKg, setTareKg] = useState<number>(6.5);
  const [ratePerKg, setRatePerKg] = useState<number>(250.0);
  const [weighbridgeId, setWeighbridgeId] = useState<'WB-01' | 'WB-02' | 'WB-03'>('WB-01');

  if (!isRecordModalOpen) return null;

  const currentFarmer = farmers.find((f) => f.id === selectedFarmerId) || farmers[0];

  const netKg = Number(Math.max(0, grossKg - tareKg).toFixed(1));
  const totalPayable = Number((netKg * ratePerKg).toFixed(2));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentFarmer || grossKg <= 0) return;

    addSlip({
      farmerName: currentFarmer.name,
      farmerCode: currentFarmer.code,
      division: currentFarmer.division,
      collectorId,
      collectorName,
      grossKg,
      tareKg: -Math.abs(tareKg),
      netKg,
      ratePerKg,
      totalPayable,
      status: tareKg > 20 ? 'Flagged Wt' : 'Verified',
      weighbridgeId,
      moisturePercentage: 11.2,
    });

    setIsRecordModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl border border-[#ded8cc] bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#ece8e0] bg-[#faf8f4] px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#183a27] text-white">
              <Scale className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#18291e]">
                Record Tea Leaf Intake Slip
              </h3>
              <p className="text-xs text-[#6e7d73]">
                Electronic Weighbridge scale capture & ledger entry
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsRecordModalOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/70"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Select Farmer */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#5f6f65] mb-1.5">
              Select Registered Grower
            </label>
            <select
              value={selectedFarmerId}
              onChange={(e) => setSelectedFarmerId(e.target.value)}
              className="w-full rounded-xl border border-[#ded8cc] bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              {farmers.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.code}) — {f.division}
                </option>
              ))}
            </select>
          </div>

          {/* Collector & Weighbridge Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5f6f65] mb-1.5">
                Field Collector
              </label>
              <select
                value={`${collectorId}|${collectorName}`}
                onChange={(e) => {
                  const [id, name] = e.target.value.split('|');
                  setCollectorId(id);
                  setCollectorName(name);
                }}
                className="w-full rounded-xl border border-[#ded8cc] bg-white px-3 py-2 text-xs sm:text-sm font-medium text-slate-900 focus:border-emerald-600 focus:outline-none"
              >
                <option value="C-08|Dilshan Perera">C-08 • Dilshan Perera</option>
                <option value="C-04|Priyantha Kumara">C-04 • Priyantha Kumara</option>
                <option value="C-11|Kasun Wickrama">C-11 • Kasun Wickrama</option>
                <option value="C-02|Nalin Kumara">C-02 • Nalin Kumara</option>
                <option value="C-15|Roshan Dias">C-15 • Roshan Dias</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5f6f65] mb-1.5">
                Weighbridge
              </label>
              <select
                value={weighbridgeId}
                onChange={(e) => setWeighbridgeId(e.target.value as any)}
                className="w-full rounded-xl border border-[#ded8cc] bg-white px-3 py-2 text-xs sm:text-sm font-medium text-slate-900 focus:border-emerald-600 focus:outline-none"
              >
                <option value="WB-01">Weighbridge 01 (Intake Main)</option>
                <option value="WB-02">Weighbridge 02 (Secondary)</option>
                <option value="WB-03">Weighbridge 03 (Express)</option>
              </select>
            </div>
          </div>

          {/* Weights & Calculation */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5f6f65] mb-1.5">
                Gross Wt (kg)
              </label>
              <input
                type="number"
                step="0.5"
                min="1"
                required
                value={grossKg}
                onChange={(e) => setGrossKg(parseFloat(e.target.value) || 0)}
                className="w-full rounded-xl border border-[#ded8cc] px-3 py-2 text-xs sm:text-sm font-bold text-slate-900 focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5f6f65] mb-1.5">
                Tare/Ded (kg)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                required
                value={tareKg}
                onChange={(e) => setTareKg(parseFloat(e.target.value) || 0)}
                className="w-full rounded-xl border border-[#ded8cc] px-3 py-2 text-xs sm:text-sm font-bold text-rose-600 focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5f6f65] mb-1.5">
                Rate (LKR/kg)
              </label>
              <input
                type="number"
                step="1"
                required
                value={ratePerKg}
                onChange={(e) => setRatePerKg(parseFloat(e.target.value) || 0)}
                className="w-full rounded-xl border border-[#ded8cc] px-3 py-2 text-xs sm:text-sm font-bold text-slate-900 focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Computed Summary Card */}
          <div className="rounded-xl border border-emerald-200 bg-[#f4f9f5] p-3.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#596d61] font-medium">Computed Usable Net Weight:</span>
              <span className="text-base font-extrabold text-[#14291c]">{netKg} kg</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-xs border-t border-emerald-200/60 pt-1.5">
              <span className="text-[#596d61] font-medium">Total Grower Payout:</span>
              <span className="text-base font-extrabold text-emerald-800">
                LKR {totalPayable.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsRecordModalOpen(false)}
              className="rounded-xl border border-[#ded8cc] px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-xl bg-[#183a27] px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#122e1e] transition-colors"
            >
              <Check className="h-4 w-4" />
              <span>Confirm & Print Slip</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
