import React from 'react';
import { CheckCircle2, AlertTriangle, Info, AlertOctagon, X } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useDashboard();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let borderClass = 'border-emerald-300 bg-[#f4f9f5] text-emerald-950';
        let icon = <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />;

        if (toast.type === 'warning') {
          borderClass = 'border-amber-300 bg-amber-50 text-amber-950';
          icon = <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />;
        } else if (toast.type === 'error') {
          borderClass = 'border-rose-300 bg-rose-50 text-rose-950';
          icon = <AlertOctagon className="h-5 w-5 text-rose-600 shrink-0" />;
        } else if (toast.type === 'info') {
          borderClass = 'border-blue-300 bg-blue-50 text-blue-950';
          icon = <Info className="h-5 w-5 text-blue-600 shrink-0" />;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-2xl border p-4 shadow-xl backdrop-blur-md animate-in slide-in-from-bottom-5 duration-200 ${borderClass}`}
          >
            {icon}
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold">{toast.title}</div>
              {toast.message && (
                <div className="mt-0.5 text-[11px] opacity-90 leading-relaxed">
                  {toast.message}
                </div>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded-md"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

