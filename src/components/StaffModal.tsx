import React, { useState, useEffect } from 'react';
import { X, UserPlus, Check, AlertCircle } from 'lucide-react';
import { Staff, Shift, StaffStatus } from '../types';

interface StaffModalProps {
  isOpen: boolean;
  staff: Staff | null;
  shifts: Shift[];
  onClose: () => void;
  onSave: (data: Partial<Staff> & { createUser?: boolean; username?: string; password?: string; role?: string }) => Promise<void>;
}

const DEPARTMENTS = [
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

export const StaffModal: React.FC<StaffModalProps> = ({
  isOpen,
  staff,
  shifts,
  onClose,
  onSave,
}) => {
  const isEditing = Boolean(staff);

  const [formData, setFormData] = useState<{
    staff_code: string;
    full_name: string;
    position: string;
    department: string;
    contact_number: string;
    email: string;
    shift_id: number;
    status: StaffStatus;
    createUser: boolean;
    username: string;
    password: string;
    role: string;
  }>({
    staff_code: '',
    full_name: '',
    position: '',
    department: DEPARTMENTS[0],
    contact_number: '',
    email: '',
    shift_id: shifts[0]?.id || 1,
    status: 'active',
    createUser: false,
    username: '',
    password: '',
    role: 'staff',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (staff) {
      setFormData({
        staff_code: staff.staff_code,
        full_name: staff.full_name,
        position: staff.position,
        department: staff.department || DEPARTMENTS[0],
        contact_number: staff.contact_number || '',
        email: staff.email,
        shift_id: staff.shift_id,
        status: staff.status,
        createUser: false,
        username: '',
        password: '',
        role: 'staff',
      });
    } else {
      const nextNum = Math.floor(100 + Math.random() * 900);
      setFormData({
        staff_code: `AUS-2024-${nextNum}`,
        full_name: '',
        position: 'Instructor',
        department: DEPARTMENTS[0],
        contact_number: '+63 917 ',
        email: '',
        shift_id: shifts.find(s => s.is_default)?.id || shifts[0]?.id || 1,
        status: 'active',
        createUser: true,
        username: '',
        password: 'password123',
        role: 'staff',
      });
    }
    setError(null);
  }, [staff, shifts, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.staff_code || !formData.full_name || !formData.email) {
      setError('Staff ID, Full Name, and Email are required.');
      return;
    }

    if (formData.createUser && !isEditing) {
      if (!formData.username || !formData.password) {
        setError('Username and Password are required when creating a login user account.');
        return;
      }
    }

    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save staff member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#0B3B60] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-amber-400" />
            <h2 className="font-bold text-base">
              {isEditing ? 'Edit Staff Profile' : 'Register New Faculty / Staff Member'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Staff ID / Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                disabled={isEditing}
                value={formData.staff_code}
                onChange={e => setFormData({ ...formData, staff_code: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#0B3B60] disabled:bg-slate-100 font-mono"
                placeholder="e.g. AUS-2024-001"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#0B3B60]"
                placeholder="e.g. Dr. Jane Doe"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Academic Department <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.department}
                onChange={e => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#0B3B60]"
              >
                {DEPARTMENTS.map(d => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Position / Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.position}
                onChange={e => setFormData({ ...formData, position: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#0B3B60]"
                placeholder="e.g. Assistant Professor"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Institutional Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#0B3B60]"
                placeholder="name@ausouth.edu.ph"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Contact Number
              </label>
              <input
                type="text"
                value={formData.contact_number}
                onChange={e => setFormData({ ...formData, contact_number: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#0B3B60]"
                placeholder="+63 917 123 4567"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Assigned Work Shift <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.shift_id}
                onChange={e => setFormData({ ...formData, shift_id: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#0B3B60]"
              >
                {shifts.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.start_time.slice(0, 5)} - {s.end_time.slice(0, 5)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Account Status
              </label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#0B3B60]"
              >
                <option value="active">Active (Can Scan Attendance)</option>
                <option value="inactive">Inactive / Deactivated</option>
              </select>
            </div>
          </div>

          {/* Optional User Account Provisioning */}
          {!isEditing && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.createUser}
                  onChange={e => setFormData({ ...formData, createUser: e.target.checked })}
                  className="rounded text-[#0B3B60] focus:ring-[#0B3B60]"
                />
                <span className="text-xs font-bold text-slate-800">
                  Provision Portal Login Account
                </span>
              </label>

              {formData.createUser && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={e => setFormData({ ...formData, username: e.target.value })}
                      placeholder="e.g. jdoe"
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Initial Password
                    </label>
                    <input
                      type="text"
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      placeholder="password"
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      System Role
                    </label>
                    <select
                      value={formData.role}
                      onChange={e => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                    >
                      <option value="staff">Staff / Faculty</option>
                      <option value="officer">Attendance Officer</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold rounded-lg bg-[#0B3B60] hover:bg-[#07243c] text-white transition-colors disabled:opacity-50 shadow-xs"
            >
              <Check className="w-4 h-4 text-amber-300" />
              <span>{loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Register & Generate QR'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
