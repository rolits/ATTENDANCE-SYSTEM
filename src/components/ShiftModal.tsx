import React, { useState, useEffect } from 'react';
import { X, CalendarClock, Check, AlertCircle } from 'lucide-react';
import { Shift } from '../types';

interface ShiftModalProps {
  isOpen: boolean;
  shift: Shift | null;
  onClose: () => void;
  onSave: (data: Partial<Shift>) => Promise<void>;
}

export const ShiftModal: React.FC<ShiftModalProps> = ({
  isOpen,
  shift,
  onClose,
  onSave,
}) => {
  const isEditing = Boolean(shift);

  const [formData, setFormData] = useState({
    name: '',
    start_time: '07:30',
    end_time: '16:30',
    grace_period_minutes: 15,
    is_default: false,
    description: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (shift) {
      setFormData({
        name: shift.name,
        start_time: shift.start_time.slice(0, 5),
        end_time: shift.end_time.slice(0, 5),
        grace_period_minutes: shift.grace_period_minutes,
        is_default: shift.is_default,
        description: shift.description || '',
      });
    } else {
      setFormData({
        name: '',
        start_time: '08:00',
        end_time: '17:00',
        grace_period_minutes: 15,
        is_default: false,
        description: '',
      });
    }
    setError(null);
  }, [shift, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name || !formData.start_time || !formData.end_time) {
      setError('Shift name, start time, and end time are required.');
      return;
    }

    setLoading(true);
    try {
      await onSave({
        ...formData,
        start_time: `${formData.start_time}:00`,
        end_time: `${formData.end_time}:00`,
        grace_period_minutes: Number(formData.grace_period_minutes),
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save shift');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0B3B60] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-amber-400" />
            <h2 className="font-bold text-base">
              {isEditing ? 'Edit Work Shift' : 'Create New Work Shift'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Shift Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#0B3B60]"
              placeholder="e.g. Morning Shift, Regular Day Shift"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Start Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                required
                value={formData.start_time}
                onChange={e => setFormData({ ...formData, start_time: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#0B3B60]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                End Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                required
                value={formData.end_time}
                onChange={e => setFormData({ ...formData, end_time: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#0B3B60]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 items-center">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Grace Period (Minutes) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                max="120"
                required
                value={formData.grace_period_minutes}
                onChange={e => setFormData({ ...formData, grace_period_minutes: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#0B3B60]"
              />
              <p className="text-[10px] text-slate-500 mt-0.5">
                Arrival within this window is marked On Time.
              </p>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_default}
                  onChange={e => setFormData({ ...formData, is_default: e.target.checked })}
                  className="rounded text-[#0B3B60] focus:ring-[#0B3B60]"
                />
                <span className="text-xs font-bold text-slate-800">
                  Set as Default Shift
                </span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Description / Notes
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#0B3B60]"
              placeholder="e.g. Standard schedule for academic staff and daytime instructors"
            />
          </div>

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
              <span>{loading ? 'Saving...' : isEditing ? 'Update Shift' : 'Create Shift'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
