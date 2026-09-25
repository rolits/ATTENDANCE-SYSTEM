-- ============================================================
-- AU South QR Attendance System - Database Schema
-- College of AU South Attendance Management System
-- Relational Database: MySQL 8.0+ / MariaDB 10.5+
-- ============================================================

CREATE DATABASE IF NOT EXISTS `au_south_attendance` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `au_south_attendance`;

SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------
-- Table: shifts
-- Stores work schedules, operating hours, and grace periods
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `shifts`;
CREATE TABLE `shifts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL COMMENT 'e.g. Morning Shift, Regular Day Shift',
  `start_time` TIME NOT NULL COMMENT 'Shift start e.g. 07:30:00',
  `end_time` TIME NOT NULL COMMENT 'Shift end e.g. 16:30:00',
  `grace_period_minutes` INT NOT NULL DEFAULT 15 COMMENT 'Grace period in minutes before marked Late',
  `is_default` BOOLEAN NOT NULL DEFAULT FALSE,
  `description` VARCHAR(255) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_shifts_times` (`start_time`, `end_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table: users
-- Application user credentials, authentication & RBAC roles
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(60) NOT NULL UNIQUE,
  `email` VARCHAR(120) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'officer', 'staff') NOT NULL DEFAULT 'staff',
  `full_name` VARCHAR(120) NOT NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `last_login` DATETIME NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_role` (`role`),
  INDEX `idx_users_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table: staff
-- Teachers, professors, administrators, and staff profiles
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `staff`;
CREATE TABLE `staff` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `staff_code` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Unique identifier e.g. AUS-2024-001',
  `user_id` INT NULL UNIQUE COMMENT 'Optional linked login user',
  `full_name` VARCHAR(150) NOT NULL,
  `position` VARCHAR(100) NOT NULL COMMENT 'e.g. Assistant Professor, Instructor, Department Head',
  `department` VARCHAR(120) NOT NULL COMMENT 'e.g. College of Computer Studies, College of Nursing',
  `contact_number` VARCHAR(30) NULL,
  `email` VARCHAR(120) NOT NULL UNIQUE,
  `shift_id` INT NOT NULL,
  `qr_code_token` VARCHAR(120) NOT NULL UNIQUE COMMENT 'Encrypted/unique QR scan token',
  `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  `hire_date` DATE NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_staff_shift` FOREIGN KEY (`shift_id`) REFERENCES `shifts` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_staff_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX `idx_staff_department` (`department`),
  INDEX `idx_staff_status` (`status`),
  INDEX `idx_staff_qr_token` (`qr_code_token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table: qr_codes
-- Tracks QR tokens, generation history, security hashes & status
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `qr_codes`;
CREATE TABLE `qr_codes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `staff_id` INT NOT NULL,
  `qr_token` VARCHAR(120) NOT NULL UNIQUE,
  `qr_payload` TEXT NOT NULL COMMENT 'JSON payload encoded into QR',
  `status` ENUM('active', 'revoked') NOT NULL DEFAULT 'active',
  `generated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `revoked_at` DATETIME NULL,
  CONSTRAINT `fk_qr_staff` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `idx_qr_token_status` (`qr_token`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table: attendance
-- Time-In, Time-Out records, computed status, and audit linkage
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `attendance`;
CREATE TABLE `attendance` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `staff_id` INT NOT NULL,
  `shift_id` INT NOT NULL,
  `date` DATE NOT NULL,
  `time_in` TIME NULL,
  `time_out` TIME NULL,
  `status` ENUM('on_time', 'late', 'absent', 'time_out', 'incomplete') NOT NULL DEFAULT 'on_time',
  `late_minutes` INT NOT NULL DEFAULT 0,
  `early_departure_minutes` INT NOT NULL DEFAULT 0,
  `scanned_by_user_id` INT NULL COMMENT 'User or Attendance Officer who scanned',
  `scan_method` ENUM('camera_qr', 'manual_code', 'system_admin') NOT NULL DEFAULT 'camera_qr',
  `remarks` VARCHAR(255) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_attendance_staff` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_attendance_shift` FOREIGN KEY (`shift_id`) REFERENCES `shifts` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_attendance_officer` FOREIGN KEY (`scanned_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  UNIQUE KEY `uq_staff_date` (`staff_id`, `date`),
  INDEX `idx_attendance_date` (`date`),
  INDEX `idx_attendance_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table: audit_logs
-- Immutable security audit trail of all administrative & scan events
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NULL,
  `user_name` VARCHAR(120) NOT NULL,
  `user_role` VARCHAR(50) NOT NULL,
  `action` VARCHAR(80) NOT NULL COMMENT 'e.g. USER_LOGIN, QR_SCAN_TIME_IN, QR_GENERATE, STAFF_CREATE',
  `description` TEXT NOT NULL,
  `ip_address` VARCHAR(50) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_audit_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX `idx_audit_action` (`action`),
  INDEX `idx_audit_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
