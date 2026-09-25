import React, { useState, useEffect, useCallback } from 'react';
import {
  CalendarClock,
  Plus,
  Edit,
  Trash2,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { Shift } from '../types';
import { ShiftModal } from '../components/ShiftModal';

export const ShiftsPage: React.FC = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);

  const fetchShifts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/shifts');
      if (res.ok) {
        const data = await res.json();
        setShifts(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShifts();
  }, [fetchShifts]);

  const handleSaveShift = async (data: Partial<Shift>) => {
    const isEdit = Boolean(editingShift);
    const url = isEdit ? `/api/shifts/${editingShift?.id}` : '/api/shifts';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to save shift');
    }

    fetchShifts();
  };

  const handleDeleteShift = async (shift: Shift) => {
    if (!confirm(`Are you sure you want to delete shift "${shift.name}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/shifts/${shift.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to delete shift');
      } else {
        fetchShifts();
      }
    } catch (e) {
      alert('Failed to delete shift');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-[#0B3B60]" />
            <h1 className="text-xl font-black text-slate-800 tracking-tight">
              Work Shifts & Grace Periods
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure departmental working hours, allowed grace periods, and assign staff schedules.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingShift(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-[#0B3B60] hover:bg-[#07243c] text-white shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4 text-amber-300" />
          <span>+ Create New Shift</span>
        </button>
      </div>

      {/* Shifts Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {shifts.map(shift => (
          <div
            key={shift.id}
            className={`bg-white rounded-2xl border p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${
              shift.is_default
                ? 'border-[#0B3B60] ring-1 ring-[#0B3B60]/20'
                : 'border-slate-200'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 leading-tight">
                    {shift.name}
                  </h3>
                  {shift.is_default && (
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-amber-100 text-amber-800 border border-amber-300">
                      Default Institutional Shift
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditingShift(shift);
                      setIsModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Edit Shift"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteShift(shift)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Delete Shift"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Time Range */}
              <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#0B3B60]" />
                    <span>Operating Hours:</span>
                  </span>
                  <span className="font-mono font-bold text-slate-900">
                    {shift.start_time.slice(0, 5)} - {shift.end_time.slice(0, 5)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Grace Period:</span>
                  <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {shift.grace_period_minutes} mins
                  </span>
                </div>
              </div>

              {/* Description */}
              {shift.description && (
                <p className="mt-3 text-[11px] text-slate-500 leading-relaxed">
                  {shift.description}
                </p>
              )}
            </div>

            {/* Footer with Staff Count */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1 text-[11px]">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>Assigned Faculty/Staff:</span>
              </span>
              <span className="font-bold text-slate-900">
                {shift.staff_count ?? 0} members
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Shift Modal */}
      <ShiftModal
        isOpen={isModalOpen}
        shift={editingShift}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveShift}
      />
    </div>
  );
};
