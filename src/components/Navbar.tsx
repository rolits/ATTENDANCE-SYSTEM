import React, { useState, useEffect } from 'react';
import { AUSouthLogo } from './AUSouthLogo';
import { QrCode, Clock, LogOut, User as UserIcon, Shield, ChevronDown } from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  currentUser: User | null;
  onLogout: () => void;
  onNavigate: (page: string) => void;
  activePage: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onLogout,
  onNavigate,
  activePage,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (d: Date) => {
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (d: Date) => {
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const roleBadgeColor = {
    admin: 'bg-purple-100 text-purple-800 border-purple-200',
    officer: 'bg-blue-100 text-blue-800 border-blue-200',
    staff: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  }[currentUser?.role || 'staff'];

  const roleLabel = {
    admin: 'Administrator',
    officer: 'Attendance Officer',
    staff: 'Faculty / Staff',
  }[currentUser?.role || 'staff'];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs no-print">
      <div className="px-4 lg:px-8 py-2.5 flex items-center justify-between gap-4">
        {/* Left: Branding */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => onNavigate('dashboard')}
            className="cursor-pointer transition-opacity hover:opacity-95"
          >
            <AUSouthLogo size="md" />
          </div>
        </div>

        {/* Center: Live Real-Time Clock & Date */}
        <div className="hidden md:flex items-center gap-3 px-4 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-700 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <Clock className="w-3.5 h-3.5 text-[#0B3B60]" />
            <span>{formatDate(currentTime)}</span>
          </div>
          <div className="h-3 w-px bg-slate-300" />
          <div className="font-mono text-sm font-bold text-[#0B3B60] tracking-wider">
            {formatTime(currentTime)}
          </div>
        </div>

        {/* Right: Quick Scanner Link & User Profile Dropdown */}
        <div className="flex items-center gap-3">
          {/* Quick Scanner Action Button */}
          {currentUser?.role !== 'staff' && (
            <button
              onClick={() => onNavigate('scanner')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold text-xs transition-all shadow-xs ${
                activePage === 'scanner'
                  ? 'bg-amber-500 text-slate-950 font-bold ring-2 ring-amber-400'
                  : 'bg-[#0B3B60] hover:bg-[#07243c] text-white'
              }`}
            >
              <QrCode className="w-4 h-4 text-amber-300" />
              <span>QR Scanner Terminal</span>
            </button>
          )}

          {/* User Profile Info & Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0B3B60] to-blue-700 text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                {currentUser?.full_name ? currentUser.full_name.charAt(0) : 'U'}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-slate-800 leading-tight">
                  {currentUser?.full_name || 'Guest User'}
                </div>
                <div className="text-[10px] text-slate-500 flex items-center gap-1">
                  <span
                    className={`inline-block px-1 rounded border text-[9px] font-semibold uppercase ${roleBadgeColor}`}
                  >
                    {roleLabel}
                  </span>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-20 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="font-semibold text-slate-800">{currentUser?.full_name}</p>
                    <p className="text-slate-500 text-[11px] truncate">{currentUser?.email}</p>
                    <p className="text-[10px] text-[#0B3B60] font-medium mt-1 uppercase tracking-wider">
                      Role: {roleLabel}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      onNavigate('profile');
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                    <span>My Profile & QR Badge</span>
                  </button>

                  {currentUser?.role === 'admin' && (
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        onNavigate('settings');
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                    >
                      <Shield className="w-3.5 h-3.5 text-slate-500" />
                      <span>System Settings & Database</span>
                    </button>
                  )}

                  <div className="border-t border-slate-100 my-1" />

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      onLogout();
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2 font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
