import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Shield,
  Key,
  QrCode,
  Download,
  Printer,
  CheckCircle2,
  AlertCircle,
  Clock,
  Building,
} from 'lucide-react';
import { User, Staff } from '../types';

interface UserProfilePageProps {
  currentUser: User | null;
  onOpenQRBadge: (staff: Staff) => void;
}

export const UserProfilePage: React.FC<UserProfilePageProps> = ({
  currentUser,
  onOpenQRBadge,
}) => {
  const [currentStaff, setCurrentStaff] = useState<Staff | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    // If user has a linked staff ID, or if user is staff, fetch their profile
    fetch('/api/staff')
      .then(res => res.json())
      .then((staffList: Staff[]) => {
        if (!currentUser) return;
        const match =
          staffList.find(s => s.user_id === currentUser.id) ||
          staffList.find(s => s.email.toLowerCase() === currentUser.email.toLowerCase()) ||
          (currentUser.staff_id ? staffList.find(s => s.id === currentUser.staff_id) : null);
        if (match) {
          setCurrentStaff(match);
        }
      })
      .catch(console.error);
  }, [currentUser]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.id,
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update password');
      }

      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      setPasswordError(err instanceof Error ? err.message : 'Error changing password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const roleLabel = {
    admin: 'Administrator',
    officer: 'Attendance Officer',
    staff: 'Teacher / Staff Member',
  }[currentUser?.role || 'staff'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-[#0B3B60]" />
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">
              User Profile & Credentials
            </h1>
            <p className="text-xs text-slate-500">
              Manage your personal workstation credentials and view your institutional ID badge.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* User Account Info & Staff Card (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#0B3B60]" />
              <span>Account Information</span>
            </h2>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#0B3B60] text-amber-400 font-black text-xl flex items-center justify-center shadow-md">
                {currentUser?.full_name ? currentUser.full_name.charAt(0) : 'U'}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 leading-tight">
                  {currentUser?.full_name}
                </h3>
                <p className="text-xs text-slate-500">{currentUser?.email}</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 uppercase">
                    Role: {roleLabel}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    Username: @{currentUser?.username}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Linked Teacher/Staff QR Card */}
          {currentStaff ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-[#0B3B60]" />
                  <h3 className="font-bold text-sm text-slate-800">
                    My Official Institutional QR Badge
                  </h3>
                </div>
                <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-100 rounded text-slate-700">
                  ID: {currentStaff.staff_code}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs shrink-0">
                  {currentStaff.qr_code_image && (
                    <img
                      src={currentStaff.qr_code_image}
                      alt="Personal QR Code"
                      className="w-36 h-36 object-contain"
                    />
                  )}
                </div>

                <div className="space-y-2 text-xs flex-1 text-center sm:text-left">
                  <div>
                    <h4 className="font-bold text-slate-900">{currentStaff.full_name}</h4>
                    <p className="text-[#0B3B60] font-semibold">{currentStaff.position}</p>
                    <p className="text-slate-500 text-[11px]">{currentStaff.department}</p>
                  </div>

                  <p className="text-[11px] text-slate-500">
                    Hold this QR badge in front of any campus terminal camera to scan Time-In and Time-Out.
                  </p>

                  <div className="pt-2 flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                    <button
                      onClick={() => onOpenQRBadge(currentStaff)}
                      className="px-3 py-1.5 rounded-lg bg-[#0B3B60] text-white font-bold text-xs hover:bg-[#07243c] flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Printer className="w-3.5 h-3.5 text-amber-300" />
                      <span>View & Print Badge</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs text-xs text-slate-500">
              <p className="font-bold text-slate-700 mb-1">Notice</p>
              <p>
                This account is currently logged in as a system Administrator or Terminal Officer. Direct teacher QR badges are issued to teaching and departmental staff.
              </p>
            </div>
          )}
        </div>

        {/* Change Password Form (5 cols) */}
        <div className="lg:col-span-5">
          <form
            onSubmit={handlePasswordSubmit}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4"
          >
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-[#0B3B60]" />
              <h2 className="text-sm font-bold text-slate-800">
                Change Account Password
              </h2>
            </div>

            {passwordSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Password successfully changed!</span>
              </div>
            )}

            {passwordError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#0B3B60]"
                placeholder="Enter current password"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#0B3B60]"
                placeholder="Minimum 6 characters"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#0B3B60]"
                placeholder="Repeat new password"
              />
            </div>

            <button
              type="submit"
              disabled={passwordLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-[#0B3B60] hover:bg-[#07243c] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              {passwordLoading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
