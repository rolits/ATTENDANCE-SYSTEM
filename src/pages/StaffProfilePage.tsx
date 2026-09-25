import React, { useState, useEffect, useCallback } from 'react';
import {
  User,
  Building,
  Mail,
  Phone,
  Calendar,
  Clock,
  QrCode,
  Printer,
  Download,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Shield,
} from 'lucide-react';
import { Staff, AttendanceRecord, User as AuthUser } from '../types';
import { AUSouthLogo } from '../components/AUSouthLogo';

interface StaffProfilePageProps {
  staffId?: number | null;
  currentUser: AuthUser | null;
  onBack?: () => void;
  onOpenQRBadge: (staff: Staff) => void;
}

export const StaffProfilePage: React.FC<StaffProfilePageProps> = ({
  staffId,
  currentUser,
  onBack,
  onOpenQRBadge,
}) => {
  const [staff, setStaff] = useState<Staff | null>(null);
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // If staffId is not provided, look for current user's linked staff ID or staff record
  const targetId = staffId || currentUser?.staff_id;

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      // If we don't have a direct ID, fetch staff list and match
      let url = targetId ? `/api/staff/${targetId}` : null;
      if (!url && currentUser) {
        const resList = await fetch('/api/staff');
        if (resList.ok) {
          const list: Staff[] = await resList.json();
          const match = list.find(s => s.user_id === currentUser.id || s.email === currentUser.email);
          if (match) url = `/api/staff/${match.id}`;
        }
      }

      if (url) {
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setStaff(data);
          setHistory(data.recent_attendance || []);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [targetId, currentUser]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleDownloadQR = () => {
    if (!staff?.qr_code_image) return;
    const a = document.createElement('a');
    a.href = staff.qr_code_image;
    a.download = `AUS_QR_${staff.staff_code}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500 text-sm">
        Loading staff profile...
      </div>
    );
  }

  if (!staff) {
    return (
      <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-3">
        <p className="text-slate-700 font-bold text-sm">Staff profile not found.</p>
        <p className="text-slate-500 text-xs">
          If you are logged in as an Administrator or Attendance Officer without a linked teaching profile, you can view other staff from the Staff Directory.
        </p>
        {onBack && (
          <button
            onClick={onBack}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-[#0B3B60] text-white"
          >
            Back to Directory
          </button>
        )}
      </div>
    );
  }

  const presentCount = history.filter(h => h.time_in !== null).length;
  const lateCount = history.filter(h => h.status === 'late').length;

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-[#0B3B60] hover:text-[#07243c] cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Staff Directory</span>
        </button>
      )}

      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-[#0B3B60] text-amber-400 font-black text-2xl flex items-center justify-center shadow-md border-2 border-amber-400/80">
              {staff.full_name
                .split(' ')
                .map(n => n[0])
                .slice(0, 2)
                .join('')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 leading-tight">
                  {staff.full_name}
                </h1>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    staff.status === 'active'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {staff.status.toUpperCase()}
                </span>
              </div>
              <p className="text-xs font-bold text-[#0B3B60] mt-0.5">{staff.position}</p>
              <p className="text-xs text-slate-500">{staff.department}</p>
              <div className="mt-2 font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md inline-block">
                Staff ID: {staff.staff_code}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onOpenQRBadge(staff)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-[#0B3B60] hover:bg-[#07243c] text-white shadow-xs transition-colors cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-amber-300" />
              <span>View / Print ID Card</span>
            </button>
            <button
              onClick={handleDownloadQR}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Download QR</span>
            </button>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
              Email Address
            </span>
            <span className="font-semibold text-slate-800 truncate block">
              {staff.email}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
              Contact Number
            </span>
            <span className="font-semibold text-slate-800">
              {staff.contact_number || 'N/A'}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
              Assigned Shift
            </span>
            <span className="font-semibold text-slate-800 block">
              {staff.shift?.name || 'Standard Day Shift'}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              {staff.shift ? `${staff.shift.start_time.slice(0, 5)} - ${staff.shift.end_time.slice(0, 5)}` : ''}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
              Grace Period
            </span>
            <span className="font-semibold text-slate-800">
              {staff.shift?.grace_period_minutes || 15} minutes
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase">
            Total Scanned Sessions
          </span>
          <div className="text-2xl font-black text-slate-800 mt-1">
            {history.length}
          </div>
          <p className="text-[10px] text-slate-400">Total days with recorded scans</p>
        </div>

        <div className="bg-white rounded-2xl border border-emerald-200 bg-emerald-50/20 p-4 shadow-xs">
          <span className="text-xs font-bold text-emerald-800 uppercase">
            On-Time Arrivals
          </span>
          <div className="text-2xl font-black text-emerald-800 mt-1">
            {presentCount - lateCount}
          </div>
          <p className="text-[10px] text-emerald-600">Arrived within shift grace period</p>
        </div>

        <div className="bg-white rounded-2xl border border-amber-200 bg-amber-50/20 p-4 shadow-xs">
          <span className="text-xs font-bold text-amber-800 uppercase">
            Late Arrivals
          </span>
          <div className="text-2xl font-black text-amber-800 mt-1">
            {lateCount}
          </div>
          <p className="text-[10px] text-amber-600">Arrived after shift grace period</p>
        </div>
      </div>

      {/* Attendance History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h2 className="font-bold text-sm text-slate-800">
            Attendance History Log
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Historical Time-In and Time-Out timestamps recorded by QR scanners.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-center">Time-In</th>
                <th className="py-3 px-4 text-center">Time-Out</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Late Duration</th>
                <th className="py-3 px-4">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                    No attendance records found for this profile yet.
                  </td>
                </tr>
              ) : (
                history.map(rec => (
                  <tr key={rec.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {rec.date}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-emerald-700">
                      {rec.time_in || '--:--'}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-indigo-700">
                      {rec.time_out || (
                        <span className="text-amber-600 font-normal italic text-[11px]">
                          On Duty
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          rec.status === 'on_time'
                            ? 'bg-emerald-100 text-emerald-800'
                            : rec.status === 'late'
                            ? 'bg-amber-100 text-amber-800'
                            : rec.status === 'time_out'
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {rec.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {rec.late_minutes > 0 ? (
                        <span className="text-amber-700 font-bold">
                          +{rec.late_minutes} mins
                        </span>
                      ) : (
                        <span className="text-slate-400">None</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {rec.remarks}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
