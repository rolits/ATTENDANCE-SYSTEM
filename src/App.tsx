/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, Staff, AttendanceRecord } from './types';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { QRScannerPage } from './pages/QRScannerPage';
import { StaffPage } from './pages/StaffPage';
import { StaffProfilePage } from './pages/StaffProfilePage';
import { ShiftsPage } from './pages/ShiftsPage';
import { AttendanceRecordsPage } from './pages/AttendanceRecordsPage';
import { ReportsPage } from './pages/ReportsPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { SettingsPage } from './pages/SettingsPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { QRCodeModal } from './components/QRCodeModal';
import { Menu } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('aus_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activePage, setActivePage] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [badgeModalStaff, setBadgeModalStaff] = useState<Staff | null>(null);
  const [viewProfileStaffId, setViewProfileStaffId] = useState<number | null>(null);

  // If role is staff, set default active page to profile or records
  useEffect(() => {
    if (currentUser?.role === 'staff' && (activePage === 'staff' || activePage === 'shifts' || activePage === 'reports' || activePage === 'audit' || activePage === 'settings')) {
      setActivePage('profile');
    }
  }, [currentUser, activePage]);

  const handleLoginSuccess = (user: User, staff?: Staff) => {
    setCurrentUser(user);
    localStorage.setItem('aus_user', JSON.stringify(user));
    if (user.role === 'officer') {
      setActivePage('scanner');
    } else if (user.role === 'staff') {
      setActivePage('profile');
    } else {
      setActivePage('dashboard');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('aus_user');
    setActivePage('dashboard');
    setBadgeModalStaff(null);
    setViewProfileStaffId(null);
  };

  const handleNavigate = (page: string) => {
    setActivePage(page);
    setViewProfileStaffId(null);
  };

  const handleViewStaffProfile = (staff: Staff) => {
    setViewProfileStaffId(staff.id);
    setActivePage('staff_profile_view');
  };

  if (!currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        onLogout={handleLogout}
        onNavigate={handleNavigate}
        activePage={activePage}
      />

      <div className="flex flex-1 relative">
        {/* Mobile Sidebar Hamburger Toggle */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed bottom-4 right-4 z-40 p-3 rounded-full bg-[#0B3B60] text-white shadow-xl hover:bg-[#07243c] transition-transform active:scale-95 no-print"
          title="Open Menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Sidebar Navigation */}
        <Sidebar
          currentUser={currentUser}
          activePage={activePage}
          onNavigate={handleNavigate}
          isOpen={sidebarOpen}
          onCloseMobile={() => setSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 lg:pl-64 p-4 lg:p-8 max-w-7xl w-full mx-auto pb-16">
          {activePage === 'dashboard' && (
            <DashboardPage
              onNavigate={handleNavigate}
              onOpenQRBadge={(rec: AttendanceRecord) => {
                // look up staff
                fetch(`/api/staff/${rec.staff_id}`)
                  .then(r => r.json())
                  .then(data => setBadgeModalStaff(data))
                  .catch(console.error);
              }}
            />
          )}

          {activePage === 'scanner' && (
            <QRScannerPage
              currentUser={currentUser}
              onOpenQRBadge={(staff: Staff) => setBadgeModalStaff(staff)}
            />
          )}

          {activePage === 'staff' && (
            <StaffPage
              onOpenQRBadge={(staff: Staff) => setBadgeModalStaff(staff)}
              onViewProfile={handleViewStaffProfile}
            />
          )}

          {activePage === 'staff_profile_view' && (
            <StaffProfilePage
              staffId={viewProfileStaffId}
              currentUser={currentUser}
              onBack={() => setActivePage('staff')}
              onOpenQRBadge={(staff: Staff) => setBadgeModalStaff(staff)}
            />
          )}

          {activePage === 'shifts' && <ShiftsPage />}

          {activePage === 'records' && (
            <AttendanceRecordsPage currentUser={currentUser} />
          )}

          {activePage === 'reports' && <ReportsPage />}

          {activePage === 'audit' && <AuditLogsPage />}

          {activePage === 'settings' && <SettingsPage />}

          {activePage === 'profile' && (
            <UserProfilePage
              currentUser={currentUser}
              onOpenQRBadge={(staff: Staff) => setBadgeModalStaff(staff)}
            />
          )}
        </main>
      </div>

      {/* Global QR Code ID Badge Modal */}
      <QRCodeModal
        staff={badgeModalStaff}
        onClose={() => setBadgeModalStaff(null)}
        onTestScan={(code: string) => {
          setActivePage('scanner');
          // Dispatch custom event or let scanner load
        }}
      />
    </div>
  );
}
