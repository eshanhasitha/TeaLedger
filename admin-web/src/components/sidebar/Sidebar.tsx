import React from 'react';
import {
  LayoutDashboard,
  ClipboardList,
  Leaf,
  Scale,
  Users,
  UserCheck,
  ShieldCheck,
  Coins,
  TrendingUp,
  BookOpen,
  Landmark,
  Layers,
  Percent,
  FileText,
  DollarSign,
  LogOut,
  X,
} from 'lucide-react';
import logoImg from '../../assets/logo.png';
import { useDashboard } from '../../hooks/useDashboard';
import { useAuth } from '../../hooks/useAuth';

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: 'green' | 'orange' | 'red';
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const { activeTab, setActiveTab } = useDashboard();
  const { user, logout } = useAuth();

  const navSections: NavSection[] = [
    {
      title: 'MAIN',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      ],
    },
    {
      title: 'OPERATIONS',
      items: [
        { id: 'collection-requests', label: 'Collection Requests', icon: ClipboardList, badge: '14', badgeColor: 'green' },
        { id: 'collections', label: 'Collections', icon: Leaf },
        { id: 'weight-verification', label: 'Weight Verification', icon: Scale, badge: '6', badgeColor: 'orange' },
      ],
    },
    {
      title: 'PEOPLE',
      items: [
        { id: 'farmers', label: 'Farmers', icon: Users },
        { id: 'collectors', label: 'Collectors', icon: UserCheck },
        { id: 'users', label: 'Users', icon: ShieldCheck },
      ],
    },
    {
      title: 'FINANCE',
      items: [
        { id: 'tea-prices', label: 'Tea Prices', icon: Coins },
        { id: 'earnings', label: 'Earnings', icon: TrendingUp },
        { id: 'passbooks', label: 'Passbooks', icon: BookOpen },
        { id: 'loans', label: 'Loans', icon: Landmark },
        { id: 'materials', label: 'Materials', icon: Layers },
        { id: 'deductions', label: 'Deductions', icon: Percent },
        { id: 'settlements', label: 'Settlements', icon: FileText, badge: 'Action', badgeColor: 'red' },
        { id: 'payments', label: 'Payments', icon: DollarSign },
      ],
    },
  ];

  const handleSelectTab = (id: string) => {
    setActiveTab(id);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col border-r border-[#e8e5de] bg-[#fbf9f5] transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-18 items-center justify-between border-b border-[#ece8e0] px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white p-1 shadow-xs border border-emerald-100">
              <img
                src={logoImg}
                alt="TeaLedger Logo"
                className="h-8 w-8 object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-[#162a1e]">
                TeaLedger
              </span>
              <span className="text-[10px] font-semibold tracking-wider text-[#758479]">
                ESTATE ADMIN V2.
              </span>
            </div>
          </div>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/60 lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <div className="px-3 pb-1 text-[11px] font-bold tracking-wider text-[#8b988f]">
                {section.title}
              </div>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = activeTab === item.id;
                  const Icon = item.icon;

                  let badgeBg = 'bg-emerald-100 text-emerald-800';
                  if (item.badgeColor === 'orange') {
                    badgeBg = 'bg-orange-100 text-orange-800';
                  } else if (item.badgeColor === 'red') {
                    badgeBg = 'bg-rose-100 text-rose-700 font-bold';
                  }

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectTab(item.id)}
                      className={`group flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-[#183a27] text-white shadow-xs'
                          : 'text-[#425247] hover:bg-[#ede9df]/70 hover:text-[#183a27]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`h-4 w-4 shrink-0 transition-colors ${
                            isActive ? 'text-emerald-300' : 'text-[#6e7d73] group-hover:text-[#183a27]'
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>

                      {item.badge && (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold leading-none ${
                            isActive
                              ? 'bg-emerald-500/30 text-emerald-200'
                              : badgeBg
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Profile Card */}
        <div className="border-t border-[#ece8e0] p-3.5 bg-[#f5f1e8]/60">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={user?.avatarUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=120&h=120&q=80"}
                alt={user?.name || "Sunil Jayawardena"}
                className="h-10 w-10 rounded-full object-cover border-2 border-emerald-700/20"
              />
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500"></span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="truncate text-xs font-bold text-[#1a2b20]">
                {user?.name || "Sunil Jayawardena"}
              </div>
              <div className="truncate text-[11px] text-[#637268]">
                {user?.role || "Chief Estate Admin"}
              </div>
              <div className="truncate text-[10px] text-[#86948a] font-medium">
                {user?.division || "Nuwara Eliya Central"}
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              if (window.confirm('Do you want to log out of TeaLedger Admin?')) {
                logout();
              }
            }}
            className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-md border border-[#e4ded3] bg-white py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

