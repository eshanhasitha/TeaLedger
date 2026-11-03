import { X, CheckCircle2, ShieldCheck, Activity, Scale, Server } from 'lucide-react';

interface SystemStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SystemStatusModal = ({ isOpen, onClose }: SystemStatusModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl border border-[#ded8cc] bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#ece8e0] bg-[#faf8f4] px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#183a27] text-emerald-200">
              <Activity className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#18291e]">
                TeaLedger Operational Status
              </h3>
              <p className="text-xs text-[#6e7d73]">
                Highland Estate Cloud & Hardware Telemetry
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/70"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          {/* Status banner */}
          <div className="rounded-xl bg-emerald-50 p-3.5 border border-emerald-200 text-emerald-950 flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>All Factory Systems Fully Operational</span>
            </div>
            <span className="rounded-full bg-emerald-200/70 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
              99.98% Uptime
            </span>
          </div>

          {/* Service items */}
          <div className="space-y-2 border border-slate-200 rounded-xl p-3.5 bg-slate-50">
            <div className="flex items-center justify-between py-1 border-b border-slate-200">
              <span className="flex items-center gap-2 text-slate-700 font-medium">
                <Scale className="h-3.5 w-3.5 text-emerald-700" />
                Weighbridge Digital Scale Telemetry (WB-01, 02, 03)
              </span>
              <span className="font-bold text-emerald-800">Operational (&plusmn;0.02kg)</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-200">
              <span className="flex items-center gap-2 text-slate-700 font-medium">
                <Server className="h-3.5 w-3.5 text-emerald-700" />
                Double-Entry Settlement & Ledger Engine
              </span>
              <span className="font-bold text-emerald-800">Online & Reconciled</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-200">
              <span className="flex items-center gap-2 text-slate-700 font-medium">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
                JWT Auth & Role-Based Access Control
              </span>
              <span className="font-bold text-emerald-800">Enforced</span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="flex items-center gap-2 text-slate-700 font-medium">
                <Activity className="h-3.5 w-3.5 text-emerald-700" />
                Central Highlands Basin GPS Fleet Trackers
              </span>
              <span className="font-bold text-emerald-800">24 Nodes Active</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed">
            Estate nodes automatically buffer collection slips during highland weather connectivity disruptions and sync when cellular reception is re-established.
          </p>

          <div className="flex items-center justify-end pt-2 border-t border-slate-100">
            <button
              onClick={onClose}
              className="rounded-xl bg-[#183a27] px-4 py-2 text-xs font-bold text-white hover:bg-[#122e1e]"
            >
              Close Status
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

