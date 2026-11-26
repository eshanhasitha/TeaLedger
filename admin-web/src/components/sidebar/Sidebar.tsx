import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  Users,
  UserCheck,
  ClipboardList,
  Tag,
  BookOpen,
  Wallet,
  BarChart3,
  Shield,
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
    { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: Home },
    { id: 'farmers', label: 'Farmers', path: '/farmers', icon: Users },
    { id: 'collectors', label: 'Collectors', path: '/collectors', icon: UserCheck },
    { id: 'collections', label: 'Collections', path: '/collections', icon: ClipboardList },
    { id: 'tea-prices', label: 'Tea prices', path: '/tea-prices', icon: Tag },
    { id: 'deductions', label: 'Loans & deductions', path: '/deductions', icon: BookOpen },
    { id: 'settlements', label: 'Settlements', path: '/settlements', icon: Wallet },
    { id: 'reports', label: 'Reports', path: '/reports', icon: BarChart3 },
    { id: 'audit-log', label: 'Audit log', path: '/audit-log', icon: Shield },
  ];

  const handleSelect = (item: NavItem) => {
    setActiveTab(item.id);
    navigate(item.path);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const isCurrentActive = (item: NavItem) => {
    if (location.pathname === item.path || location.pathname.startsWith(`${item.path}/`)) {
      return true;
    }
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

      {/* Sidebar Panel - Fixed 240px (#073B26) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-60 shrink-0 bg-[#073B26] px-4 py-6 flex flex-col justify-start items-start gap-1 overflow-y-auto transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="self-stretch px-2 pb-5 flex justify-between items-center gap-2.5 overflow-hidden">
          <div className="flex items-center gap-2.5">
            <div className="size-9 bg-[#E1F4E8] rounded-[10px] flex justify-center items-center overflow-hidden shrink-0">
              <img
                className="size-6 object-contain"
                src={logoImg}
                alt="TeaLedger"
              />
            </div>
            <div className="flex flex-col justify-start items-start overflow-hidden">
              <div className="text-white text-lg font-bold leading-tight">
                TeaLedger
              </div>
              <div className="text-emerald-200/75 text-xs font-normal">
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
                className={`self-stretch px-3 py-2.5 rounded-lg flex justify-start items-center gap-3 overflow-hidden cursor-pointer transition-colors text-left ${
                  active
                    ? 'bg-[#0B5D3B] text-white font-semibold'
                    : 'text-emerald-100/75 hover:bg-white/10 hover:text-white font-medium'
                }`}
              >
                <IconComponent className={`size-[18px] shrink-0 ${active ? 'text-white' : 'text-emerald-200/80'}`} />
                <span className="flex-1 text-sm">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Spacer */}
        <div className="flex-1 min-h-[40px]" />

        {/* Bottom User Profile */}
        <div className="self-stretch px-2 pt-3 flex items-center justify-between border-t border-white/10 mt-auto">
          <div className="flex flex-col justify-start items-start gap-0.5 overflow-hidden">
            <div className="text-white text-xs font-semibold truncate max-w-[140px]">
              {user?.name || 'Sunil Jayawardena'}
            </div>
            <div className="text-emerald-200/70 text-[11px] font-normal">
              {user?.role || 'Administrator'}
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            title="Log out"
            className="p-1.5 rounded-lg text-emerald-200/70 hover:text-rose-300 hover:bg-white/10 transition-colors cursor-pointer"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </aside>
    </>
  );
};
