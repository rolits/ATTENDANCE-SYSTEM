import React, { useState } from 'react';
import { AUSouthLogo } from '../components/AUSouthLogo';
import { Eye, EyeOff, Lock, User as UserIcon, Shield, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { User, Staff } from '../types';

interface LoginPageProps {
  onLoginSuccess: (user: User, staff?: Staff) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to authenticate');
      }

      onLoginSuccess(data.user, data.staff);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#0B3B60] to-slate-900 flex flex-col justify-center items-center p-4">
      {/* Background Decorative Circles */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-[#0B3B60] to-[#07243c] p-6 text-white text-center border-b-4 border-amber-400">
            <div className="flex justify-center mb-3">
              <AUSouthLogo size="lg" lightMode showText={false} />
            </div>
            <h1 className="text-xl font-extrabold tracking-tight">COLLEGE OF AU SOUTH</h1>
            <p className="text-amber-300 font-semibold text-xs tracking-wider uppercase mt-1">
              QR Attendance Management System
            </p>
            <p className="text-slate-300 text-[11px] mt-1">
              Authorized Personnel, Faculty & Administration Portal
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Username or Institutional Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#0B3B60] focus:border-transparent transition-all"
                  placeholder="admin or username@ausouth.edu.ph"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#0B3B60] focus:border-transparent transition-all"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="rounded text-[#0B3B60] focus:ring-[#0B3B60]"
                />
                <span>Remember this workstation</span>
              </label>
              <span className="text-[#0B3B60] font-semibold text-[11px] hover:underline cursor-pointer">
                Forgot password?
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-[#0B3B60] hover:bg-[#07243c] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#0B3B60]/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <span>Authenticating Credentials...</span>
              ) : (
                <>
                  <span>Sign In to AU South Portal</span>
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Test Logins */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Quick Demo Test Accounts</span>
              <Shield className="w-3.5 h-3.5 text-[#0B3B60]" />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin', 'admin123')}
                className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition-all ${
                  username === 'admin'
                    ? 'bg-purple-50 border-purple-300 text-purple-700 ring-1 ring-purple-300'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Administrator
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('officer1', 'officer123')}
                className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition-all ${
                  username === 'officer1'
                    ? 'bg-blue-50 border-blue-300 text-blue-700 ring-1 ring-blue-300'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Gate Officer
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('elena.santos', 'teacher123')}
                className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition-all ${
                  username === 'elena.santos'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700 ring-1 ring-emerald-300'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Teacher (Dean)
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-4 text-center text-slate-400 text-xs flex items-center justify-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
          <span>College of AU South • Secure QR Attendance System</span>
        </div>
      </div>
    </div>
  );
};
