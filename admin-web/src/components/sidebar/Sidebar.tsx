import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  ClipboardList,
  Coins,
  Percent,
  FileText,
  BarChart3,
  ShieldCheck,
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
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeTab, setActiveTab } = useDashboard();
  const { user, logout } = useAuth();

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { id: 'farmers', label: 'Farmers', path: '/farmers', icon: Users },
    { id: 'collectors', label: 'Collectors', path: '/collectors', icon: UserCheck },
    { id: 'collections', label: 'Collections', path: '/collections', icon: ClipboardList },
    { id: 'tea-prices', label: 'Tea prices', path: '/tea-prices', icon: Coins },
    { id: 'deductions', label: 'Loans & deductions', path: '/deductions', icon: Percent },
    { id: 'settlements', label: 'Settlements', path: '/settlements', icon: FileText },
    { id: 'reports', label: 'Reports', path: '/reports', icon: BarChart3 },
    { id: 'audit-log', label: 'Audit log', path: '/audit-log', icon: ShieldCheck },
  ];

  const handleSelect = (item: NavItem) => {
    setActiveTab(item.id);
    if (
      item.path === '/dashboard' ||
      item.path === '/collectors' ||
      item.path === '/collections' ||
      item.path === '/tea-prices' ||
      item.path === '/deductions' ||
      item.path === '/settlements' ||
      item.path === '/reports' ||
      item.path === '/audit-log' ||
      item.path === '/farmers'
    ) {
      navigate(item.path);
    }
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const isCurrentActive = (item: NavItem) => {
    if (location.pathname === item.path) return true;
    return activeTab === item.id;
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-60 bg-teal-950 px-4 py-6 flex flex-col justify-start items-start gap-1 overflow-y-auto transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="self-stretch px-2 pb-5 flex justify-between items-center gap-2.5 overflow-hidden">
          <div className="flex items-center gap-2.5">
            <div className="size-9 bg-status-success-bg rounded-[10px] flex justify-center items-center overflow-hidden shrink-0 shadow-xs">
              <img
                className="size-6 object-contain"
                src={logoImg}
                alt="TeaLedger"
              />
            </div>
            <div className="flex flex-col justify-start items-start overflow-hidden">
              <div className="justify-start text-text-on-primary text-lg font-bold font-['Inter'] leading-tight">
                TeaLedger
              </div>
              <div className="justify-start text-emerald-200/70 text-xs font-normal font-['Inter']">
                Admin console
              </div>
            </div>
          </div>

          {/* Close button for mobile */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden text-white/70 hover:text-white p-1 rounded-lg"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="self-stretch flex flex-col gap-1">
          {navItems.map((item) => {
            const active = isCurrentActive(item);
            const IconComponent = item.icon;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item)}
                className={`self-stretch px-3 py-2.5 rounded-[10px] flex justify-start items-center gap-3 overflow-hidden cursor-pointer transition-colors text-left ${
                  active
                    ? 'bg-brand-primary text-text-on-primary font-semibold shadow-xs'
                    : 'text-emerald-100/70 hover:bg-teal-900/60 hover:text-white font-medium'
                }`}
              >
                <IconComponent className={`size-5 shrink-0 ${active ? 'text-white' : 'text-emerald-300/80'}`} />
                <span className="flex-1 justify-start text-sm font-['Inter']">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Spacer pushing bottom profile to bottom */}
        <div className="w-24 flex-1 min-h-[40px]" />

        {/* Bottom User Profile */}
        <div className="self-stretch px-3 py-3 flex items-center justify-between border-t border-teal-900/60 mt-auto">
          <div className="flex flex-col justify-start items-start gap-0.5 overflow-hidden">
            <div className="justify-start text-text-on-primary text-xs font-semibold font-['Inter'] truncate max-w-[130px]">
              {user?.name || 'Sunil Jayawardena'}
            </div>
            <div className="justify-start text-emerald-300/70 text-xs font-normal font-['Inter']">
              {user?.role || 'Administrator'}
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            title="Log out"
            className="p-1.5 rounded-lg text-emerald-300/60 hover:text-rose-300 hover:bg-teal-900/80 transition-colors cursor-pointer"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </aside>
    </>
  );
};
