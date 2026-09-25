import React, { useState, useEffect, useRef, useCallback } from 'react';
import jsQR from 'jsqr';
import {
  Camera,
  CameraOff,
  SwitchCamera,
  Keyboard,
  Volume2,
  VolumeX,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  User,
  Building,
  Briefcase,
  History,
  Send,
  Zap,
} from 'lucide-react';
import { Staff, ScanResult, AttendanceRecord, User as AuthUser } from '../types';
import { sounds } from '../utils/audio';

interface QRScannerPageProps {
  currentUser: AuthUser | null;
  onOpenQRBadge?: (staff: Staff) => void;
}

export const QRScannerPage: React.FC<QRScannerPageProps> = ({
  currentUser,
}) => {
  // Scanner state
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [manualCode, setManualCode] = useState('');
  const [processing, setProcessing] = useState(false);
  const [recentScanResult, setRecentScanResult] = useState<ScanResult | null>(null);
  const [todayScans, setTodayScans] = useState<AttendanceRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'camera' | 'manual'>('camera');
  const [sampleStaffList, setSampleStaffList] = useState<Staff[]>([]);

  // Refs for video & canvas
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const lastScannedTime = useRef<number>(0);
  const lastScannedCode = useRef<string>('');

  // Fetch today's scans and sample staff for quick manual select
  const fetchTodayScans = useCallback(async () => {
    try {
      const res = await fetch('/api/attendance/today');
      if (res.ok) {
        const data = await res.json();
        setTodayScans(data);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const fetchStaffList = useCallback(async () => {
    try {
      const res = await fetch('/api/staff');
      if (res.ok) {
        const data = await res.json();
        setSampleStaffList(data);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    fetchTodayScans();
    fetchStaffList();
  }, [fetchTodayScans, fetchStaffList]);

  // Execute scan against backend API
  const handleProcessScan = useCallback(async (query: string, method: 'camera_qr' | 'manual_code') => {
    if (processing) return;
    setProcessing(true);

    try {
      const res = await fetch('/api/attendance/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          scanMethod: method,
          officerId: currentUser?.id,
          officerName: currentUser?.full_name,
        }),
      });

      const data: ScanResult = await res.json();

      if (res.ok && data.success) {
        if (soundEnabled) {
          if (data.action === 'time_out') {
            sounds.playTimeOut();
          } else {
            sounds.playSuccess();
          }
        }
        setRecentScanResult(data);
        fetchTodayScans();
      } else {
        if (soundEnabled) {
          sounds.playError();
        }
        setRecentScanResult({
          success: false,
          action: data.action || 'error',
          message: data.message || 'Scan failed or unauthorized.',
          staff: data.staff,
          record: data.record,
          timestamp: new Date().toLocaleTimeString(),
        });
      }
    } catch (err: unknown) {
      if (soundEnabled) sounds.playError();
      setRecentScanResult({
        success: false,
        action: 'error',
        message: err instanceof Error ? err.message : 'Server error occurred during scan.',
        timestamp: new Date().toLocaleTimeString(),
      });
    } finally {
      setProcessing(false);
    }
  }, [processing, currentUser, soundEnabled, fetchTodayScans]);

  // Camera video frame scanner loop
  const scanFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !cameraActive) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });

      if (code && code.data) {
        const now = Date.now();
        // Debounce same QR scan within 4 seconds
        if (code.data !== lastScannedCode.current || now - lastScannedTime.current > 4000) {
          lastScannedCode.current = code.data;
          lastScannedTime.current = now;
          handleProcessScan(code.data, 'camera_qr');
        }
      }
    }

    animationFrameId.current = requestAnimationFrame(scanFrame);
  }, [cameraActive, handleProcessScan]);

  // Start Camera
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', 'true');
          await videoRef.current.play();
          setCameraActive(true);
        }
      } else {
        setCameraError('Camera API is not supported in this browser environment.');
      }
    } catch (err: unknown) {
      console.warn('Camera access issue:', err);
      setCameraError('Camera access unavailable. Please use the Manual Staff Code input tab.');
      setCameraActive(false);
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (activeTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [activeTab, facingMode]);

  useEffect(() => {
    if (cameraActive) {
      animationFrameId.current = requestAnimationFrame(scanFrame);
    }
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [cameraActive, scanFrame]);

  const toggleFacingMode = () => {
    stopCamera();
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'));
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleProcessScan(manualCode.trim(), 'manual_code');
    setManualCode('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 rounded-2xl p-5 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-slate-800 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <h1 className="text-xl font-black tracking-tight text-white">
              AU South QR Scanner Terminal
            </h1>
          </div>
          <p className="text-slate-400 text-xs mt-1">
            Real-time optical scanner & manual backup terminal for College of AU South faculty & staff.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              soundEnabled
                ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
            title={soundEnabled ? 'Mute Audio Chime' : 'Enable Audio Chime'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="text-[11px] hidden sm:inline">{soundEnabled ? 'Sound On' : 'Muted'}</span>
          </button>

          {/* Mode Switch Tabs */}
          <div className="flex p-1 bg-slate-800 rounded-xl border border-slate-700">
            <button
              onClick={() => setActiveTab('camera')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'camera'
                  ? 'bg-[#0B3B60] text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Camera</span>
            </button>
            <button
              onClick={() => setActiveTab('manual')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'manual'
                  ? 'bg-[#0B3B60] text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Keyboard className="w-3.5 h-3.5" />
              <span>Manual Entry</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Scanner Viewport & Scan Result Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Viewport / Manual (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {activeTab === 'camera' ? (
              <div className="relative aspect-4/3 sm:aspect-16/10 bg-slate-950 flex items-center justify-center overflow-hidden">
                {/* Video Element */}
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                  muted
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Viewfinder Overlay with Animated Laser */}
                {cameraActive && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="relative w-64 h-64 sm:w-72 sm:h-72 border-2 border-amber-400/80 rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]">
                      {/* Viewfinder Target Corners */}
                      <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-amber-400 rounded-tl-lg" />
                      <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-amber-400 rounded-tr-lg" />
                      <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-amber-400 rounded-bl-lg" />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-amber-400 rounded-br-lg" />

                      {/* Laser Line */}
                      <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_8px_#ef4444] animate-scan-laser" />

                      <div className="absolute -bottom-8 inset-x-0 text-center">
                        <span className="text-[11px] font-bold text-white bg-slate-900/80 px-2.5 py-1 rounded-full uppercase tracking-wider border border-amber-400/40">
                          Align QR Code in Center
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Camera Fallback / Error State */}
                {cameraError && (
                  <div className="absolute inset-0 bg-slate-900/90 text-white flex flex-col items-center justify-center p-6 text-center">
                    <CameraOff className="w-12 h-12 text-rose-400 mb-3" />
                    <p className="text-sm font-bold text-slate-100">{cameraError}</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm">
                      You can click below to switch to the Manual Entry mode, or choose any test staff from the quick list.
                    </p>
                    <button
                      onClick={() => setActiveTab('manual')}
                      className="mt-4 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors"
                    >
                      Switch to Manual Entry
                    </button>
                  </div>
                )}

                {/* Camera Action Overlay */}
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  <button
                    onClick={toggleFacingMode}
                    className="p-2 rounded-xl bg-slate-900/80 text-white hover:bg-slate-800 transition-colors border border-white/10 shadow-sm"
                    title="Switch Front/Back Camera"
                  >
                    <SwitchCamera className="w-4 h-4 text-amber-400" />
                  </button>
                </div>
              </div>
            ) : (
              /* Manual Input Tab */
              <div className="p-6 space-y-5">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                  <Keyboard className="w-4 h-4 text-[#0B3B60]" />
                  <span>Manual Staff ID / Backup Scan</span>
                </div>
                <p className="text-xs text-slate-500">
                  Enter the staff member&apos;s unique ID (e.g. AUS-2024-001) or high-entropy QR token if the camera cannot read the badge.
                </p>

                <form onSubmit={handleManualSubmit} className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={manualCode}
                      onChange={e => setManualCode(e.target.value)}
                      placeholder="e.g. AUS-2024-001 or AUS-QR-ES-001-A9F32"
                      className="flex-1 px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#0B3B60] font-mono"
                    />
                    <button
                      type="submit"
                      disabled={processing || !manualCode.trim()}
                      className="px-5 py-2.5 rounded-xl bg-[#0B3B60] hover:bg-[#07243c] text-white font-bold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5 text-amber-300" />
                      <span>Scan Code</span>
                    </button>
                  </div>
                </form>

                {/* Quick Staff Fast-Click Picker */}
                <div className="pt-3 border-t border-slate-200">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center justify-between">
                    <span>Quick Select Active Faculty / Staff</span>
                    <Zap className="w-3 h-3 text-amber-500" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                    {sampleStaffList.map(s => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => handleProcessScan(s.staff_code, 'manual_code')}
                        disabled={processing}
                        className="text-left p-2.5 rounded-xl border border-slate-200 hover:border-[#0B3B60] hover:bg-blue-50/50 transition-all flex items-center justify-between text-xs group cursor-pointer"
                      >
                        <div>
                          <div className="font-bold text-slate-800 group-hover:text-[#0B3B60]">
                            {s.full_name}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {s.staff_code} • {s.department}
                          </div>
                        </div>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 group-hover:bg-[#0B3B60] group-hover:text-white transition-colors">
                          Scan
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Status Ticker */}
            <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Terminal Ready: South Gate Gatekeeper Station
              </span>
              <span className="font-mono text-[11px] text-slate-600">
                Auto Time-In / Time-Out Enabled
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Instant Scan Verification Card (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 overflow-hidden">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center justify-between">
              <span>Scan Identification Result</span>
              {processing && (
                <span className="text-xs font-bold text-[#0B3B60] animate-pulse">
                  Verifying...
                </span>
              )}
            </div>

            {recentScanResult ? (
              <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                {/* Status Notice Banner */}
                <div
                  className={`p-3.5 rounded-xl border flex items-start gap-2.5 ${
                    recentScanResult.success
                      ? recentScanResult.action === 'time_out'
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-900'
                        : recentScanResult.status === 'late'
                        ? 'bg-amber-50 border-amber-200 text-amber-900'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : recentScanResult.action === 'duplicate_prevented'
                      ? 'bg-amber-50 border-amber-200 text-amber-900'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}
                >
                  {recentScanResult.success ? (
                    <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
                  ) : recentScanResult.action === 'duplicate_prevented' ? (
                    <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
                  )}
                  <div>
                    <h3 className="font-bold text-xs uppercase tracking-wider">
                      {recentScanResult.action === 'time_in'
                        ? 'TIME-IN RECORDED'
                        : recentScanResult.action === 'time_out'
                        ? 'TIME-OUT RECORDED'
                        : recentScanResult.action === 'duplicate_prevented'
                        ? 'DUPLICATE SCAN PREVENTED'
                        : recentScanResult.action === 'already_completed'
                        ? 'DAILY CYCLE COMPLETED'
                        : 'SCAN ERROR'}
                    </h3>
                    <p className="text-xs mt-0.5 leading-relaxed">
                      {recentScanResult.message}
                    </p>
                  </div>
                </div>

                {/* Staff Member Verified Profile */}
                {recentScanResult.staff && (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-[#0B3B60] text-amber-400 font-black text-base flex items-center justify-center shadow-xs">
                        {recentScanResult.staff.full_name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 leading-tight">
                          {recentScanResult.staff.full_name}
                        </h4>
                        <div className="font-mono text-xs font-semibold text-[#0B3B60]">
                          {recentScanResult.staff.staff_code}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-200">
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase">Department</span>
                        <span className="font-semibold text-slate-800 truncate block">
                          {recentScanResult.staff.department}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase">Position</span>
                        <span className="font-semibold text-slate-800 truncate block">
                          {recentScanResult.staff.position}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase">Time Recorded</span>
                        <span className="font-mono font-bold text-slate-900 block">
                          {recentScanResult.timestamp}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase">Compliance</span>
                        <span className="font-bold text-slate-800 block">
                          {recentScanResult.status === 'on_time' && (
                            <span className="text-emerald-700">On Time</span>
                          )}
                          {recentScanResult.status === 'late' && (
                            <span className="text-amber-700">Late (+{recentScanResult.late_minutes}m)</span>
                          )}
                          {recentScanResult.status === 'time_out' && (
                            <span className="text-indigo-700">Time-Out Completed</span>
                          )}
                          {!recentScanResult.status && 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Awaiting Scan Placeholder */
              <div className="py-12 px-4 text-center border-2 border-dashed border-slate-200 rounded-xl">
                <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-600">Awaiting QR Badge Scan</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
                  Hold a teacher or staff QR code in front of the camera or enter their staff ID to instantly record attendance.
                </p>
              </div>
            )}
          </div>

          {/* Quick Rules Info Card */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 text-xs space-y-2">
            <h4 className="font-bold text-slate-700 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-[#0B3B60]" />
              <span>AU South Attendance Rules</span>
            </h4>
            <ul className="space-y-1 text-[11px] text-slate-600 list-disc list-inside">
              <li>
                <strong>Time-In:</strong> Scanned arrival. 15-minute grace period applied automatically.
              </li>
              <li>
                <strong>Time-Out:</strong> Second scan of the day records departure.
              </li>
              <li>
                <strong>Duplicate Prevention:</strong> Scans within 30 seconds are safely ignored.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Today's Scanned Log Feed Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[#0B3B60]" />
            <h3 className="font-bold text-sm text-slate-800">
              Terminal Scan Log (Today&apos;s Stream)
            </h3>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {todayScans.length} Scans Today
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-4">Staff Member</th>
                <th className="py-2.5 px-4">Department</th>
                <th className="py-2.5 px-4 text-center">Time-In</th>
                <th className="py-2.5 px-4 text-center">Time-Out</th>
                <th className="py-2.5 px-4 text-center">Status</th>
                <th className="py-2.5 px-4">Scan Method</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {todayScans.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400 text-xs">
                    No scans recorded yet today.
                  </td>
                </tr>
              ) : (
                todayScans.slice(0, 10).map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-4 font-bold text-slate-900">
                      <div>{item.staff_name}</div>
                      <div className="font-mono text-[10px] text-slate-400">{item.staff_code}</div>
                    </td>
                    <td className="py-2.5 px-4 text-slate-600">{item.department}</td>
                    <td className="py-2.5 px-4 text-center font-mono font-bold text-emerald-700">
                      {item.time_in || '--:--'}
                    </td>
                    <td className="py-2.5 px-4 text-center font-mono font-bold text-indigo-700">
                      {item.time_out || (
                        <span className="text-amber-600 text-[10px] font-normal italic">
                          On Duty
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.status === 'on_time'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'late'
                            ? 'bg-amber-100 text-amber-800'
                            : item.status === 'time_out'
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {item.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-mono text-[10px] text-slate-500 uppercase">
                      {item.scan_method === 'camera_qr' ? 'Camera QR' : 'Manual Code'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
