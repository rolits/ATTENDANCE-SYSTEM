import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart3,
  Calendar,
  Download,
  Printer,
  FileText,
  Clock,
  UserX,
  UserCheck,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { exportToCSV } from '../utils/csv';

export const ReportsPage: React.FC = () => {
  const [reportType, setReportType] = useState<'summary' | 'daily' | 'lates' | 'absences'>('summary');
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<any>(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/attendance/reports?type=${reportType}&date=${dateFilter}`);
      if (res.ok) {
        const data = await res.json();
        setReportData(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [reportType, dateFilter]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Export to CSV depending on active tab
  const handleExportCSV = () => {
    if (!reportData) return;

    if (reportType === 'summary') {
      const rows = reportData.staff_summary.map((s: any) => ({
        'Staff ID': s.staff_code,
        'Full Name': s.full_name,
        'Department': s.department,
        'Position': s.position,
        'Days Recorded': s.total_days_recorded,
        'Present Count': s.present_count,
        'Late Count': s.late_count,
        'Total Late Minutes': s.total_late_minutes,
        'Attendance Rate %': `${s.attendance_rate}%`,
      }));
      exportToCSV('AU_South_Staff_Attendance_Summary', rows);
    } else if (reportType === 'lates') {
      const rows = reportData.late_records.map((r: any) => ({
        'Date': r.date,
        'Staff ID': r.staff_code,
        'Full Name': r.staff_name,
        'Department': r.department,
        'Time-In': r.time_in,
        'Late Duration (mins)': r.late_minutes,
        'Remarks': r.remarks,
      }));
      exportToCSV('AU_South_Late_Arrivals_Report', rows);
    } else if (reportType === 'absences') {
      const rows = reportData.absent_records.map((r: any) => ({
        'Date': r.date,
        'Staff ID': r.staff_code,
        'Full Name': r.staff_name,
        'Department': r.department,
        'Status': 'ABSENT',
        'Remarks': r.remarks,
      }));
      exportToCSV('AU_South_Absence_Records', rows);
    } else {
      const rows = reportData.all_records.map((r: any) => ({
        'Date': r.date,
        'Staff ID': r.staff_code,
        'Full Name': r.staff_name,
        'Department': r.department,
        'Time-In': r.time_in,
        'Time-Out': r.time_out,
        'Status': r.status,
        'Remarks': r.remarks,
      }));
      exportToCSV('AU_South_Daily_Attendance_Report', rows);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#0B3B60]" />
            <h1 className="text-xl font-black text-slate-800 tracking-tight">
              Attendance Analytics & Reports
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Generate institutional compliance reports, tardiness analytics, and faculty attendance summaries.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export to CSV / Excel</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-[#0B3B60] hover:bg-[#07243c] text-white shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-amber-300" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Official Print Header */}
      <div className="hidden print-only text-center border-b pb-4 mb-4">
        <h2 className="text-xl font-black text-[#0B3B60]">COLLEGE OF AU SOUTH</h2>
        <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Office of Academic Affairs & Human Resources
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Attendance Compliance Report • Generated on: {new Date().toLocaleString()}
        </p>
      </div>

      {/* Report Navigation Tabs & Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 no-print">
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setReportType('summary')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              reportType === 'summary'
                ? 'bg-white text-[#0B3B60] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Faculty & Staff Summary
          </button>
          <button
            onClick={() => setReportType('daily')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              reportType === 'daily'
                ? 'bg-white text-[#0B3B60] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Daily Log Report
          </button>
          <button
            onClick={() => setReportType('lates')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              reportType === 'lates'
                ? 'bg-white text-[#0B3B60] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Late Arrivals
          </button>
          <button
            onClick={() => setReportType('absences')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              reportType === 'absences'
                ? 'bg-white text-[#0B3B60] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Absence Log
          </button>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="flex items-center gap-1 text-xs text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="date"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className="text-xs bg-transparent border-none focus:outline-hidden text-slate-700"
            />
          </div>

          <button
            onClick={fetchReports}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Report View Body */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">
          Compiling attendance data...
        </div>
      ) : reportData ? (
        <div className="space-y-6">
          {/* TAB 1: STAFF SUMMARY */}
          {reportType === 'summary' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-200">
                <h3 className="font-bold text-sm text-slate-800">
                  Staff Attendance & Compliance Summary
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Aggregated on-time performance and tardiness minutes per faculty member.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Staff ID</th>
                      <th className="py-3 px-4">Full Name</th>
                      <th className="py-3 px-4">Department & Position</th>
                      <th className="py-3 px-4 text-center">Days Scanned</th>
                      <th className="py-3 px-4 text-center">Late Counts</th>
                      <th className="py-3 px-4 text-center">Total Tardiness</th>
                      <th className="py-3 px-4 text-center">Compliance Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {reportData.staff_summary.map((st: any) => (
                      <tr key={st.staff_id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          {st.staff_code}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {st.full_name}
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-slate-800">{st.department}</div>
                          <div className="text-[10px] text-slate-400">{st.position}</div>
                        </td>
                        <td className="py-3 px-4 text-center font-bold">
                          {st.total_days_recorded}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {st.late_count > 0 ? (
                            <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              {st.late_count}
                            </span>
                          ) : (
                            <span className="text-slate-400">0</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center font-mono">
                          {st.total_late_minutes > 0 ? `${st.total_late_minutes}m` : '0m'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="inline-flex items-center gap-1.5">
                            <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  st.attendance_rate >= 90
                                    ? 'bg-emerald-500'
                                    : st.attendance_rate >= 75
                                    ? 'bg-amber-500'
                                    : 'bg-rose-500'
                                }`}
                                style={{ width: `${st.attendance_rate}%` }}
                              />
                            </div>
                            <span className="font-bold text-slate-800 text-[11px]">
                              {st.attendance_rate}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: DAILY REPORT */}
          {reportType === 'daily' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-200">
                <h3 className="font-bold text-sm text-slate-800">
                  Daily Attendance Log ({dateFilter})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Complete ledger of scans recorded for the target date.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Staff Member</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4 text-center">Time-In</th>
                      <th className="py-3 px-4 text-center">Time-Out</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {reportData.all_records.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          No scans recorded on this date.
                        </td>
                      </tr>
                    ) : (
                      reportData.all_records.map((r: any) => (
                        <tr key={r.id} className="hover:bg-slate-50/70">
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">{r.staff_name}</div>
                            <div className="font-mono text-[10px] text-slate-400">{r.staff_code}</div>
                          </td>
                          <td className="py-3 px-4 text-slate-600">{r.department}</td>
                          <td className="py-3 px-4 text-center font-mono font-bold text-emerald-700">
                            {r.time_in || '--:--'}
                          </td>
                          <td className="py-3 px-4 text-center font-mono font-bold text-indigo-700">
                            {r.time_out || '--:--'}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 uppercase">
                              {r.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-500 text-[11px]">{r.remarks}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: LATE ARRIVALS */}
          {reportType === 'lates' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-200">
                <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Late Arrivals & Tardiness Audit</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  List of staff who clocked in beyond the scheduled shift grace period.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Staff Member</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4 text-center">Time-In</th>
                      <th className="py-3 px-4 text-center">Tardiness Duration</th>
                      <th className="py-3 px-4">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {reportData.late_records.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          No late arrivals found in recorded history.
                        </td>
                      </tr>
                    ) : (
                      reportData.late_records.map((r: any) => (
                        <tr key={r.id} className="hover:bg-amber-50/40">
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">{r.date}</td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">{r.staff_name}</div>
                            <div className="font-mono text-[10px] text-slate-400">{r.staff_code}</div>
                          </td>
                          <td className="py-3 px-4 text-slate-600">{r.department}</td>
                          <td className="py-3 px-4 text-center font-mono font-bold text-amber-800">
                            {r.time_in}
                          </td>
                          <td className="py-3 px-4 text-center font-bold text-amber-700">
                            +{r.late_minutes} minutes
                          </td>
                          <td className="py-3 px-4 text-slate-500 text-[11px]">{r.remarks}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: ABSENCE LOG */}
          {reportType === 'absences' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-200">
                <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                  <UserX className="w-4 h-4 text-rose-600" />
                  <span>Absence & Non-Attendance Log</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Staff members with no recorded Time-In during active work schedules.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Staff Member</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4">Reason / Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {reportData.absent_records.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400">
                          No absences recorded.
                        </td>
                      </tr>
                    ) : (
                      reportData.absent_records.map((r: any) => (
                        <tr key={r.id} className="hover:bg-rose-50/40">
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">{r.date}</td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">{r.staff_name}</div>
                            <div className="font-mono text-[10px] text-slate-400">{r.staff_code}</div>
                          </td>
                          <td className="py-3 px-4 text-slate-600">{r.department}</td>
                          <td className="py-3 px-4 text-center font-bold text-rose-700">
                            ABSENT
                          </td>
                          <td className="py-3 px-4 text-slate-500 text-[11px]">{r.remarks}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Official Signatures Section for Printed Institutional Report */}
          <div className="hidden print-only pt-16 grid grid-cols-3 gap-8 text-center text-xs">
            <div>
              <div className="border-b border-slate-400 pb-1 mb-1 font-bold">
                Prepared by: Attendance Officer
              </div>
              <p className="text-[10px] text-slate-500">Security & Gate Management</p>
            </div>
            <div>
              <div className="border-b border-slate-400 pb-1 mb-1 font-bold">
                Reviewed by: HR Director
              </div>
              <p className="text-[10px] text-slate-500">Human Resources Department</p>
            </div>
            <div>
              <div className="border-b border-slate-400 pb-1 mb-1 font-bold">
                Approved by: College President / Dean
              </div>
              <p className="text-[10px] text-slate-500">College of AU South</p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
