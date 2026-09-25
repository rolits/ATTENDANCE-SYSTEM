import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Database,
  Save,
  Download,
  CheckCircle2,
  Code,
  BookOpen,
  Volume2,
  Clock,
  Shield,
} from 'lucide-react';
import { SystemSettings } from '../types';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings>({
    school_name: 'College of AU South',
    campus_name: 'AU South Main Campus, Tagum City',
    academic_year: 'A.Y. 2024-2025',
    default_grace_period_minutes: 15,
    auto_timeout_enabled: false,
    auto_timeout_time: '21:00',
    scanner_sound_enabled: true,
    scanner_vibration_enabled: true,
    allow_manual_entry: true,
  });

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [sqlSchema, setSqlSchema] = useState('');
  const [sqlSeed, setSqlSeed] = useState('');
  const [activeTab, setActiveTab] = useState<'general' | 'database_guide' | 'sql_scripts'>('general');

  useEffect(() => {
    // Fetch settings
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(console.error);

    // Fetch SQL scripts
    fetch('/api/database/export-sql')
      .then(res => res.json())
      .then(data => {
        setSqlSchema(data.schema_sql || '');
        setSqlSeed(data.seed_sql || '');
      })
      .catch(console.error);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (e) {
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadSQL = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/sql;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-[#0B3B60]" />
            <h1 className="text-xl font-black text-slate-800 tracking-tight">
              System Settings & MySQL Database
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure institutional parameters, scanner audio alerts, and access complete MySQL database deployment assets.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'general' ? 'bg-white text-[#0B3B60] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            General Configuration
          </button>
          <button
            onClick={() => setActiveTab('database_guide')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'database_guide' ? 'bg-white text-[#0B3B60] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            MySQL Deployment Guide
          </button>
          <button
            onClick={() => setActiveTab('sql_scripts')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'sql_scripts' ? 'bg-white text-[#0B3B60] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            SQL Scripts
          </button>
        </div>
      </div>

      {/* TAB 1: GENERAL CONFIGURATION */}
      {activeTab === 'general' && (
        <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          {saveSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Settings saved and applied successfully across all terminals!</span>
            </div>
          )}

          <div>
            <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#0B3B60]" />
              <span>Institutional Identity</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Institution Name</label>
                <input
                  type="text"
                  value={settings.school_name}
                  onChange={e => setSettings({ ...settings, school_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#0B3B60]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Campus Location</label>
                <input
                  type="text"
                  value={settings.campus_name}
                  onChange={e => setSettings({ ...settings, campus_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#0B3B60]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Academic Year</label>
                <input
                  type="text"
                  value={settings.academic_year}
                  onChange={e => setSettings({ ...settings, academic_year: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#0B3B60]"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#0B3B60]" />
              <span>Attendance & Grace Period Rules</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Default Grace Period (Minutes)
                </label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={settings.default_grace_period_minutes}
                  onChange={e =>
                    setSettings({
                      ...settings,
                      default_grace_period_minutes: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#0B3B60]"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Time-In scans completed within this window after shift start will be flagged as On Time.
                </p>
              </div>

              <div className="space-y-2 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.scanner_sound_enabled}
                    onChange={e =>
                      setSettings({
                        ...settings,
                        scanner_sound_enabled: e.target.checked,
                      })
                    }
                    className="rounded text-[#0B3B60]"
                  />
                  <span className="font-bold text-slate-800">
                    Enable Sound Feedback (Web Audio Synthesizer)
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.allow_manual_entry}
                    onChange={e =>
                      setSettings({
                        ...settings,
                        allow_manual_entry: e.target.checked,
                      })
                    }
                    className="rounded text-[#0B3B60]"
                  />
                  <span className="font-bold text-slate-800">
                    Allow Manual Staff ID Entry as Scanner Backup
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#0B3B60] hover:bg-[#07243c] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4 text-amber-300" />
              <span>{saving ? 'Saving...' : 'Save System Settings'}</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: MYSQL DEPLOYMENT GUIDE */}
      {activeTab === 'database_guide' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-[#0B3B60]" />
              <h2 className="text-base font-black text-slate-800">
                MySQL Relational Database Setup Guide
              </h2>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-100 text-slate-700">
              MySQL 8.0+ / MariaDB
            </span>
          </div>

          <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <h3 className="font-bold text-slate-900 text-sm">
                1. Installing the Project
              </h3>
              <p>Clone the codebase and install all dependencies:</p>
              <pre className="p-3 bg-slate-900 text-amber-300 rounded-lg font-mono text-[11px] overflow-x-auto">
                git clone &lt;repo-url&gt;{'\n'}
                cd au-south-qr-attendance{'\n'}
                npm install
              </pre>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <h3 className="font-bold text-slate-900 text-sm">
                2. Creating the MySQL Database
              </h3>
              <p>Import the relational schema and seed test data:</p>
              <pre className="p-3 bg-slate-900 text-amber-300 rounded-lg font-mono text-[11px] overflow-x-auto">
                mysql -u root -p &lt; database/schema.sql{'\n'}
                mysql -u root -p &lt; database/seed.sql
              </pre>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <h3 className="font-bold text-slate-900 text-sm">
                3. Configuring Database Connection
              </h3>
              <p>Set up your environment variables in <code className="font-mono bg-slate-200 px-1 rounded">.env</code>:</p>
              <pre className="p-3 bg-slate-900 text-amber-300 rounded-lg font-mono text-[11px] overflow-x-auto">
                PORT=3000{'\n'}
                DB_HOST=localhost{'\n'}
                DB_USER=root{'\n'}
                DB_PASSWORD=your_password{'\n'}
                DB_NAME=au_south_attendance
              </pre>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <h3 className="font-bold text-slate-900 text-sm">
                4. Running the Website
              </h3>
              <pre className="p-3 bg-slate-900 text-amber-300 rounded-lg font-mono text-[11px] overflow-x-auto">
                npm run dev
              </pre>
              <p>Access the portal in your browser at <strong>http://localhost:3000</strong>.</p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <h3 className="font-bold text-slate-900 text-sm">
                5. Creating Administrator Account & Registering Staff
              </h3>
              <ul className="list-disc list-inside space-y-1 text-slate-600">
                <li>Default Admin: <strong>admin</strong> / password: <strong>admin123</strong></li>
                <li>Default Officer: <strong>officer1</strong> / password: <strong>officer123</strong></li>
                <li>Default Teacher: <strong>elena.santos</strong> / password: <strong>teacher123</strong></li>
                <li>Go to <strong>Staff Management &gt; + Add Staff Member</strong> to register new teachers, assign shifts, and auto-generate institutional QR codes.</li>
                <li>Open <strong>QR Scanner Terminal</strong> to test Time-In and Time-Out recording with instant duplicate prevention.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SQL SCRIPTS */}
      {activeTab === 'sql_scripts' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-black text-sm text-slate-900">
                  Database Schema (database/schema.sql)
                </h3>
                <p className="text-xs text-slate-500">
                  Complete DDL creating shifts, users, staff, qr_codes, attendance, and audit_logs tables.
                </p>
              </div>
              <button
                onClick={() => handleDownloadSQL('schema.sql', sqlSchema)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0B3B60] text-white text-xs font-bold hover:bg-[#07243c] cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download schema.sql</span>
              </button>
            </div>

            <pre className="p-4 bg-slate-950 text-slate-200 rounded-xl font-mono text-[11px] max-h-72 overflow-y-auto leading-relaxed border border-slate-800">
              {sqlSchema || '-- Loading schema.sql...'}
            </pre>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-black text-sm text-slate-900">
                  Sample Data Seed (database/seed.sql)
                </h3>
                <p className="text-xs text-slate-500">
                  Includes admin, officer, and faculty accounts, pre-generated shifts, QR tokens, and test attendance.
                </p>
              </div>
              <button
                onClick={() => handleDownloadSQL('seed.sql', sqlSeed)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0B3B60] text-white text-xs font-bold hover:bg-[#07243c] cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download seed.sql</span>
              </button>
            </div>

            <pre className="p-4 bg-slate-950 text-slate-200 rounded-xl font-mono text-[11px] max-h-72 overflow-y-auto leading-relaxed border border-slate-800">
              {sqlSeed || '-- Loading seed.sql...'}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
