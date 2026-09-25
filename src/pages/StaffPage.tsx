import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  QrCode,
  Edit,
  Trash2,
  RefreshCw,
  Download,
  Eye,
  CheckCircle2,
  XCircle,
  Shield,
  Smartphone,
  Calendar,
} from 'lucide-react';
import { Staff, Shift } from '../types';
import { StaffModal } from '../components/StaffModal';
import { exportToCSV } from '../utils/csv';

interface StaffPageProps {
  onOpenQRBadge: (staff: Staff) => void;
  onViewProfile: (staff: Staff) => void;
}

export const StaffPage: React.FC<StaffPageProps> = ({
  onOpenQRBadge,
  onViewProfile,
}) => {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [resStaff, resShifts] = await Promise.all([
        fetch('/api/staff'),
        fetch('/api/shifts'),
      ]);
      if (resStaff.ok) {
        const staffData = await resStaff.json();
        setStaffList(staffData);
      }
      if (resShifts.ok) {
        const shiftData = await resShifts.json();
        setShifts(shiftData);
      }
    } catch (e) {
      console.error('Error fetching staff list', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle Save Staff (Create / Update)
  const handleSaveStaff = async (
    data: Partial<Staff> & { createUser?: boolean; username?: string; password?: string; role?: string }
  ) => {
    const isEdit = Boolean(editingStaff);
    const url = isEdit ? `/api/staff/${editingStaff?.id}` : '/api/staff';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to save staff member');
    }

    fetchData();
  };

  // Handle Regenerate QR
  const handleRegenerateQR = async (staffId: number) => {
    if (!confirm('Are you sure you want to regenerate this staff member\'s QR code? Previous badges will be revoked.')) {
      return;
    }
    try {
      const res = await fetch(`/api/staff/${staffId}/regenerate-qr`, { method: 'POST' });
      if (res.ok) {
        alert('QR code successfully regenerated and updated.');
        fetchData();
      }
    } catch (e) {
      alert('Failed to regenerate QR code');
    }
  };

  // Handle Toggle Status (Active / Deactivate)
  const handleToggleStatus = async (staff: Staff) => {
    const actionName = staff.status === 'active' ? 'deactivate' : 'activate';
    if (!confirm(`Are you sure you want to ${actionName} ${staff.full_name}?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/staff/${staff.id}/toggle-status`, { method: 'PUT' });
      if (res.ok) {
        fetchData();
      }
    } catch (e) {
      alert(`Failed to ${actionName} staff member`);
    }
  };

  // Export Staff Directory to CSV
  const handleExportCSV = () => {
    const exportData = staffList.map(s => ({
      'Staff ID': s.staff_code,
      'Full Name': s.full_name,
      'Position': s.position,
      'Department': s.department,
      'Email': s.email,
      'Contact Number': s.contact_number,
      'Shift': s.shift?.name || 'N/A',
      'QR Token': s.qr_code_token,
      'Status': s.status.toUpperCase(),
      'Hire Date': s.hire_date,
    }));
    exportToCSV('AU_South_Staff_Directory', exportData);
  };

  // Filter staff
  const departments = Array.from(new Set(staffList.map(s => s.department)));
  const filtered = staffList.filter(s => {
    const matchesSearch =
      s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.staff_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.position.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = deptFilter === 'ALL' || s.department === deptFilter;
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;

    return matchesSearch && matchesDept && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#0B3B60]" />
            <h1 className="text-xl font-black text-slate-800 tracking-tight">
              Faculty & Staff Directory
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage teacher profiles, generate unique QR badges, assign work shifts, and configure access.
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
            onClick={() => {
              setEditingStaff(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-[#0B3B60] hover:bg-[#07243c] text-white shadow-xs transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-amber-300" />
            <span>+ Add Staff Member</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by name, ID, position, email..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#0B3B60]"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Department Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
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
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
          >
            <option value="ALL">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>

          <button
            onClick={fetchData}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 cursor-pointer"
            title="Reload Directory"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Staff ID</th>
                <th className="py-3.5 px-4">Faculty / Staff Name</th>
                <th className="py-3.5 px-4">Department & Position</th>
                <th className="py-3.5 px-4">Assigned Shift</th>
                <th className="py-3.5 px-4 text-center">QR Badge</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    No faculty or staff found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map(staff => (
                  <tr key={staff.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Staff ID */}
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {staff.staff_code}
                    </td>

                    {/* Full Name & Email */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 leading-tight">
                        {staff.full_name}
                      </div>
                      <div className="text-[11px] text-slate-500">{staff.email}</div>
                    </td>

                    {/* Department & Position */}
                    <td className="py-3 px-4">
                      <div className="text-slate-800 font-semibold">{staff.department}</div>
                      <div className="text-[10px] text-slate-500">{staff.position}</div>
                    </td>

                    {/* Shift */}
                    <td className="py-3 px-4 text-slate-600">
                      {staff.shift ? (
                        <div>
                          <div className="font-semibold text-slate-800">{staff.shift.name}</div>
                          <div className="text-[10px] text-slate-400">
                            {staff.shift.start_time.slice(0, 5)} - {staff.shift.end_time.slice(0, 5)}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400">Default Shift</span>
                      )}
                    </td>

                    {/* QR Code Preview Thumbnail */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => onOpenQRBadge(staff)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#0B3B60] border border-blue-200 transition-colors cursor-pointer"
                        title="Click to view full printable ID badge"
                      >
                        <QrCode className="w-3.5 h-3.5 text-[#0B3B60]" />
                        <span className="text-[10px] font-bold">View Badge</span>
                      </button>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 text-center">
                      {staff.status === 'active' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                          <XCircle className="w-3 h-3 text-rose-600" />
                          Inactive
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onViewProfile(staff)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-[#0B3B60] hover:bg-slate-100 transition-colors cursor-pointer"
                          title="View Profile & History"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            setEditingStaff(staff);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                          title="Edit Profile"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleRegenerateQR(staff.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                          title="Regenerate QR Token"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleToggleStatus(staff)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            staff.status === 'active'
                              ? 'text-slate-500 hover:text-rose-600 hover:bg-rose-50'
                              : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={staff.status === 'active' ? 'Deactivate Account' : 'Activate Account'}
                        >
                          {staff.status === 'active' ? (
                            <Trash2 className="w-4 h-4" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Staff Modal */}
      <StaffModal
        isOpen={isModalOpen}
        staff={editingStaff}
        shifts={shifts}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveStaff}
      />
    </div>
  );
};
