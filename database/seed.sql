-- ============================================================
-- AU South QR Attendance System - Seed Data
-- College of AU South Initial Data & Demo Test Accounts
-- ============================================================

USE `au_south_attendance`;

-- ------------------------------------------------------------
-- Shifts
-- ------------------------------------------------------------
INSERT INTO `shifts` (`id`, `name`, `start_time`, `end_time`, `grace_period_minutes`, `is_default`, `description`) VALUES
(1, 'Morning Faculty Shift', '07:30:00', '16:30:00', 15, 1, 'Standard early morning teaching shift (7:30 AM to 4:30 PM with 15-min grace)'),
(2, 'Regular Administrative Shift', '08:00:00', '17:00:00', 15, 0, 'Standard office and administrative shift (8:00 AM to 5:00 PM with 15-min grace)'),
(3, 'Afternoon/Evening Shift', '11:30:00', '20:30:00', 15, 0, 'Late schedule and evening college classes (11:30 AM to 8:30 PM with 15-min grace)');

-- ------------------------------------------------------------
-- Users
-- Password hashes (SHA-256 for demo standard; bcrypt compatible)
-- 'admin123'    -> 240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9
-- 'officer123'  -> e98a83427303e839e25d2c6767fd621ec896c221ceee0a1f77d853c82d326f95
-- 'teacher123'  -> a49c5859d57fb40b2bc65476ce1e98d9bf0ea3e2ff507efbc5381f8040bc1d30
-- ------------------------------------------------------------
INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `role`, `full_name`, `is_active`, `last_login`) VALUES
(1, 'admin', 'admin@ausouth.edu.ph', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'admin', 'Admin Director Aris Thorne', 1, NOW()),
(2, 'officer1', 'guard.gate1@ausouth.edu.ph', 'e98a83427303e839e25d2c6767fd621ec896c221ceee0a1f77d853c82d326f95', 'officer', 'Officer Mateo Bautista', 1, NOW()),
(3, 'elena.santos', 'elena.santos@ausouth.edu.ph', 'a49c5859d57fb40b2bc65476ce1e98d9bf0ea3e2ff507efbc5381f8040bc1d30', 'staff', 'Dr. Elena Santos', 1, NOW()),
(4, 'marcus.reyes', 'marcus.reyes@ausouth.edu.ph', 'a49c5859d57fb40b2bc65476ce1e98d9bf0ea3e2ff507efbc5381f8040bc1d30', 'staff', 'Engr. Marcus Reyes', 1, NOW()),
(5, 'sarah.lim', 'sarah.lim@ausouth.edu.ph', 'a49c5859d57fb40b2bc65476ce1e98d9bf0ea3e2ff507efbc5381f8040bc1d30', 'staff', 'Prof. Sarah Lim', 1, NOW()),
(6, 'roberto.cruz', 'roberto.cruz@ausouth.edu.ph', 'a49c5859d57fb40b2bc65476ce1e98d9bf0ea3e2ff507efbc5381f8040bc1d30', 'staff', 'Dr. Roberto Cruz', 1, NOW()),
(7, 'teresa.diaz', 'teresa.diaz@ausouth.edu.ph', 'a49c5859d57fb40b2bc65476ce1e98d9bf0ea3e2ff507efbc5381f8040bc1d30', 'staff', 'Maria Teresa Diaz', 1, NOW()),
(8, 'david.mendoza', 'david.mendoza@ausouth.edu.ph', 'a49c5859d57fb40b2bc65476ce1e98d9bf0ea3e2ff507efbc5381f8040bc1d30', 'staff', 'David Mendoza', 1, NOW());

-- ------------------------------------------------------------
-- Staff
-- ------------------------------------------------------------
INSERT INTO `staff` (`id`, `staff_code`, `user_id`, `full_name`, `position`, `department`, `contact_number`, `email`, `shift_id`, `qr_code_token`, `status`, `hire_date`) VALUES
(1, 'AUS-2024-001', 3, 'Dr. Elena Santos', 'Dean & Professor', 'College of Computer Studies', '+63 917 555 1001', 'elena.santos@ausouth.edu.ph', 1, 'AUS-QR-ES-001-A9F32', 'active', '2019-06-15'),
(2, 'AUS-2024-002', 4, 'Engr. Marcus Reyes', 'Associate Professor', 'College of Engineering', '+63 917 555 1002', 'marcus.reyes@ausouth.edu.ph', 1, 'AUS-QR-MR-002-C78B1', 'active', '2020-08-01'),
(3, 'AUS-2024-003', 5, 'Prof. Sarah Lim', 'Department Chairperson', 'College of Nursing', '+63 918 555 2003', 'sarah.lim@ausouth.edu.ph', 2, 'AUS-QR-SL-003-E41D9', 'active', '2018-03-10'),
(4, 'AUS-2024-004', 6, 'Dr. Roberto Cruz', 'Senior Professor', 'College of Arts & Sciences', '+63 920 555 3004', 'roberto.cruz@ausouth.edu.ph', 2, 'AUS-QR-RC-004-98F12', 'active', '2016-11-20'),
(5, 'AUS-2024-005', 7, 'Maria Teresa Diaz', 'Chief Registrar', 'Administration & Records', '+63 922 555 4005', 'teresa.diaz@ausouth.edu.ph', 2, 'AUS-QR-TD-005-55BA7', 'active', '2021-01-15'),
(6, 'AUS-2024-006', 8, 'David Mendoza', 'Instructor', 'College of Education', '+63 927 555 5006', 'david.mendoza@ausouth.edu.ph', 1, 'AUS-QR-DM-006-89EC3', 'active', '2022-09-01'),
(7, 'AUS-2024-007', NULL, 'Amara Valdez', 'Secretary & Coordinator', 'College of Business', '+63 930 555 6007', 'amara.valdez@ausouth.edu.ph', 3, 'AUS-QR-AV-007-42DA1', 'active', '2023-02-14'),
(8, 'AUS-2024-008', NULL, 'Carlos Alcantara', 'Systems Specialist', 'MIS & IT Support', '+63 933 555 7008', 'carlos.alcantara@ausouth.edu.ph', 1, 'AUS-QR-CA-008-77F83', 'active', '2023-06-01');

-- ------------------------------------------------------------
-- QR Codes
-- ------------------------------------------------------------
INSERT INTO `qr_codes` (`staff_id`, `qr_token`, `qr_payload`, `status`) VALUES
(1, 'AUS-QR-ES-001-A9F32', '{"institution":"AU South","staff_code":"AUS-2024-001","token":"AUS-QR-ES-001-A9F32","name":"Dr. Elena Santos"}', 'active'),
(2, 'AUS-QR-MR-002-C78B1', '{"institution":"AU South","staff_code":"AUS-2024-002","token":"AUS-QR-MR-002-C78B1","name":"Engr. Marcus Reyes"}', 'active'),
(3, 'AUS-QR-SL-003-E41D9', '{"institution":"AU South","staff_code":"AUS-2024-003","token":"AUS-QR-SL-003-E41D9","name":"Prof. Sarah Lim"}', 'active'),
(4, 'AUS-QR-RC-004-98F12', '{"institution":"AU South","staff_code":"AUS-2024-004","token":"AUS-QR-RC-004-98F12","name":"Dr. Roberto Cruz"}', 'active'),
(5, 'AUS-QR-TD-005-55BA7', '{"institution":"AU South","staff_code":"AUS-2024-005","token":"AUS-QR-TD-005-55BA7","name":"Maria Teresa Diaz"}', 'active'),
(6, 'AUS-QR-DM-006-89EC3', '{"institution":"AU South","staff_code":"AUS-2024-006","token":"AUS-QR-DM-006-89EC3","name":"David Mendoza"}', 'active'),
(7, 'AUS-QR-AV-007-42DA1', '{"institution":"AU South","staff_code":"AUS-2024-007","token":"AUS-QR-AV-007-42DA1","name":"Amara Valdez"}', 'active'),
(8, 'AUS-QR-CA-008-77F83', '{"institution":"AU South","staff_code":"AUS-2024-008","token":"AUS-QR-CA-008-77F83","name":"Carlos Alcantara"}', 'active');

-- ------------------------------------------------------------
-- Attendance Records (Curated sample records for today and recent days)
-- ------------------------------------------------------------
INSERT INTO `attendance` (`staff_id`, `shift_id`, `date`, `time_in`, `time_out`, `status`, `late_minutes`, `early_departure_minutes`, `scanned_by_user_id`, `scan_method`, `remarks`) VALUES
(1, 1, CURRENT_DATE(), '07:22:15', NULL, 'on_time', 0, 0, 2, 'camera_qr', 'Arrived 8 mins before shift start. Status: On Time (Currently In)'),
(2, 1, CURRENT_DATE(), '07:54:30', NULL, 'late', 9, 0, 2, 'camera_qr', 'Arrived after 7:45 AM grace period. Status: Late (+9 mins)'),
(3, 2, CURRENT_DATE(), '07:50:10', '17:05:44', 'time_out', 0, 0, 2, 'camera_qr', 'Completed full day shift (Time-In: 07:50, Time-Out: 17:05)'),
(5, 2, CURRENT_DATE(), '08:08:40', NULL, 'on_time', 0, 0, 2, 'manual_code', 'Scanned via gate backup officer. Status: On Time (Within grace period)');

-- ------------------------------------------------------------
-- Audit Logs
-- ------------------------------------------------------------
INSERT INTO `audit_logs` (`user_id`, `user_name`, `user_role`, `action`, `description`, `ip_address`) VALUES
(1, 'Admin Director Aris Thorne', 'admin', 'SYSTEM_INITIALIZATION', 'AU South QR Attendance System database initialized with shifts, staff, and QR tokens', '127.0.0.1'),
(1, 'Admin Director Aris Thorne', 'admin', 'STAFF_CREATE', 'Created staff record AUS-2024-001 for Dr. Elena Santos', '127.0.0.1'),
(1, 'Admin Director Aris Thorne', 'admin', 'QR_GENERATE', 'Generated high-entropy QR security badge token for Dr. Elena Santos', '127.0.0.1'),
(2, 'Officer Mateo Bautista', 'officer', 'USER_LOGIN', 'Attendance Officer Mateo Bautista logged into South Gate QR Terminal', '192.168.1.104'),
(2, 'Officer Mateo Bautista', 'officer', 'QR_SCAN_TIME_IN', 'Time-In recorded for Dr. Elena Santos (AUS-2024-001) at 07:22:15. Status: ON TIME', '192.168.1.104'),
(2, 'Officer Mateo Bautista', 'officer', 'QR_SCAN_TIME_IN', 'Time-In recorded for Engr. Marcus Reyes (AUS-2024-002) at 07:54:30. Status: LATE (+9 mins)', '192.168.1.104'),
(2, 'Officer Mateo Bautista', 'officer', 'QR_SCAN_TIME_OUT', 'Time-Out recorded for Prof. Sarah Lim (AUS-2024-003) at 17:05:44. Daily cycle completed.', '192.168.1.104');
