import React, { useState, useEffect, useCallback } from 'react';
import {
  ClipboardList,
  Search,
  Filter,
  Calendar,
  Download,
  Printer,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  UserX,
} from 'lucide-react';
import { AttendanceRecord, User as AuthUser } from '../types';
import { exportToCSV } from '../utils/csv';

interface AttendanceRecordsPageProps {
  currentUser: AuthUser | null;
}

export const AttendanceRecordsPage: React.FC<AttendanceRecordsPageProps> = ({
  currentUser,
}) => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const isStaffOnly = currentUser?.role === 'staff';

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateFilter) params.append('date', dateFilter);
      if (deptFilter !== 'ALL') params.append('department', deptFilter);
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (search) params.append('search', search);
      if (isStaffOnly && currentUser?.staff_id) {
        params.append('staffId', String(currentUser.staff_id));
      }
      params.append('page', String(page));
      params.append('limit', '50');

      const res = await fetch(`/api/attendance/records?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setRecords(data.records);
        setTotalRecords(data.total);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [dateFilter, deptFilter, statusFilter, search, isStaffOnly, currentUser, page]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleExportCSV = () => {
    const exportData = records.map(r => ({
      'Staff ID': r.staff_code || 'N/A',
      'Faculty / Staff Name': r.staff_name || 'N/A',
      'Department': r.department || 'N/A',
      'Date': r.date,
      'Time-In': r.time_in || '--:--',
      'Time-Out': r.time_out || '--:--',
      'Shift': r.shift_name || 'Shift',
      'Status': r.status.replace('_', ' ').toUpperCase(),
      'Late Minutes': r.late_minutes,
      'Scan Method': r.scan_method,
      'Remarks': r.remarks || '',
    }));
    exportToCSV('AU_South_Attendance_Records', exportData);
  };

  const handlePrint = () => {
    window.print();
  };

  const departments = [
    'College of Computer Studies',
    'College of Engineering',
    'College of Nursing',
    'College of Arts & Sciences',
    'College of Education',
    'College of Business',
    'Administration & Records',
    'MIS & Technical Support',
    'Maintenance & Security',
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-[#0B3B60]" />
            <h1 className="text-xl font-black text-slate-800 tracking-tight">
              {isStaffOnly ? 'My Attendance Records' : 'Attendance Log Records'}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Search, filter, and audit chronological Time-In and Time-Out timestamps across departments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-[#0B3B60] hover:bg-[#07243c] text-white shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-amber-300" />
            <span>Print Records</span>
          </button>
        </div>
      </div>

      {/* Printable Report Header (Visible only when printing) */}
      <div className="hidden print-only mb-6 text-center border-b pb-4">
        <h2 className="text-lg font-black text-[#0B3B60]">COLLEGE OF AU SOUTH</h2>
        <p className="text-xs text-slate-600">Official Attendance Records Report</p>
        <p className="text-[10px] text-slate-400">Generated on {new Date().toLocaleString()}</p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by staff name, ID, or remarks..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#0B3B60]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Date Picker */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-2 py-1.5 rounded-lg border border-slate-200">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="date"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className="text-xs bg-transparent border-none focus:outline-hidden text-slate-700"
            />
            {dateFilter && (
              <button
                onClick={() => setDateFilter('')}
                className="text-[10px] text-slate-400 hover:text-slate-600 ml-1"
              >
                Clear
              </button>
            )}
          </div>

          {/* Department Filter (if not staff) */}
          {!isStaffOnly && (
            <select
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
            >
              <option value="ALL">All Departments</option>
              {departments.map(d => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          )}

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
          >
            <option value="ALL">All Statuses</option>
            <option value="on_time">On Time</option>
            <option value="late">Late</option>
            <option value="time_out">Completed Out</option>
            <option value="absent">Absent</option>
          </select>

          <button
            onClick={fetchRecords}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Faculty / Staff Member</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4 text-center">Time-In</th>
                <th className="py-3.5 px-4 text-center">Time-Out</th>
                <th className="py-3.5 px-4">Shift Schedule</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4">Tardiness / Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400 text-xs">
                    No attendance records match your filter criteria.
                  </td>
                </tr>
              ) : (
                records.map(rec => (
                  <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Date */}
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {rec.date}
                    </td>

                    {/* Staff Name & ID */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 leading-tight">
                        {rec.staff_name}
                      </div>
                      <div className="font-mono text-[10px] text-slate-400">
                        {rec.staff_code}
                      </div>
                    </td>

                    {/* Department */}
                    <td className="py-3 px-4 text-slate-600 text-xs">
                      {rec.department}
                    </td>

                    {/* Time In */}
                    <td className="py-3 px-4 text-center font-mono font-bold text-emerald-700 whitespace-nowrap">
                      {rec.time_in || '--:--:--'}
                    </td>

                    {/* Time Out */}
                    <td className="py-3 px-4 text-center font-mono font-bold text-indigo-700 whitespace-nowrap">
                      {rec.time_out || (
                        <span className="text-amber-600 font-normal italic text-[10px]">
                          Currently In
                        </span>
                      )}
                    </td>

                    {/* Shift */}
                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {rec.shift_name}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {rec.status === 'on_time' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          On Time
                        </span>
                      )}
                      {rec.status === 'late' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          Late (+{rec.late_minutes}m)
                        </span>
                      )}
                      {rec.status === 'time_out' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                          <CheckCircle2 className="w-3 h-3 text-indigo-600" />
                          Completed Out
                        </span>
                      )}
                      {rec.status === 'absent' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                          <UserX className="w-3 h-3 text-rose-600" />
                          Absent
                        </span>
                      )}
                    </td>

                    {/* Remarks */}
                    <td className="py-3 px-4 text-slate-500 text-[11px] max-w-xs truncate">
                      {rec.remarks}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 no-print">
          <span>Showing {records.length} of {totalRecords} records</span>
          <span className="text-[11px] font-mono">
            College of AU South • Attendance Subsystem
          </span>
        </div>
      </div>
    </div>
  );
};
