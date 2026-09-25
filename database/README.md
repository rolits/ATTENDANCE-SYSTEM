# College of AU South - QR Attendance System

A comprehensive, production-grade web-based QR attendance management system engineered for **College of AU South** teachers, staff, administrators, and attendance officers.

---

## Table of Contents
1. [System Overview & Architecture](#1-system-overview--architecture)
2. [Prerequisites](#2-prerequisites)
3. [Installing the Project](#3-installing-the-project)
4. [Creating the MySQL Database](#4-creating-the-mysql-database)
5. [Configuring Database Connection](#5-configuring-database-connection)
6. [Running the Website](#6-running-the-website)
7. [Default Test Accounts](#7-default-test-accounts)
8. [Creating an Administrator Account](#8-creating-an-administrator-account)
9. [Registering Teachers & Staff](#9-registering-teachers--staff)
10. [Generating & Printing QR Codes](#10-generating--printing-qr-codes)
11. [Testing Time-In and Time-Out](#11-testing-time-in-and-time-out)
12. [Generating & Exporting Attendance Reports](#12-generating--exporting-attendance-reports)
13. [Attendance Calculation & Grace Period Rules](#13-attendance-calculation--grace-period-rules)

---

## 1. System Overview & Architecture
The system supports three distinct operational roles:
* **Administrator**: Manage faculty/staff profiles, work shifts, grace periods, live records, audit trails, and data export.
* **Attendance Officer**: High-throughput QR Scanner Terminal with camera video stream, manual backup code entry, audible sound feedback, duplicate scan protection, and live scan logs.
* **Teacher / Staff**: Personal self-service portal to view daily attendance status, historical records, and access/download/print their institutional QR Code ID badge.

The database is built on a normalized relational schema with tables for `users`, `staff`, `shifts`, `attendance`, `qr_codes`, and `audit_logs`.

---

## 2. Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm** or **bun**: v9.0.0 or higher
* **MySQL Server**: v8.0 or higher (or MariaDB 10.5+)

---

## 3. Installing the Project

1. Clone or extract the project repository:
   ```bash
   cd au-south-qr-attendance
   ```

2. Install backend and frontend dependencies:
   ```bash
   npm install
   ```

---

## 4. Creating the MySQL Database

1. Open your terminal or MySQL command line client:
   ```bash
   mysql -u root -p
   ```

2. Execute the schema script:
   ```bash
   mysql -u root -p < database/schema.sql
   ```

3. Populate initial shifts, demo accounts, and test data:
   ```bash
   mysql -u root -p < database/seed.sql
   ```

Alternatively, in **phpMyAdmin** or **MySQL Workbench**:
1. Create a database named `au_south_attendance` (utf8mb4_unicode_ci).
2. Click **Import** and choose `database/schema.sql`.
3. Click **Import** again and choose `database/seed.sql`.

---

## 5. Configuring Database Connection

Create or edit your `.env` file in the project root:
```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=au_south_attendance

# Application URL
APP_URL=http://localhost:3000
```

> **Note:** The web application includes an intelligent built-in persistent storage engine that synchronizes out-of-the-box, ensuring instant zero-config evaluation in browser sandboxes, while providing real-time `.sql` exports matching the MySQL schema.

---

## 6. Running the Website

1. Start the integrated full-stack server (Express API + Vite React client):
   ```bash
   npm run dev
   ```

2. Open your web browser and navigate to:
   ```
   http://localhost:3000
   ```

3. To build and run in production mode:
   ```bash
   npm run build
   npm start
   ```

---

## 7. Default Test Accounts

| Role | Username | Password | Full Name / Description |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin` | `admin123` | Admin Director Aris Thorne |
| **Attendance Officer** | `officer1` | `officer123` | Officer Mateo Bautista (Gate 1 Terminal) |
| **Teacher (Computer Studies)** | `elena.santos` | `teacher123` | Dr. Elena Santos (Dean & Professor) |
| **Teacher (Engineering)** | `marcus.reyes` | `teacher123` | Engr. Marcus Reyes (Associate Professor) |
| **Teacher (Nursing)** | `sarah.lim` | `teacher123` | Prof. Sarah Lim (Chairperson) |
| **Staff (Administration)** | `teresa.diaz` | `teacher123` | Maria Teresa Diaz (Chief Registrar) |

---

## 8. Creating an Administrator Account

1. Log in with an existing administrator account (`admin` / `admin123`).
2. Navigate to **Staff Management** > **+ Add Staff Member**.
3. Fill in staff profile details and toggle **"Create User Account"**.
4. Set the role to **Administrator**.
5. Save. The system immediately registers the user, computes cryptographic password credentials, and records an entry in the **Audit Logs**.

---

## 9. Registering Teachers & Staff

1. Click **Staff Management** on the sidebar.
2. Click the **"+ Add New Staff"** button.
3. Enter required fields:
   * **Staff ID / Code**: e.g., `AUS-2024-009`
   * **Full Name**: e.g., `Prof. Gabriel Mendoza`
   * **Department**: Choose from College of Computer Studies, Nursing, Engineering, Arts & Sciences, Education, or Admin Staff.
   * **Position**: e.g., `Assistant Professor`
   * **Contact Number**: e.g., `+63 917 555 8899`
   * **Email Address**: e.g., `gabriel.mendoza@ausouth.edu.ph`
   * **Assigned Shift**: e.g., `Morning Faculty Shift (07:30 AM - 04:30 PM)`
4. A unique, high-entropy cryptographic QR token is generated automatically.
5. Click **Save Staff**.

---

## 10. Generating & Printing QR Codes

1. In **Staff Management**, locate any staff member.
2. Click the **QR Code** icon or click **Actions > View QR ID Badge**.
3. A modal opens with the official **AU South Teacher/Staff ID Card**, including:
   * College of AU South header banner
   * Staff photo placeholder / avatar
   * Full Name, Staff ID, and Department
   * High-resolution, error-corrected QR Code
   * Security verification token
4. Click **"Download QR Code (PNG)"** or **"Print ID Card"** to print or distribute digital badges to teachers.

---

## 11. Testing Time-In and Time-Out

### Method A: Camera Scanner (Real-Time Video)
1. Log in as an **Attendance Officer** (`officer1` / `officer123`) or **Administrator**.
2. Click **QR Scanner** on the navigation bar.
3. Allow camera access in your browser.
4. Point the camera at a staff QR code (on a phone screen or printed paper).
5. The system automatically reads the QR code, identifies the staff, verifies active status, and sounds an audio confirmation beep.
6. The terminal displays the scan result:
   * **Staff Name & ID**
   * **Recorded Action**: `Time-In` or `Time-Out`
   * **Status**: `On Time`, `Late (+X mins)`, or `Time-Out`
   * **Timestamp**: Exact seconds recorded

### Method B: Manual Staff Code Entry (Backup Mode)
1. If camera access is unavailable or lighting is dim, switch to the **Manual Code Input** tab on the scanner page.
2. Enter or select any Staff ID (e.g., `AUS-2024-001` or `AUS-2024-006`).
3. Click **"Submit Attendance Scan"**.
4. The system executes the exact same verification pipeline and records the scan method as `manual_code` in the audit log.

### Duplicate Scan Prevention
* Scanning the same staff member multiple times within 60 seconds triggers a **"Duplicate Scan Prevented"** notice.
* If a staff member has already recorded Time-In and Time-Out for the current day, further scans are politely rejected with a summary notice.

---

## 12. Generating & Exporting Attendance Reports

1. Navigate to **Reports** in the sidebar.
2. Choose a report view:
   * **Daily Attendance Report**: Comprehensive view for today or any selected date.
   * **Weekly / Monthly Report**: Aggregate metrics by department.
   * **Staff Attendance Summary**: Total hours, on-time rate, and tardiness counts per faculty member.
   * **Late Arrival Records**: Dedicated breakdown of late arrivals and tardy minutes.
   * **Absence Log**: Faculty with no Time-In recorded for scheduled workdays.
3. Click **"Export to CSV / Excel"** to download tabular data.
4. Click **"Print Report"** to open a printer-ready institutional format.

---

## 13. Attendance Calculation & Grace Period Rules

* **Shift Start**: e.g., `07:30:00`
* **Grace Period**: 15 minutes (Arrival up to `07:45:00` is flagged as **On Time**).
* **Late Arrival**: Any Time-In after `07:45:00` is marked as **Late**, and exact tardy minutes are calculated:
  $$\text{Late Minutes} = \text{Time-In Minutes} - \text{Shift Start Minutes}$$
* **Time-Out**: When a staff member with an active Time-In scans again, the system records **Time-Out** and marks the record complete.
* **Absent**: Triggered for active staff on duty who do not record a Time-In before shift end.
