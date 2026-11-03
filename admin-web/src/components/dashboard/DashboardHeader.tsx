import {
  Calendar,
  MapPin,
  Send,
  UserPlus,
  Calculator,
  Scale,
} from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { useAuth } from '../../context/AuthContext';

export const DashboardHeader = () => {
  const {
    setIsRecordModalOpen,
    setIsAddFarmerModalOpen,
    setIsSettlementModalOpen,
    setIsNotificationModalOpen,
  } = useDashboard();
  const { user } = useAuth();

  const firstName = user?.name ? user.name.split(' ')[0] : 'Sunil';

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      {/* Left: Breadcrumbs, Title, Station status & metadata */}
      <div>
        <nav className="flex items-center gap-1.5 text-xs font-medium text-[#77867c]">
          <span>Home</span>
          <span>&gt;</span>
          <span>Operations</span>
          <span>&gt;</span>
          <span className="font-semibold text-slate-800">Overview</span>
        </nav>

        <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#14261b]">
          Good morning, {firstName}.
        </h1>

        <div className="mt-2 flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs text-[#5f6f65]">
          {/* Station Status Badge */}
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/90 px-3 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200/60">
            <span className="h-2 w-2 rounded-full bg-emerald-600"></span>
            <span>Factory Intake Station 04 Active</span>
          </div>

          {/* Date */}
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span>Thursday, October 24, 2024</span>
          </div>

          <span className="hidden sm:inline text-slate-300">•</span>

          {/* Location */}
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-slate-400" />
            <span>Nuwara Eliya - Central Highlands Hub</span>
          </div>
        </div>
      </div>

      {/* Right: Quick Action Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setIsNotificationModalOpen(true)}
          className="flex items-center gap-1.5 rounded-xl border border-[#ded8cc] bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:border-emerald-600 hover:bg-[#faf8f4] hover:text-[#183a27] transition-all"
        >
          <Send className="h-3.5 w-3.5 text-slate-500" />
          <span>Send Notification</span>
        </button>

        <button
          onClick={() => setIsAddFarmerModalOpen(true)}
          className="flex items-center gap-1.5 rounded-xl border border-[#ded8cc] bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:border-emerald-600 hover:bg-[#faf8f4] hover:text-[#183a27] transition-all"
        >
          <UserPlus className="h-3.5 w-3.5 text-slate-500" />
          <span>+ Add Farmer</span>
        </button>

        <button
          onClick={() => setIsSettlementModalOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-[#183a27] px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#122e1e] transition-colors"
        >
          <Calculator className="h-3.5 w-3.5 text-emerald-300" />
          <span>+ Monthly Settlement</span>
        </button>

        <button
          onClick={() => setIsRecordModalOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-[#183a27] px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#122e1e] transition-colors"
        >
          <Scale className="h-3.5 w-3.5 text-emerald-300" />
          <span>+ Record Collection</span>
        </button>
      </div>
    </div>
  );
};
