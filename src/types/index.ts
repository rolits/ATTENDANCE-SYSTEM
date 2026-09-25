// ============================================================
// AU South QR Attendance System - Types & Data Models
// ============================================================

export type UserRole = 'admin' | 'officer' | 'staff';

export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  full_name: string;
  is_active: boolean;
  staff_id?: number;
  last_login?: string;
  created_at: string;
}

export interface Shift {
  id: number;
  name: string;
  start_time: string; // e.g. "07:30" or "07:30:00"
  end_time: string;   // e.g. "16:30" or "16:30:00"
  grace_period_minutes: number;
  is_default: boolean;
  description?: string;
  staff_count?: number;
  created_at?: string;
}

export type StaffStatus = 'active' | 'inactive';

export interface Staff {
  id: number;
  staff_code: string;
  user_id?: number | null;
  full_name: string;
  position: string;
  department: string;
  contact_number?: string;
  email: string;
  shift_id: number;
  shift?: Shift;
  qr_code_token: string;
  qr_code_image?: string;
  status: StaffStatus;
  hire_date: string;
  created_at: string;
  updated_at?: string;
}

export type AttendanceStatus = 'on_time' | 'late' | 'absent' | 'time_out' | 'incomplete';

export interface AttendanceRecord {
  id: number;
  staff_id: number;
  staff_code?: string;
  staff_name?: string;
  department?: string;
  position?: string;
  shift_id: number;
  shift_name?: string;
  date: string; // YYYY-MM-DD
  time_in: string | null; // HH:MM:SS
  time_out: string | null; // HH:MM:SS
  status: AttendanceStatus;
  late_minutes: number;
  early_departure_minutes: number;
  scanned_by_user_id?: number | null;
  scanned_by_name?: string;
  scan_method: 'camera_qr' | 'manual_code' | 'system_admin';
  remarks?: string;
  created_at?: string;
}

export interface AuditLog {
  id: number;
  user_id?: number | null;
  user_name: string;
  user_role: string;
  action: string;
  description: string;
  ip_address?: string;
  created_at: string;
}

export interface SystemSettings {
  school_name: string;
  campus_name: string;
  academic_year: string;
  default_grace_period_minutes: number;
  auto_timeout_enabled: boolean;
  auto_timeout_time: string;
  scanner_sound_enabled: boolean;
  scanner_vibration_enabled: boolean;
  allow_manual_entry: boolean;
}

export interface DashboardStats {
  total_staff: number;
  present_today: number;
  late_today: number;
  absent_today: number;
  currently_in: number;
  completed_timeout: number;
  recent_scans: AttendanceRecord[];
}

export interface ScanResult {
  success: boolean;
  action: 'time_in' | 'time_out' | 'error' | 'already_completed' | 'duplicate_prevented';
  message: string;
  staff?: Staff;
  record?: AttendanceRecord;
  status?: AttendanceStatus;
  late_minutes?: number;
  timestamp: string;
}
