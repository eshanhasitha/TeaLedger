import React, { useState } from 'react';
import { X, Send, Check } from 'lucide-react';
import { useDashboard } from '../../hooks/useDashboard';

export const SendNotificationModal: React.FC = () => {
  const { isNotificationModalOpen, setIsNotificationModalOpen, addToast } = useDashboard();

  const [audience, setAudience] = useState('All Registered Farmers');
  const [title, setTitle] = useState('Sri Lanka Tea Board Minimum Base Price Notice');
  const [body, setBody] = useState(
    'Attention Growers: Minimum green leaf base rate will be adjusted to LKR 255.00/kg starting Nov 01. Please ensure leaf moisture remains under 14%.'
  );

  if (!isNotificationModalOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    addToast({
      type: 'success',
      title: 'SMS & Mobile Broadcast Sent',
      message: `Broadcast delivered to ${audience} (1,428 recipients).`,
    });
    setIsNotificationModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl border border-[#ded8cc] bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-[#ece8e0] bg-[#faf8f4] px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#183a27] text-white">
              <Send className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#18291e]">
                Send Notification / Alert
              </h3>
              <p className="text-xs text-[#6e7d73]">
                Direct SMS and mobile app push to estate network
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsNotificationModalOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/70"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSend} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#5f6f65] mb-1.5">
              Target Audience
            </label>
            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="w-full rounded-xl border border-[#ded8cc] bg-white px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-800 focus:border-emerald-600 focus:outline-none"
            >
              <option value="All Registered Farmers">All Registered Farmers (1,428 Growers)</option>
              <option value="All Field Collectors">All Field Collectors (26 Collectors)</option>
              <option value="Nuwara Eliya & Talawakelle Sectors">Nuwara Eliya & Talawakelle Sectors</option>
              <option value="Bogawantalawa & Maskeliya Sectors">Bogawantalawa & Maskeliya Sectors</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#5f6f65] mb-1.5">
              Notification Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-[#ded8cc] px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-900 focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#5f6f65] mb-1.5">
              Message Content (SMS & Mobile App Push)
            </label>
            <textarea
              rows={4}
              required
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full rounded-xl border border-[#ded8cc] p-3 text-xs sm:text-sm text-slate-800 focus:border-emerald-600 focus:outline-none leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsNotificationModalOpen(false)}
              className="rounded-xl border border-[#ded8cc] px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-xl bg-[#183a27] px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#122e1e] transition-colors"
            >
              <Check className="h-4 w-4" />
              <span>Broadcast Now</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

