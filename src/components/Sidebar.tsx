import React from 'react';
import {
  LayoutDashboard,
  QrCode,
  Users,
  CalendarClock,
  ClipboardList,
  BarChart3,
  FileClock,
  Settings,
  UserCheck,
  ShieldCheck,
} from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  currentUser: User | null;
  activePage: string;
  onNavigate: (page: string) => void;
  isOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  activePage,
  onNavigate,
  isOpen,
  onCloseMobile,
}) => {
  const role = currentUser?.role || 'staff';

  // Navigation config based on RBAC
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['admin', 'officer', 'staff'],
    },
    {
      id: 'scanner',
      label: 'QR Scanner Terminal',
      icon: QrCode,
      roles: ['admin', 'officer'],
      badge: 'Live',
    },
    {
      id: 'staff',
      label: 'Staff Management',
      icon: Users,
      roles: ['admin'],
    },
    {
      id: 'shifts',
      label: 'Shift Management',
      icon: CalendarClock,
      roles: ['admin'],
    },
    {
      id: 'records',
      label: role === 'staff' ? 'My Attendance' : 'Attendance Records',
      icon: ClipboardList,
      roles: ['admin', 'officer', 'staff'],
    },
    {
      id: 'reports',
      label: 'Reports & Analytics',
      icon: BarChart3,
      roles: ['admin'],
    },
    {
      id: 'audit',
      label: 'System Audit Logs',
      icon: FileClock,
      roles: ['admin'],
    },
    {
      id: 'profile',
      label: role === 'staff' ? 'My QR ID & Profile' : 'User Profile',
      icon: UserCheck,
      roles: ['admin', 'officer', 'staff'],
    },
    {
      id: 'settings',
      label: 'Settings & Database',
      icon: Settings,
      roles: ['admin'],
    },
  ];

  const filteredItems = navItems.filter(item => item.roles.includes(role));

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-30 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-14 bottom-0 left-0 z-30 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out border-r border-slate-800 no-print lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Navigation Section */}
        <div className="flex-1 py-4 px-3 overflow-y-auto space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Main Navigation
          </div>

          {filteredItems.map(item => {
            const Icon = item.icon;
            const isActive = activePage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-xs transition-all ${
                  isActive
                    ? 'bg-[#0B3B60] text-white shadow-sm font-semibold border-l-4 border-amber-400'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-amber-400' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[9px] font-extrabold uppercase rounded bg-amber-500 text-slate-950">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Institutional Campus Footer */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="truncate">
              <p className="font-semibold text-slate-200 text-[11px] truncate">
                AU South Campus
              </p>
              <p className="text-[10px] text-slate-400">Secure QR AMS v2.4</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
