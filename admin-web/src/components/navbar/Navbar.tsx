import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  Plus,
  Menu,
  CheckCircle2,
  AlertTriangle,
  Scale,
  UserPlus,
  Send,
  X,
} from 'lucide-react';
import { useDashboard } from '../../hooks/useDashboard';
import { useAuth } from '../../hooks/useAuth';

interface NavbarProps {
  onOpenMobileMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenMobileMenu }) => {
  const {
    searchQuery,
    setSearchQuery,
    setIsRecordModalOpen,
    setIsAddFarmerModalOpen,
    setIsNotificationModalOpen,
    triggerScaleSync,
  } = useDashboard();
  const { user } = useAuth();

  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isNewEntryMenuOpen, setIsNewEntryMenuOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const newEntryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setIsNotificationOpen(false);
      }
      if (
        newEntryRef.current &&
        !newEntryRef.current.contains(event.target as Node)
      ) {
        setIsNewEntryMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#ece8e0] bg-[#faf8f4]/95 px-4 backdrop-blur-md sm:px-6">
      {/* Left: Mobile Menu Toggle & Search Bar */}
      <div className="flex flex-1 items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="rounded-lg p-2 text-[#4b5950] hover:bg-[#eae5da] lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7f8e83]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search farmer code, collector, weight slip, or settlement..."
            className="w-full rounded-full border border-[#ded8cc] bg-white py-2 pl-10 pr-9 text-xs sm:text-sm text-[#1e2a22] placeholder-[#8f9d92] transition-colors focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Right: Intake Status Pill, Notifications, New Entry, Avatar */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Factory Status Pill */}
        <div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/90 px-3.5 py-1.5 text-xs font-semibold text-emerald-800 md:flex">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600"></span>
          </span>
          <span>Factory: Active Intake | Daily Target: 82%</span>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="relative rounded-full border border-[#ded8cc] bg-white p-2 text-[#46544a] hover:bg-[#f3efe6] hover:text-[#183a27] transition-colors"
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-xs">
              1
            </span>
          </button>

          {isNotificationOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-[#e2dcd2] bg-white p-3 shadow-xl z-50">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Estate Alerts
                </span>
                <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                  1 Urgent
                </span>
              </div>
              <div className="mt-2 space-y-2">
                <div className="rounded-lg bg-amber-50 p-2.5 border border-amber-200/70 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                    <span>Sri Lanka Tea Board Notice CR-2024-11</span>
                  </div>
                  <p className="mt-1 text-[11px] text-amber-800 leading-relaxed">
                    Green leaf base price revised upward to LKR 255.00/kg effective Nov 01. Adjust baseline calculators.
                  </p>
                </div>

                <div className="rounded-lg bg-emerald-50 p-2.5 border border-emerald-200/70 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>Weighbridge Calibrated</span>
                  </div>
                  <p className="mt-1 text-[11px] text-emerald-800 leading-relaxed">
                    Station 04 electronic scale tolerance is optimal (&plusmn;0.02 kg).
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* New Entry Button & Dropdown */}
        <div className="relative" ref={newEntryRef}>
          <button
            onClick={() => setIsNewEntryMenuOpen(!isNewEntryMenuOpen)}
            className="flex items-center gap-1.5 rounded-full bg-[#183a27] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#122e1e] transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>+ New Entry</span>
          </button>

          {isNewEntryMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-[#ded8cc] bg-white p-1.5 shadow-xl z-50">
              <button
                onClick={() => {
                  setIsNewEntryMenuOpen(false);
                  setIsRecordModalOpen(true);
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-900"
              >
                <Scale className="h-4 w-4 text-emerald-700" />
                <span>Record Collection Slip</span>
              </button>
              <button
                onClick={() => {
                  setIsNewEntryMenuOpen(false);
                  setIsAddFarmerModalOpen(true);
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-900"
              >
                <UserPlus className="h-4 w-4 text-emerald-700" />
                <span>Register New Farmer</span>
              </button>
              <button
                onClick={() => {
                  setIsNewEntryMenuOpen(false);
                  setIsNotificationModalOpen(true);
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-900"
              >
                <Send className="h-4 w-4 text-emerald-700" />
                <span>Send Farmer SMS Notice</span>
              </button>
              <button
                onClick={() => {
                  setIsNewEntryMenuOpen(false);
                  triggerScaleSync();
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 border-t border-slate-100"
              >
                <Scale className="h-4 w-4 text-slate-500" />
                <span>Sync Weighbridge Scale</span>
              </button>
            </div>
          )}
        </div>

        {/* User Profile Avatar */}
        <div className="flex items-center">
          <img
            src={user?.avatarUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=120&h=120&q=80"}
            alt={user?.name || "Admin"}
            className="h-8 w-8 rounded-full object-cover ring-2 ring-emerald-600/20"
            title={`${user?.name || 'Sunil Jayawardena'} (${user?.role || 'Chief Admin'})`}
          />
        </div>
      </div>
    </header>
  );
};

