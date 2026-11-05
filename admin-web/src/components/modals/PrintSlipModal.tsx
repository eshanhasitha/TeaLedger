import { X, Printer } from 'lucide-react';
import logoImg from '../../assets/logo.png';
import { useDashboard } from '../../context/DashboardContext';

export const PrintSlipModal = () => {
  const { selectedSlipForPrint, setSelectedSlipForPrint } = useDashboard();

  if (!selectedSlipForPrint) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl border border-[#ded8cc] bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-[#ece8e0] bg-[#faf8f4] px-5 py-3">
          <span className="text-xs font-bold text-slate-700">Intake Slip Print Preview</span>
          <button
            onClick={() => setSelectedSlipForPrint(null)}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Printable Receipt Body */}
        <div className="p-6 bg-white text-slate-900 font-mono text-xs space-y-4">
          <div className="text-center border-b border-dashed border-slate-300 pb-3">
            <div className="flex justify-center mb-1">
              <img src={logoImg} alt="TeaLedger" className="h-10 w-10 object-contain" />
            </div>
            <div className="text-sm font-bold tracking-wider font-sans text-slate-900">
              TEALEDGER ESTATE ADMIN
            </div>
            <div className="text-[10px] text-slate-500">
              Nuwara Eliya Central Highlands Hub • Station 04
            </div>
            <div className="text-[11px] font-bold text-slate-800 mt-1">
              ELECTRONIC WEIGHBRIDGE INTAKE SLIP
            </div>
          </div>

          <div className="space-y-1.5 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-500">SLIP NUMBER:</span>
              <span className="font-bold">{selectedSlipForPrint.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">DATE & TIME:</span>
              <span>2024-10-24 {selectedSlipForPrint.timestamp}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">GROWER NAME:</span>
              <span className="font-bold">{selectedSlipForPrint.farmerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">GROWER CODE:</span>
              <span>{selectedSlipForPrint.farmerCode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">ESTATE DIVISION:</span>
              <span>{selectedSlipForPrint.division}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">COLLECTOR:</span>
              <span>{selectedSlipForPrint.collectorId} ({selectedSlipForPrint.collectorName})</span>
            </div>
          </div>

          <div className="border-t border-b border-dashed border-slate-300 py-2.5 space-y-1.5 text-[11px]">
            <div className="flex justify-between">
              <span>GROSS WEIGHT:</span>
              <span className="font-bold">{selectedSlipForPrint.grossKg.toFixed(1)} KG</span>
            </div>
            <div className="flex justify-between text-rose-600">
              <span>WATER/TARE DEDUCTION:</span>
              <span>{selectedSlipForPrint.tareKg.toFixed(1)} KG</span>
            </div>
            <div className="flex justify-between text-xs font-bold pt-1 border-t border-slate-200">
              <span>NET PAYABLE WEIGHT:</span>
              <span className="text-slate-900">{selectedSlipForPrint.netKg.toFixed(1)} KG</span>
            </div>
            <div className="flex justify-between">
              <span>RATE PER KG:</span>
              <span>LKR {selectedSlipForPrint.ratePerKg.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex justify-between text-sm font-bold bg-[#f4f9f5] p-2.5 rounded-lg border border-emerald-200">
            <span>TOTAL VALUE:</span>
            <span className="text-[#183a27]">
              LKR {selectedSlipForPrint.totalPayable.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="text-center text-[10px] text-slate-400 pt-2">
            *** Certified Official Electronic Digital Scale Record ***
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2 bg-[#faf8f4] px-5 py-3 border-t border-[#ece8e0]">
          <button
            onClick={() => setSelectedSlipForPrint(null)}
            className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-xl bg-[#183a27] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#122e1e]"
          >
            <Printer className="h-4 w-4" />
            <span>Print Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
};
