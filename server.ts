import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Persistent database file
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Interfaces for DB Store
interface Shift {
  id: number;
  name: string;
  start_time: string;
  end_time: string;
  grace_period_minutes: number;
  is_default: boolean;
  description: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  role: 'admin' | 'officer' | 'staff';
  full_name: string;
  is_active: boolean;
  staff_id?: number | null;
  last_login?: string;
  created_at: string;
}

interface Staff {
  id: number;
  staff_code: string;
  user_id?: number | null;
  full_name: string;
  position: string;
  department: string;
  contact_number: string;
  email: string;
  shift_id: number;
  qr_code_token: string;
  qr_code_image?: string;
  status: 'active' | 'inactive';
  hire_date: string;
  created_at: string;
}

interface Attendance {
  id: number;
  staff_id: number;
  shift_id: number;
  date: string; // YYYY-MM-DD
  time_in: string | null; // HH:MM:SS
  time_out: string | null; // HH:MM:SS
  status: 'on_time' | 'late' | 'absent' | 'time_out' | 'incomplete';
  late_minutes: number;
  early_departure_minutes: number;
  scanned_by_user_id: number | null;
  scan_method: 'camera_qr' | 'manual_code' | 'system_admin';
  remarks?: string;
  created_at: string;
  updated_at?: string;
}

interface AuditLog {
  id: number;
  user_id: number | null;
  user_name: string;
  user_role: string;
  action: string;
  description: string;
  ip_address: string;
  created_at: string;
}

interface Settings {
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

interface DatabaseSchema {
  users: User[];
  shifts: Shift[];
  staff: Staff[];
  attendance: Attendance[];
  audit_logs: AuditLog[];
  settings: Settings;
}

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Generate QR Code data URL
async function generateQRDataURL(token: string, staffCode: string, name: string): Promise<string> {
  const payload = JSON.stringify({
    institution: 'College of AU South',
    staff_code: staffCode,
    token: token,
    name: name,
    verified: true,
  });
  return QRCode.toDataURL(payload, {
    errorCorrectionLevel: 'H',
    margin: 2,
    width: 320,
    color: {
      dark: '#0B3B60', // Institutional Navy
      light: '#FFFFFF',
    },
  });
}

function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getTimeString(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

// Initial Seed Database Factory
async function createInitialDatabase(): Promise<DatabaseSchema> {
  const today = getTodayString();
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  const shifts: Shift[] = [
    {
      id: 1,
      name: 'Morning Faculty Shift',
      start_time: '07:30:00',
      end_time: '16:30:00',
      grace_period_minutes: 15,
      is_default: true,
      description: 'Standard early morning teaching shift (7:30 AM to 4:30 PM with 15-min grace)',
    },
    {
      id: 2,
      name: 'Regular Administrative Shift',
      start_time: '08:00:00',
      end_time: '17:00:00',
      grace_period_minutes: 15,
      is_default: false,
      description: 'Standard office and administrative shift (8:00 AM to 5:00 PM with 15-min grace)',
    },
    {
      id: 3,
      name: 'Afternoon / Evening Shift',
      start_time: '11:30:00',
      end_time: '20:30:00',
      grace_period_minutes: 15,
      is_default: false,
      description: 'Late schedule and evening college classes (11:30 AM to 8:30 PM with 15-min grace)',
    },
  ];

  const users: User[] = [
    {
      id: 1,
      username: 'admin',
      email: 'admin@ausouth.edu.ph',
      password_hash: hashPassword('admin123'),
      role: 'admin',
      full_name: 'Admin Director Aris Thorne',
      is_active: true,
      last_login: new Date().toISOString(),
      created_at: '2024-01-10T08:00:00.000Z',
    },
    {
      id: 2,
      username: 'officer1',
      email: 'guard.gate1@ausouth.edu.ph',
      password_hash: hashPassword('officer123'),
      role: 'officer',
      full_name: 'Officer Mateo Bautista',
      is_active: true,
      last_login: new Date().toISOString(),
      created_at: '2024-01-12T08:00:00.000Z',
    },
    {
      id: 3,
      username: 'elena.santos',
      email: 'elena.santos@ausouth.edu.ph',
      password_hash: hashPassword('teacher123'),
      role: 'staff',
      full_name: 'Dr. Elena Santos',
      is_active: true,
      staff_id: 1,
      created_at: '2024-01-15T08:00:00.000Z',
    },
    {
      id: 4,
      username: 'marcus.reyes',
      email: 'marcus.reyes@ausouth.edu.ph',
      password_hash: hashPassword('teacher123'),
      role: 'staff',
      full_name: 'Engr. Marcus Reyes',
      is_active: true,
      staff_id: 2,
      created_at: '2024-01-15T08:00:00.000Z',
    },
    {
      id: 5,
      username: 'sarah.lim',
      email: 'sarah.lim@ausouth.edu.ph',
      password_hash: hashPassword('teacher123'),
      role: 'staff',
      full_name: 'Prof. Sarah Lim',
      is_active: true,
      staff_id: 3,
      created_at: '2024-01-15T08:00:00.000Z',
    },
    {
      id: 6,
      username: 'roberto.cruz',
      email: 'roberto.cruz@ausouth.edu.ph',
      password_hash: hashPassword('teacher123'),
      role: 'staff',
      full_name: 'Dr. Roberto Cruz',
      is_active: true,
      staff_id: 4,
      created_at: '2024-01-15T08:00:00.000Z',
    },
    {
      id: 7,
      username: 'teresa.diaz',
      email: 'teresa.diaz@ausouth.edu.ph',
      password_hash: hashPassword('teacher123'),
      role: 'staff',
      full_name: 'Maria Teresa Diaz',
      is_active: true,
      staff_id: 5,
      created_at: '2024-01-15T08:00:00.000Z',
    },
  ];

  const rawStaff = [
    {
      id: 1,
      staff_code: 'AUS-2024-001',
      user_id: 3,
      full_name: 'Dr. Elena Santos',
      position: 'Dean & Professor',
      department: 'College of Computer Studies',
      contact_number: '+63 917 555 1001',
      email: 'elena.santos@ausouth.edu.ph',
      shift_id: 1,
      qr_code_token: 'AUS-QR-ES-001-A9F32',
      status: 'active' as const,
      hire_date: '2019-06-15',
      created_at: '2024-01-15T08:00:00.000Z',
    },
    {
      id: 2,
      staff_code: 'AUS-2024-002',
      user_id: 4,
      full_name: 'Engr. Marcus Reyes',
      position: 'Associate Professor',
      department: 'College of Engineering',
      contact_number: '+63 917 555 1002',
      email: 'marcus.reyes@ausouth.edu.ph',
      shift_id: 1,
      qr_code_token: 'AUS-QR-MR-002-C78B1',
      status: 'active' as const,
      hire_date: '2020-08-01',
      created_at: '2024-01-15T08:00:00.000Z',
    },
    {
      id: 3,
      staff_code: 'AUS-2024-003',
      user_id: 5,
      full_name: 'Prof. Sarah Lim',
      position: 'Department Chairperson',
      department: 'College of Nursing',
      contact_number: '+63 918 555 2003',
      email: 'sarah.lim@ausouth.edu.ph',
      shift_id: 2,
      qr_code_token: 'AUS-QR-SL-003-E41D9',
      status: 'active' as const,
      hire_date: '2018-03-10',
      created_at: '2024-01-15T08:00:00.000Z',
    },
    {
      id: 4,
      staff_code: 'AUS-2024-004',
      user_id: 6,
      full_name: 'Dr. Roberto Cruz',
      position: 'Senior Professor',
      department: 'College of Arts & Sciences',
      contact_number: '+63 920 555 3004',
      email: 'roberto.cruz@ausouth.edu.ph',
      shift_id: 2,
      qr_code_token: 'AUS-QR-RC-004-98F12',
      status: 'active' as const,
      hire_date: '2016-11-20',
      created_at: '2024-01-15T08:00:00.000Z',
    },
    {
      id: 5,
      staff_code: 'AUS-2024-005',
      user_id: 7,
      full_name: 'Maria Teresa Diaz',
      position: 'Chief Registrar',
      department: 'Administration & Records',
      contact_number: '+63 922 555 4005',
      email: 'teresa.diaz@ausouth.edu.ph',
      shift_id: 2,
      qr_code_token: 'AUS-QR-TD-005-55BA7',
      status: 'active' as const,
      hire_date: '2021-01-15',
      created_at: '2024-01-15T08:00:00.000Z',
    },
    {
      id: 6,
      staff_code: 'AUS-2024-006',
      user_id: null,
      full_name: 'David Mendoza',
      position: 'Senior Instructor',
      department: 'College of Education',
      contact_number: '+63 927 555 5006',
      email: 'david.mendoza@ausouth.edu.ph',
      shift_id: 1,
      qr_code_token: 'AUS-QR-DM-006-89EC3',
      status: 'active' as const,
      hire_date: '2022-09-01',
      created_at: '2024-01-15T08:00:00.000Z',
    },
    {
      id: 7,
      staff_code: 'AUS-2024-007',
      user_id: null,
      full_name: 'Amara Valdez',
      position: 'Department Secretary',
      department: 'College of Business',
      contact_number: '+63 930 555 6007',
      email: 'amara.valdez@ausouth.edu.ph',
      shift_id: 3,
      qr_code_token: 'AUS-QR-AV-007-42DA1',
      status: 'active' as const,
      hire_date: '2023-02-14',
      created_at: '2024-01-15T08:00:00.000Z',
    },
    {
      id: 8,
      staff_code: 'AUS-2024-008',
      user_id: null,
      full_name: 'Carlos Alcantara',
      position: 'IT Systems Specialist',
      department: 'MIS & Technical Support',
      contact_number: '+63 933 555 7008',
      email: 'carlos.alcantara@ausouth.edu.ph',
      shift_id: 1,
      qr_code_token: 'AUS-QR-CA-008-77F83',
      status: 'active' as const,
      hire_date: '2023-06-01',
      created_at: '2024-01-15T08:00:00.000Z',
    },
  ];

  // Pre-generate QR code images
  const staff: Staff[] = [];
  for (const s of rawStaff) {
    const qrImage = await generateQRDataURL(s.qr_code_token, s.staff_code, s.full_name);
    staff.push({
      ...s,
      qr_code_image: qrImage,
    });
  }

  const attendance: Attendance[] = [
    {
      id: 1,
      staff_id: 1,
      shift_id: 1,
      date: today,
      time_in: '07:22:15',
      time_out: null,
      status: 'on_time',
      late_minutes: 0,
      early_departure_minutes: 0,
      scanned_by_user_id: 2,
      scan_method: 'camera_qr',
      remarks: 'Arrived 8 mins before shift start. Status: On Time (Currently In)',
      created_at: `${today}T07:22:15.000Z`,
    },
    {
      id: 2,
      staff_id: 2,
      shift_id: 1,
      date: today,
      time_in: '07:54:30',
      time_out: null,
      status: 'late',
      late_minutes: 9,
      early_departure_minutes: 0,
      scanned_by_user_id: 2,
      scan_method: 'camera_qr',
      remarks: 'Arrived after 07:45 AM grace period. Status: Late (+9 mins)',
      created_at: `${today}T07:54:30.000Z`,
    },
    {
      id: 3,
      staff_id: 3,
      shift_id: 2,
      date: today,
      time_in: '07:50:10',
      time_out: '17:05:44',
      status: 'time_out',
      late_minutes: 0,
      early_departure_minutes: 0,
      scanned_by_user_id: 2,
      scan_method: 'camera_qr',
      remarks: 'Completed full day shift (Time-In: 07:50, Time-Out: 17:05)',
      created_at: `${today}T07:50:10.000Z`,
      updated_at: `${today}T17:05:44.000Z`,
    },
    {
      id: 4,
      staff_id: 5,
      shift_id: 2,
      date: today,
      time_in: '08:08:40',
      time_out: null,
      status: 'on_time',
      late_minutes: 0,
      early_departure_minutes: 0,
      scanned_by_user_id: 2,
      scan_method: 'manual_code',
      remarks: 'Scanned via gate backup officer. Status: On Time (Within 15-min grace)',
      created_at: `${today}T08:08:40.000Z`,
    },
    // Yesterday records
    {
      id: 5,
      staff_id: 1,
      shift_id: 1,
      date: yesterday,
      time_in: '07:28:10',
      time_out: '16:35:12',
      status: 'time_out',
      late_minutes: 0,
      early_departure_minutes: 0,
      scanned_by_user_id: 2,
      scan_method: 'camera_qr',
      remarks: 'Full attendance recorded',
      created_at: `${yesterday}T07:28:10.000Z`,
    },
    {
      id: 6,
      staff_id: 2,
      shift_id: 1,
      date: yesterday,
      time_in: '07:31:00',
      time_out: '16:32:00',
      status: 'time_out',
      late_minutes: 0,
      early_departure_minutes: 0,
      scanned_by_user_id: 2,
      scan_method: 'camera_qr',
      remarks: 'Full attendance recorded',
      created_at: `${yesterday}T07:31:00.000Z`,
    },
    {
      id: 7,
      staff_id: 4,
      shift_id: 2,
      date: yesterday,
      time_in: null,
      time_out: null,
      status: 'absent',
      late_minutes: 0,
      early_departure_minutes: 0,
      scanned_by_user_id: null,
      scan_method: 'system_admin',
      remarks: 'No Time-In recorded for scheduled workday',
      created_at: `${yesterday}T18:00:00.000Z`,
    },
  ];

  const audit_logs: AuditLog[] = [
    {
      id: 1,
      user_id: 1,
      user_name: 'Admin Director Aris Thorne',
      user_role: 'admin',
      action: 'SYSTEM_INITIALIZATION',
      description: 'AU South QR Attendance System database initialized with shifts, staff, and QR tokens',
      ip_address: '127.0.0.1',
      created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
    {
      id: 2,
      user_id: 2,
      user_name: 'Officer Mateo Bautista',
      user_role: 'officer',
      action: 'USER_LOGIN',
      description: 'Attendance Officer Mateo Bautista logged into South Gate QR Terminal',
      ip_address: '192.168.1.104',
      created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
    },
    {
      id: 3,
      user_id: 2,
      user_name: 'Officer Mateo Bautista',
      user_role: 'officer',
      action: 'QR_SCAN_TIME_IN',
      description: 'Time-In recorded for Dr. Elena Santos (AUS-2024-001) at 07:22:15. Status: ON TIME',
      ip_address: '192.168.1.104',
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: 4,
      user_id: 2,
      user_name: 'Officer Mateo Bautista',
      user_role: 'officer',
      action: 'QR_SCAN_TIME_IN',
      description: 'Time-In recorded for Engr. Marcus Reyes (AUS-2024-002) at 07:54:30. Status: LATE (+9 mins)',
      ip_address: '192.168.1.104',
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
  ];

  const settings: Settings = {
    school_name: 'College of AU South',
    campus_name: 'AU South Main Campus, Tagum City',
    academic_year: 'A.Y. 2024-2025',
    default_grace_period_minutes: 15,
    auto_timeout_enabled: false,
    auto_timeout_time: '21:00',
    scanner_sound_enabled: true,
    scanner_vibration_enabled: true,
    allow_manual_entry: true,
  };

  return {
    users,
    shifts,
    staff,
    attendance,
    audit_logs,
    settings,
  };
}

// Memory & File-sync DB Helper
let db: DatabaseSchema;

function loadDatabase(): DatabaseSchema {
  if (db) return db;
  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      db = JSON.parse(content);
      return db;
    } catch (e) {
      console.error('Error loading database, creating fresh one...', e);
    }
  }
  return db;
}

function saveDatabase() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to save database file:', e);
  }
}

// Add an audit log helper
function logAudit(
  action: string,
  description: string,
  req: Request,
  user?: { id?: number | null; full_name?: string; role?: string }
) {
  const newLog: AuditLog = {
    id: db.audit_logs.length > 0 ? Math.max(...db.audit_logs.map(l => l.id)) + 1 : 1,
    user_id: user?.id ?? null,
    user_name: user?.full_name || 'System / Terminal',
    user_role: user?.role || 'officer',
    action,
    description,
    ip_address: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1',
    created_at: new Date().toISOString(),
  };
  db.audit_logs.unshift(newLog);
  saveDatabase();
}

// Convert "HH:MM:SS" or "HH:MM" to total minutes from midnight
function timeToMinutes(timeStr: string): number {
  const parts = timeStr.split(':').map(Number);
  return parts[0] * 60 + parts[1];
}

// ============================================================
// API ROUTES
// ============================================================

// 1. Auth: Login
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username/Email and password are required' });
  }

  const user = db.users.find(
    u => (u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === username.toLowerCase())
  );

  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const inputHash = hashPassword(password);
  if (user.password_hash !== inputHash) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  if (!user.is_active) {
    return res.status(403).json({ error: 'Account is deactivated. Please contact the administrator.' });
  }

  user.last_login = new Date().toISOString();
  saveDatabase();

  logAudit('USER_LOGIN', `User ${user.full_name} (${user.username}) logged in`, req, user);

  // If staff user, fetch their staff record
  let staffRecord: Staff | undefined;
  if (user.staff_id) {
    staffRecord = db.staff.find(s => s.id === user.staff_id);
  } else if (user.role === 'staff') {
    staffRecord = db.staff.find(s => s.user_id === user.id);
  }

  const { password_hash, ...safeUser } = user;
  return res.json({
    user: safeUser,
    staff: staffRecord,
    token: `aus_session_${user.id}_${Date.now()}`,
  });
});

// 2. Auth: Change Password
app.put('/api/auth/change-password', (req: Request, res: Response) => {
  const { userId, currentPassword, newPassword } = req.body;
  const user = db.users.find(u => u.id === Number(userId));
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (hashPassword(currentPassword) !== user.password_hash) {
    return res.status(400).json({ error: 'Current password is incorrect' });
  }

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters' });
  }

  user.password_hash = hashPassword(newPassword);
  saveDatabase();

  logAudit('PASSWORD_CHANGE', `User ${user.full_name} updated their password`, req, user);
  return res.json({ success: true, message: 'Password updated successfully' });
});

// 3. Dashboard Statistics
app.get('/api/dashboard/stats', (req: Request, res: Response) => {
  const today = getTodayString();
  const totalStaff = db.staff.filter(s => s.status === 'active').length;

  const todayRecords = db.attendance.filter(a => a.date === today);

  const presentToday = todayRecords.filter(a => a.time_in !== null).length;
  const lateToday = todayRecords.filter(a => a.status === 'late').length;
  const completedTimeout = todayRecords.filter(a => a.time_out !== null).length;
  const currentlyIn = todayRecords.filter(a => a.time_in !== null && a.time_out === null).length;
  
  // Absent today = active staff with no time_in today (or explicit absent record)
  const staffWithTodayAttendance = new Set(todayRecords.filter(a => a.time_in !== null).map(a => a.staff_id));
  const absentToday = Math.max(0, totalStaff - staffWithTodayAttendance.size);

  // Format recent scans with staff and shift information
  const recentAttendance = [...todayRecords]
    .sort((a, b) => (b.time_out || b.time_in || '').localeCompare(a.time_out || a.time_in || ''))
    .slice(0, 10)
    .map(att => {
      const s = db.staff.find(st => st.id === att.staff_id);
      const sh = db.shifts.find(shi => shi.id === att.shift_id);
      return {
        ...att,
        staff_name: s ? s.full_name : 'Unknown Staff',
        staff_code: s ? s.staff_code : 'N/A',
        department: s ? s.department : 'General',
        position: s ? s.position : '',
        shift_name: sh ? sh.name : 'Standard Shift',
      };
    });

  return res.json({
    total_staff: totalStaff,
    present_today: presentToday,
    late_today: lateToday,
    absent_today: absentToday,
    currently_in: currentlyIn,
    completed_timeout: completedTimeout,
    recent_scans: recentAttendance,
    server_time: new Date().toISOString(),
    today_date: today,
  });
});

// 4. Core Attendance Scanning Pipeline (QR Token or Staff Code)
app.post('/api/attendance/scan', async (req: Request, res: Response) => {
  const { query, scanMethod = 'camera_qr', officerId, officerName } = req.body;

  if (!query || typeof query !== 'string' || !query.trim()) {
    return res.status(400).json({
      success: false,
      action: 'error',
      message: 'QR code data or Staff ID is empty.',
      timestamp: getTimeString(),
    });
  }

  const cleanQuery = query.trim();

  // Try parsing if query is a JSON string from a QR code
  let parsedToken = cleanQuery;
  let parsedCode = cleanQuery;

  try {
    if (cleanQuery.startsWith('{') && cleanQuery.endsWith('}')) {
      const parsed = JSON.parse(cleanQuery);
      if (parsed.token) parsedToken = parsed.token;
      if (parsed.staff_code) parsedCode = parsed.staff_code;
    }
  } catch (e) {
    // raw string
  }

  // Find staff by QR token, staff_code, or exact name
  const staff = db.staff.find(
    s =>
      s.qr_code_token === parsedToken ||
      s.staff_code.toLowerCase() === parsedCode.toLowerCase() ||
      s.qr_code_token === cleanQuery ||
      s.staff_code.toLowerCase() === cleanQuery.toLowerCase()
  );

  if (!staff) {
    return res.status(404).json({
      success: false,
      action: 'error',
      message: `Unrecognized QR Code or Staff ID "${cleanQuery}". Please ensure the code is valid for AU South.`,
      timestamp: getTimeString(),
    });
  }

  if (staff.status !== 'active') {
    return res.status(403).json({
      success: false,
      action: 'error',
      message: `Staff record for ${staff.full_name} (${staff.staff_code}) is currently INACTIVE. Attendance cannot be recorded.`,
      staff,
      timestamp: getTimeString(),
    });
  }

  const today = getTodayString();
  const currentTime = getTimeString();
  const currentMinutes = timeToMinutes(currentTime);

  const shift = db.shifts.find(sh => sh.id === staff.shift_id) || db.shifts[0];
  const shiftStartMinutes = timeToMinutes(shift.start_time);
  const gracePeriod = shift.grace_period_minutes || 15;
  const allowedMinutes = shiftStartMinutes + gracePeriod;

  // Check today's existing attendance record for this staff
  let record = db.attendance.find(a => a.staff_id === staff.id && a.date === today);

  // If no record exists today -> Time-In!
  if (!record) {
    const isLate = currentMinutes > allowedMinutes;
    const lateMinutes = isLate ? currentMinutes - shiftStartMinutes : 0;
    const status = isLate ? 'late' : 'on_time';

    const newId = db.attendance.length > 0 ? Math.max(...db.attendance.map(a => a.id)) + 1 : 1;

    const remarks = isLate
      ? `Time-In recorded. Late by ${lateMinutes} minutes (Grace: ${gracePeriod}m)`
      : `Time-In recorded On Time (Arrived at ${currentTime})`;

    record = {
      id: newId,
      staff_id: staff.id,
      shift_id: shift.id,
      date: today,
      time_in: currentTime,
      time_out: null,
      status,
      late_minutes: lateMinutes,
      early_departure_minutes: 0,
      scanned_by_user_id: officerId ? Number(officerId) : null,
      scan_method: scanMethod,
      remarks,
      created_at: new Date().toISOString(),
    };

    db.attendance.push(record);
    saveDatabase();

    const officerDesc = officerName ? `by ${officerName}` : 'via QR terminal';
    logAudit(
      'QR_SCAN_TIME_IN',
      `Time-In: ${staff.full_name} (${staff.staff_code}) at ${currentTime}. Status: ${status.toUpperCase()} ${isLate ? `(+${lateMinutes}m)` : ''} ${officerDesc}`,
      req,
      officerId ? { id: Number(officerId), full_name: officerName, role: 'officer' } : undefined
    );

    return res.json({
      success: true,
      action: 'time_in',
      status,
      late_minutes: lateMinutes,
      message: `Time-In successfully recorded! Welcome, ${staff.full_name}.`,
      staff: {
        ...staff,
        shift,
      },
      record,
      timestamp: currentTime,
    });
  }

  // If Time-In exists and Time-Out is NULL -> Check for Time-Out!
  if (record.time_in && !record.time_out) {
    // Duplicate scan prevention: Check if Time-In was scanned less than 30 seconds ago
    const timeInMinutes = timeToMinutes(record.time_in);
    if (Math.abs(currentMinutes - timeInMinutes) < 1 && currentTime.slice(0, 5) === record.time_in.slice(0, 5)) {
      return res.status(409).json({
        success: false,
        action: 'duplicate_prevented',
        message: `Duplicate scan prevented. Time-In was just recorded for ${staff.full_name} moments ago.`,
        staff: {
          ...staff,
          shift,
        },
        record,
        timestamp: currentTime,
      });
    }

    // Record Time-Out
    record.time_out = currentTime;
    record.status = 'time_out';
    record.updated_at = new Date().toISOString();
    record.remarks = `${record.remarks || ''} | Time-Out recorded at ${currentTime}`;

    saveDatabase();

    const officerDesc = officerName ? `by ${officerName}` : 'via QR terminal';
    logAudit(
      'QR_SCAN_TIME_OUT',
      `Time-Out: ${staff.full_name} (${staff.staff_code}) at ${currentTime}. Completed full cycle ${officerDesc}`,
      req,
      officerId ? { id: Number(officerId), full_name: officerName, role: 'officer' } : undefined
    );

    return res.json({
      success: true,
      action: 'time_out',
      status: 'time_out',
      message: `Time-Out successfully recorded! Goodbye, ${staff.full_name}. Have a great rest!`,
      staff: {
        ...staff,
        shift,
      },
      record,
      timestamp: currentTime,
    });
  }

  // If already has both Time-In and Time-Out
  return res.json({
    success: false,
    action: 'already_completed',
    message: `${staff.full_name} has already completed today's attendance cycle (In: ${record.time_in}, Out: ${record.time_out}).`,
    staff: {
      ...staff,
      shift,
    },
    record,
    timestamp: currentTime,
  });
});

// 5. Today's Attendance Feed
app.get('/api/attendance/today', (req: Request, res: Response) => {
  const today = getTodayString();
  const list = db.attendance
    .filter(a => a.date === today)
    .map(att => {
      const s = db.staff.find(st => st.id === att.staff_id);
      const sh = db.shifts.find(shi => shi.id === att.shift_id);
      return {
        ...att,
        staff_name: s ? s.full_name : 'Unknown Staff',
        staff_code: s ? s.staff_code : 'N/A',
        department: s ? s.department : 'General',
        position: s ? s.position : '',
        shift_name: sh ? sh.name : 'Shift',
      };
    })
    .sort((a, b) => (b.time_out || b.time_in || '').localeCompare(a.time_out || a.time_in || ''));

  return res.json(list);
});

// 6. Attendance History & Filtered Records
app.get('/api/attendance/records', (req: Request, res: Response) => {
  const { date, staffId, department, status, search, page = '1', limit = '50' } = req.query;

  let records = db.attendance.map(att => {
    const s = db.staff.find(st => st.id === att.staff_id);
    const sh = db.shifts.find(shi => shi.id === att.shift_id);
    return {
      ...att,
      staff_name: s ? s.full_name : 'Unknown Staff',
      staff_code: s ? s.staff_code : 'N/A',
      department: s ? s.department : 'General',
      position: s ? s.position : '',
      shift_name: sh ? sh.name : 'Shift',
    };
  });

  // Filter by date
  if (date && typeof date === 'string') {
    records = records.filter(r => r.date === date);
  }

  // Filter by staffId
  if (staffId && typeof staffId === 'string') {
    records = records.filter(r => r.staff_id === Number(staffId));
  }

  // Filter by department
  if (department && typeof department === 'string' && department !== 'ALL') {
    records = records.filter(r => r.department.toLowerCase() === department.toLowerCase());
  }

  // Filter by status
  if (status && typeof status === 'string' && status !== 'ALL') {
    records = records.filter(r => r.status.toLowerCase() === status.toLowerCase());
  }

  // Free search
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    records = records.filter(
      r =>
        r.staff_name.toLowerCase().includes(q) ||
        r.staff_code.toLowerCase().includes(q) ||
        r.department.toLowerCase().includes(q)
    );
  }

  // Sort descending by date and time
  records.sort((a, b) => {
    if (a.date !== b.date) return b.date.localeCompare(a.date);
    return (b.time_out || b.time_in || '').localeCompare(a.time_out || a.time_in || '');
  });

  const pageNum = parseInt(page as string, 10) || 1;
  const limitNum = parseInt(limit as string, 10) || 50;
  const total = records.length;
  const paginated = records.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  return res.json({
    total,
    page: pageNum,
    limit: limitNum,
    records: paginated,
  });
});

// 7. Attendance Reports
app.get('/api/attendance/reports', (req: Request, res: Response) => {
  const { type = 'daily', date = getTodayString() } = req.query;

  const records = db.attendance.map(att => {
    const s = db.staff.find(st => st.id === att.staff_id);
    const sh = db.shifts.find(shi => shi.id === att.shift_id);
    return {
      ...att,
      staff_name: s ? s.full_name : 'Unknown Staff',
      staff_code: s ? s.staff_code : 'N/A',
      department: s ? s.department : 'General',
      position: s ? s.position : '',
      shift_name: sh ? sh.name : 'Shift',
    };
  });

  // Staff summary calculation
  const staffSummary = db.staff.map(st => {
    const staffRecords = records.filter(r => r.staff_id === st.id);
    const totalPresent = staffRecords.filter(r => r.time_in !== null).length;
    const totalLate = staffRecords.filter(r => r.status === 'late').length;
    const totalTimeOut = staffRecords.filter(r => r.time_out !== null).length;
    const totalLateMinutes = staffRecords.reduce((acc, cur) => acc + (cur.late_minutes || 0), 0);

    return {
      staff_id: st.id,
      staff_code: st.staff_code,
      full_name: st.full_name,
      department: st.department,
      position: st.position,
      total_days_recorded: staffRecords.length,
      present_count: totalPresent,
      late_count: totalLate,
      timeout_count: totalTimeOut,
      total_late_minutes: totalLateMinutes,
      attendance_rate: staffRecords.length > 0 ? Math.round((totalPresent / staffRecords.length) * 100) : 100,
    };
  });

  const lateRecords = records.filter(r => r.status === 'late');
  const absentRecords = records.filter(r => r.status === 'absent');

  return res.json({
    report_type: type,
    generated_at: new Date().toISOString(),
    filter_date: date,
    total_records: records.length,
    staff_summary: staffSummary,
    late_records: lateRecords,
    absent_records: absentRecords,
    all_records: records,
  });
});

// 8. Staff Management CRUD
app.get('/api/staff', (req: Request, res: Response) => {
  const staffList = db.staff.map(s => {
    const shift = db.shifts.find(sh => sh.id === s.shift_id);
    const user = s.user_id ? db.users.find(u => u.id === s.user_id) : undefined;
    return {
      ...s,
      shift,
      username: user ? user.username : null,
    };
  });
  return res.json(staffList);
});

app.get('/api/staff/:id', (req: Request, res: Response) => {
  const staff = db.staff.find(s => s.id === Number(req.params.id));
  if (!staff) {
    return res.status(404).json({ error: 'Staff member not found' });
  }

  const shift = db.shifts.find(sh => sh.id === staff.shift_id);
  const user = staff.user_id ? db.users.find(u => u.id === staff.user_id) : undefined;
  const recentAttendance = db.attendance
    .filter(a => a.staff_id === staff.id)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 15);

  return res.json({
    ...staff,
    shift,
    user: user ? { id: user.id, username: user.username, role: user.role } : null,
    recent_attendance: recentAttendance,
  });
});

app.post('/api/staff', async (req: Request, res: Response) => {
  const {
    staff_code,
    full_name,
    position,
    department,
    contact_number,
    email,
    shift_id,
    createUser = false,
    username,
    password,
    role = 'staff',
  } = req.body;

  if (!staff_code || !full_name || !email || !shift_id) {
    return res.status(400).json({ error: 'Staff ID, Full Name, Email, and Shift are required' });
  }

  // Check unique staff_code
  if (db.staff.some(s => s.staff_code.toLowerCase() === staff_code.toLowerCase())) {
    return res.status(400).json({ error: 'Staff ID / Code already exists in the system' });
  }

  // Generate unique token
  const initials = full_name
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .slice(0, 3);
  const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
  const qrToken = `AUS-QR-${initials || 'ST'}-${Date.now().toString().slice(-4)}-${randomSuffix}`;

  const qrImage = await generateQRDataURL(qrToken, staff_code, full_name);

  let userId: number | null = null;
  if (createUser && username && password) {
    if (db.users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      return res.status(400).json({ error: 'Username is already taken' });
    }
    const newUserId = db.users.length > 0 ? Math.max(...db.users.map(u => u.id)) + 1 : 1;
    const newUser: User = {
      id: newUserId,
      username,
      email,
      password_hash: hashPassword(password),
      role: role as 'admin' | 'officer' | 'staff',
      full_name,
      is_active: true,
      created_at: new Date().toISOString(),
    };
    db.users.push(newUser);
    userId = newUserId;
  }

  const newStaffId = db.staff.length > 0 ? Math.max(...db.staff.map(s => s.id)) + 1 : 1;

  const newStaff: Staff = {
    id: newStaffId,
    staff_code,
    user_id: userId,
    full_name,
    position: position || 'Faculty Member',
    department: department || 'General',
    contact_number: contact_number || '',
    email,
    shift_id: Number(shift_id),
    qr_code_token: qrToken,
    qr_code_image: qrImage,
    status: 'active',
    hire_date: getTodayString(),
    created_at: new Date().toISOString(),
  };

  if (userId) {
    const u = db.users.find(usr => usr.id === userId);
    if (u) u.staff_id = newStaffId;
  }

  db.staff.push(newStaff);
  saveDatabase();

  logAudit(
    'STAFF_CREATE',
    `Created new staff record for ${full_name} (${staff_code}), Department: ${department}`,
    req
  );

  return res.status(201).json(newStaff);
});

app.put('/api/staff/:id', async (req: Request, res: Response) => {
  const staff = db.staff.find(s => s.id === Number(req.params.id));
  if (!staff) {
    return res.status(404).json({ error: 'Staff member not found' });
  }

  const { full_name, position, department, contact_number, email, shift_id, status } = req.body;

  if (full_name) staff.full_name = full_name;
  if (position) staff.position = position;
  if (department) staff.department = department;
  if (contact_number !== undefined) staff.contact_number = contact_number;
  if (email) staff.email = email;
  if (shift_id) staff.shift_id = Number(shift_id);
  if (status) staff.status = status;

  saveDatabase();

  logAudit(
    'STAFF_UPDATE',
    `Updated staff details for ${staff.full_name} (${staff.staff_code})`,
    req
  );

  return res.json(staff);
});

app.post('/api/staff/:id/regenerate-qr', async (req: Request, res: Response) => {
  const staff = db.staff.find(s => s.id === Number(req.params.id));
  if (!staff) {
    return res.status(404).json({ error: 'Staff member not found' });
  }

  const initials = staff.full_name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 3);
  const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
  const newQrToken = `AUS-QR-${initials}-${Date.now().toString().slice(-4)}-${randomSuffix}`;

  staff.qr_code_token = newQrToken;
  staff.qr_code_image = await generateQRDataURL(newQrToken, staff.staff_code, staff.full_name);

  saveDatabase();

  logAudit(
    'QR_GENERATE',
    `Regenerated QR Code for staff ${staff.full_name} (${staff.staff_code})`,
    req
  );

  return res.json({
    message: 'QR Code successfully regenerated',
    qr_code_token: newQrToken,
    qr_code_image: staff.qr_code_image,
  });
});

app.put('/api/staff/:id/toggle-status', (req: Request, res: Response) => {
  const staff = db.staff.find(s => s.id === Number(req.params.id));
  if (!staff) {
    return res.status(404).json({ error: 'Staff member not found' });
  }

  const newStatus = staff.status === 'active' ? 'inactive' : 'active';
  staff.status = newStatus;

  // Also toggle user if linked
  if (staff.user_id) {
    const user = db.users.find(u => u.id === staff.user_id);
    if (user) user.is_active = newStatus === 'active';
  }

  saveDatabase();

  logAudit(
    newStatus === 'inactive' ? 'STAFF_DEACTIVATE' : 'STAFF_ACTIVATE',
    `Staff ${staff.full_name} (${staff.staff_code}) status changed to ${newStatus.toUpperCase()}`,
    req
  );

  return res.json({ success: true, status: newStatus });
});

// 9. Shift Management
app.get('/api/shifts', (req: Request, res: Response) => {
  const shiftsWithCounts = db.shifts.map(sh => {
    const count = db.staff.filter(s => s.shift_id === sh.id).length;
    return {
      ...sh,
      staff_count: count,
    };
  });
  return res.json(shiftsWithCounts);
});

app.post('/api/shifts', (req: Request, res: Response) => {
  const { name, start_time, end_time, grace_period_minutes = 15, is_default = false, description = '' } = req.body;
  if (!name || !start_time || !end_time) {
    return res.status(400).json({ error: 'Shift name, start time, and end time are required' });
  }

  if (is_default) {
    db.shifts.forEach(s => (s.is_default = false));
  }

  const newShiftId = db.shifts.length > 0 ? Math.max(...db.shifts.map(s => s.id)) + 1 : 1;
  const newShift: Shift = {
    id: newShiftId,
    name,
    start_time,
    end_time,
    grace_period_minutes: Number(grace_period_minutes),
    is_default: Boolean(is_default),
    description,
  };

  db.shifts.push(newShift);
  saveDatabase();

  logAudit('SHIFT_CREATE', `Created work shift "${name}" (${start_time} - ${end_time})`, req);
  return res.status(201).json(newShift);
});

app.put('/api/shifts/:id', (req: Request, res: Response) => {
  const shift = db.shifts.find(s => s.id === Number(req.params.id));
  if (!shift) {
    return res.status(404).json({ error: 'Shift not found' });
  }

  const { name, start_time, end_time, grace_period_minutes, is_default, description } = req.body;

  if (is_default) {
    db.shifts.forEach(s => (s.is_default = false));
  }

  if (name) shift.name = name;
  if (start_time) shift.start_time = start_time;
  if (end_time) shift.end_time = end_time;
  if (grace_period_minutes !== undefined) shift.grace_period_minutes = Number(grace_period_minutes);
  if (is_default !== undefined) shift.is_default = Boolean(is_default);
  if (description !== undefined) shift.description = description;

  saveDatabase();

  logAudit('SHIFT_UPDATE', `Updated shift "${shift.name}"`, req);
  return res.json(shift);
});

app.delete('/api/shifts/:id', (req: Request, res: Response) => {
  const shiftId = Number(req.params.id);
  const assignedCount = db.staff.filter(s => s.shift_id === shiftId).length;

  if (assignedCount > 0) {
    return res.status(400).json({
      error: `Cannot delete shift: ${assignedCount} staff member(s) are assigned to this shift. Reassign them first.`,
    });
  }

  const index = db.shifts.findIndex(s => s.id === shiftId);
  if (index === -1) {
    return res.status(404).json({ error: 'Shift not found' });
  }

  const deleted = db.shifts.splice(index, 1)[0];
  saveDatabase();

  logAudit('SHIFT_DELETE', `Deleted shift "${deleted.name}"`, req);
  return res.json({ success: true, message: 'Shift deleted successfully' });
});

// 10. Audit Logs
app.get('/api/audit-logs', (req: Request, res: Response) => {
  const { action, search, limit = '100' } = req.query;

  let logs = [...db.audit_logs];

  if (action && typeof action === 'string' && action !== 'ALL') {
    logs = logs.filter(l => l.action.toLowerCase() === action.toLowerCase());
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    logs = logs.filter(
      l =>
        l.user_name.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q)
    );
  }

  const limitNum = parseInt(limit as string, 10) || 100;
  return res.json(logs.slice(0, limitNum));
});

// 11. Settings
app.get('/api/settings', (req: Request, res: Response) => {
  return res.json(db.settings);
});

app.put('/api/settings', (req: Request, res: Response) => {
  db.settings = { ...db.settings, ...req.body };
  saveDatabase();
  logAudit('SETTINGS_UPDATE', 'System operational settings updated', req);
  return res.json(db.settings);
});

// 12. Database SQL Export Endpoint
app.get('/api/database/export-sql', (req: Request, res: Response) => {
  try {
    const schemaSql = fs.readFileSync(path.join(__dirname, 'database', 'schema.sql'), 'utf-8');
    const seedSql = fs.readFileSync(path.join(__dirname, 'database', 'seed.sql'), 'utf-8');
    return res.json({
      schema_sql: schemaSql,
      seed_sql: seedSql,
    });
  } catch (e) {
    return res.status(500).json({ error: 'Could not load SQL files' });
  }
});

// Boot and mount Vite in development
async function startServer() {
  // Ensure DB is initialized
  if (!fs.existsSync(DB_FILE)) {
    console.log('Seeding initial database...');
    db = await createInitialDatabase();
    saveDatabase();
  } else {
    loadDatabase();
  }

  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`AU South QR Attendance System running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Fatal startup error:', err);
});
