import React, { useState, useEffect } from 'react';
import {
  Users,
  UserCheck,
  Clock,
  UserX,
  LogIn,
  LogOut,
  QrCode,
  ArrowUpRight,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { DashboardStats, AttendanceRecord } from '../types';

interface DashboardPageProps {
  onNavigate: (page: string) => void;
  onOpenQRBadge?: (record: AttendanceRecord) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigate,
}) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/dashboard/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.error('Failed to load dashboard statistics', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 8000); // refresh every 8 seconds
    return () => clearInterval(interval);
  }, []);

  const filteredScans = (stats?.recent_scans || []).filter(
    s =>
      s.staff_name?.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.staff_code?.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.department?.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#0B3B60] via-[#0e4875] to-[#07243c] rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-radial from-amber-400/20 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-300 text-xs font-bold mb-2">
              <span>Academic Year 2024-2025</span>
              <span>•</span>
              <span>AU South Campus</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight">
              Attendance Command Dashboard
            </h1>
            <p className="text-slate-200 text-xs mt-1 max-w-xl">
              Real-time monitoring of faculty, instructors, and administrative staff scans, shifts, and attendance compliance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onNavigate('scanner')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-slate-950" />
              <span>Open QR Scanner</span>
            </button>
            <button
              onClick={fetchStats}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="Refresh Stats"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* 6 Key Stat Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Staff */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Total Staff
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-800">
            {stats ? stats.total_staff : '--'}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Registered active members</p>
        </div>

        {/* Present Today */}
        <div className="bg-white rounded-2xl p-4 border border-emerald-200 bg-emerald-50/20 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              Present Today
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-800">
            {stats ? stats.present_today : '--'}
          </div>
          <p className="text-[10px] text-emerald-600 mt-0.5">Scanned Time-In today</p>
        </div>

        {/* Late Today */}
        <div className="bg-white rounded-2xl p-4 border border-amber-200 bg-amber-50/20 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
              Late Today
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-amber-800">
            {stats ? stats.late_today : '--'}
          </div>
          <p className="text-[10px] text-amber-600 mt-0.5">After shift grace period</p>
        </div>

        {/* Absent Today */}
        <div className="bg-white rounded-2xl p-4 border border-rose-200 bg-rose-50/20 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700">
              Absent Today
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
              <UserX className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-rose-800">
            {stats ? stats.absent_today : '--'}
          </div>
          <p className="text-[10px] text-rose-600 mt-0.5">No Time-In recorded</p>
        </div>

        {/* Currently In */}
        <div className="bg-white rounded-2xl p-4 border border-[#0B3B60]/30 bg-blue-50/20 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0B3B60]">
              Currently In
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#0B3B60] flex items-center justify-center">
              <LogIn className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-[#0B3B60]">
            {stats ? stats.currently_in : '--'}
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Inside campus / on duty</p>
        </div>

        {/* Completed Time-Out */}
        <div className="bg-white rounded-2xl p-4 border border-indigo-200 bg-indigo-50/20 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">
              Completed Out
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <LogOut className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-indigo-800">
            {stats ? stats.completed_timeout : '--'}
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Scanned departure</p>
        </div>
      </div>

      {/* Main Content: Live Attendance Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Header Controls */}
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-sm font-bold text-slate-800">
                Today&apos;s Live Attendance Feed
              </h2>
            </div>
            <p className="text-slate-500 text-xs mt-0.5">
              Instant updates as teachers and personnel scan at the terminal.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
                placeholder="Search staff, ID, department..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-1 focus:ring-[#0B3B60]"
              />
            </div>
            <button
              onClick={() => onNavigate('records')}
              className="flex items-center gap-1 text-xs font-semibold text-[#0B3B60] hover:text-[#07243c] px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 whitespace-nowrap cursor-pointer"
            >
              <span>View Full History</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Faculty / Staff Member</th>
                <th className="py-3 px-4">Department & Position</th>
                <th className="py-3 px-4">Assigned Shift</th>
                <th className="py-3 px-4 text-center">Time-In</th>
                <th className="py-3 px-4 text-center">Time-Out</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Method / Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredScans.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    No attendance scans recorded for today yet. Use the QR Scanner to begin recording.
                  </td>
                </tr>
              ) : (
                filteredScans.map(rec => (
                  <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Staff details */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#0B3B60]/10 text-[#0B3B60] font-black text-xs flex items-center justify-center">
                          {rec.staff_name ? rec.staff_name.charAt(0) : 'S'}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 leading-tight">
                            {rec.staff_name}
                          </div>
                          <div className="font-mono text-[10px] text-slate-500">
                            {rec.staff_code}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Department & Position */}
                    <td className="py-3 px-4">
                      <div className="text-slate-800 font-semibold">{rec.department}</div>
                      <div className="text-[10px] text-slate-500">{rec.position}</div>
                    </td>

                    {/* Shift */}
                    <td className="py-3 px-4 text-slate-600">
                      {rec.shift_name}
                    </td>

                    {/* Time In */}
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-800">
                      {rec.time_in ? (
                        <span className="text-emerald-700">{rec.time_in}</span>
                      ) : (
                        <span className="text-slate-300">--:--:--</span>
                      )}
                    </td>

                    {/* Time Out */}
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-800">
                      {rec.time_out ? (
                        <span className="text-indigo-700">{rec.time_out}</span>
                      ) : (
                        <span className="text-amber-600/80 text-[11px] font-normal italic">
                          Currently In
                        </span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4 text-center">
                      {rec.status === 'on_time' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          On Time
                        </span>
                      )}
                      {rec.status === 'late' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          Late (+{rec.late_minutes}m)
                        </span>
                      )}
                      {rec.status === 'time_out' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                          <CheckCircle2 className="w-3 h-3 text-indigo-600" />
                          Completed Out
                        </span>
                      )}
                      {rec.status === 'absent' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                          Absent
                        </span>
                      )}
                    </td>

                    {/* Method / Remarks */}
                    <td className="py-3 px-4 text-slate-500 text-[11px] max-w-[200px] truncate">
                      <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 mr-1.5">
                        {rec.scan_method === 'camera_qr' ? 'QR Cam' : 'Manual'}
                      </span>
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
