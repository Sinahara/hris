# Sistem Informasi Manajemen Karyawan (HRIS)
## MS Persada - Human Resource Information System

### 🚀 Sistem Lengkap Berbasis Web

Sistem HRIS ini dibangun dengan teknologi modern menggunakan:
- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Supabase Edge Functions (Hono Server)
- **Database**: Supabase PostgreSQL (KV Store)
- **UI Components**: Radix UI + shadcn/ui

---

## 🎨 Skema Warna
- **Primary (Navbar)**: #302e97 (Biru Tua)
- **Secondary**: #352e3d (Gelap)
- **Background**: #eeeff0 (Abu-abu Terang)

---

## 🔐 Login Credentials
```
Email: hrd.mspersada@gmail.com
Password: Mpersada01
```

---

## 📋 Fitur Lengkap

### 1. **Menu Karyawan** 👥
- Tab filter untuk Karyawan Tetap & Kontrak
- CRUD (Create, Read, Update, Delete)
- Upload PDF file
- Tombol "Non-aktifkan" (pindah ke menu Resign)
- Auto-generate NIP
- Field lengkap:
  - NIP, Nama, Departemen, Jabatan, Lokasi
  - NIK, Tempat/Tanggal Lahir, Usia (auto-calculate)
  - Gender, Agama, Status Pernikahan
  - Alamat, Kode Pos
  - File PDF (optional)

### 2. **Menu Project** 💼
- CRUD Project
- Auto-generate ID Project (PRJ-001, PRJ-002, dst)
- Status: On Progress / Completed
- Checkbox: Jasa Konstruksi (JAKON) & CAR
- Field:
  - Nama Project, Client, Alamat
  - No. Kontrak, Tanggal Mulai/Selesai

#### Sub-Menu: Surat Tugas 📝
- Akses dari tombol detail project
- CRUD Surat Tugas
- Auto-generate No. Tugas (ST-001, ST-002, dst)
- **Cetak Surat Tugas** (HTML to Print)
- Field:
  - Nama Petugas, Jabatan Tugas
  - Status Onsite: On Progress / Completed
  - Periode tugas

### 3. **Menu Inventaris** 📦
- CRUD Inventaris
- Auto-generate ID (INV-001, INV-002, dst)
- Upload foto barang (URL)
- Field:
  - Kategori, Nama Barang, Merk, Type
  - No. Seri, Tanggal Beli, Harga
  - Garansi, Foto Barang

### 4. **Menu Absensi** 📅
- Filter multi-parameter:
  - Nama Karyawan
  - Departemen
  - Periode Tanggal (Dari - Sampai)
- Tampilan:
  - Tanggal, Hari (otomatis)
  - Jam Masuk, Jam Pulang
  - **Status Telat** (Merah jika jam_masuk > 08:00:00)
- Read-only (data entry via API)

### 5. **Menu Resign** 👋
- Data Read-Only
- Otomatis terisi dari proses "Non-aktifkan" di menu Karyawan
- Menampilkan:
  - Data lengkap karyawan
  - Tanggal mulai kerja
  - **Tanggal Resign** (highlight merah)

### 6. **Menu Kontrak** 📄
- CRUD Kontrak
- Auto-generate No. Kontrak (KONTRAK-2024-001, dst)
- Field:
  - NIP, Nama Karyawan, Jabatan
  - Tanggal Kontrak
  - Periode Kontrak (Mulai - Selesai)

---

## 🗄️ Database Structure (KV Store)

### Prefix Keys:
```
employee:{nip}        → Data karyawan aktif
resignation:{nip}     → Data karyawan resign
project:{id_project}  → Data project
task:{id_project}:{no_tugas} → Surat tugas per project
inventory:{id_inventaris} → Data inventaris
attendance:{id}       → Data absensi
contract:{no_kontrak} → Data kontrak
```

---

## 🔌 API Endpoints

### Authentication
- `POST /make-server-2b1ea9b2/auth/login` - Login HRD

### Employees
- `GET /make-server-2b1ea9b2/employees` - Get all employees
- `GET /make-server-2b1ea9b2/employees/:nip` - Get employee by NIP
- `POST /make-server-2b1ea9b2/employees` - Create employee
- `PUT /make-server-2b1ea9b2/employees/:nip` - Update employee
- `DELETE /make-server-2b1ea9b2/employees/:nip` - Delete employee
- `POST /make-server-2b1ea9b2/employees/:nip/resign` - Resign employee

### Projects
- `GET /make-server-2b1ea9b2/projects` - Get all projects
- `POST /make-server-2b1ea9b2/projects` - Create project (auto-gen ID)
- `PUT /make-server-2b1ea9b2/projects/:id` - Update project
- `DELETE /make-server-2b1ea9b2/projects/:id` - Delete project

### Tasks (Surat Tugas)
- `GET /make-server-2b1ea9b2/projects/:id/tasks` - Get tasks by project
- `POST /make-server-2b1ea9b2/projects/:id/tasks` - Create task
- `PUT /make-server-2b1ea9b2/projects/:id/tasks/:taskId` - Update task
- `DELETE /make-server-2b1ea9b2/projects/:id/tasks/:taskId` - Delete task

### Inventory
- `GET /make-server-2b1ea9b2/inventory` - Get all inventory
- `POST /make-server-2b1ea9b2/inventory` - Create inventory (auto-gen ID)
- `PUT /make-server-2b1ea9b2/inventory/:id` - Update inventory
- `DELETE /make-server-2b1ea9b2/inventory/:id` - Delete inventory

### Attendance
- `GET /make-server-2b1ea9b2/attendance` - Get all attendance
- `POST /make-server-2b1ea9b2/attendance` - Create attendance record

### Resignations
- `GET /make-server-2b1ea9b2/resignations` - Get all resignations

### Contracts
- `GET /make-server-2b1ea9b2/contracts` - Get all contracts
- `POST /make-server-2b1ea9b2/contracts` - Create contract (auto-gen no)
- `PUT /make-server-2b1ea9b2/contracts/:id` - Update contract
- `DELETE /make-server-2b1ea9b2/contracts/:id` - Delete contract

---

## 🎯 Logika Bisnis Khusus

### Auto-Generate IDs:
- **Project**: PRJ-001, PRJ-002, ... (3 digit padding)
- **Surat Tugas**: ST-001, ST-002, ... (3 digit padding)
- **Inventaris**: INV-001, INV-002, ... (3 digit padding)
- **Kontrak**: KONTRAK-{YEAR}-001 (contoh: KONTRAK-2024-001)

### Status Telat Absensi:
```javascript
if (jam_masuk > "08:00:00") {
  status_telat = true; // Tampil merah
} else {
  status_telat = false; // Tampil hijau
}
```

### Non-aktifkan Karyawan:
1. Klik tombol "Non-aktifkan" di menu Karyawan
2. Input tanggal resign
3. Data dipindahkan ke tabel `resignations`
4. Data dihapus dari tabel `employees`

---

## 🚀 Cara Menggunakan

### 1. Login
- Buka aplikasi
- Masukkan email & password yang sudah ditentukan
- Klik "Login"

### 2. Menambah Data
- Pilih menu yang diinginkan (Karyawan, Project, dll)
- Klik tombol "+ Tambah"
- Isi form lengkap
- Klik "Tambah" atau "Update"

### 3. Filter Data (Absensi)
- Buka menu Absensi
- Gunakan filter:
  - Nama Karyawan
  - Departemen
  - Periode Tanggal
- Data akan terfilter otomatis

### 4. Cetak Surat Tugas
- Buka menu Project
- Klik icon "Surat Tugas" pada project
- Klik icon "Printer" pada surat tugas
- Dialog print akan muncul

### 5. Seeding Data Awal (Testing)
Buka browser console dan jalankan:
```javascript
window.seedHRISData()
```

---

## 📱 Responsive Design
- ✅ Mobile-friendly
- ✅ Tablet-optimized
- ✅ Desktop full-featured
- ✅ Touch-friendly buttons

---

## 🎨 UI/UX Features
- Clean & modern interface
- Color-coded status badges
- Intuitive navigation tabs
- Modal dialogs for forms
- Toast notifications
- Print-friendly layouts
- Confirmation dialogs for delete actions

---

## 🔒 Security
- Hardcoded credentials (demo purpose)
- Server-side validation
- Protected API endpoints
- Session management

---

## 📊 Data Validation
- Required field checking
- Date format validation
- Number format validation (harga, usia)
- Auto-calculate usia from tgl_lahir
- Unique ID checking (NIP, No. Kontrak, dll)

---

## 🛠️ Tech Stack Details

### Frontend Libraries:
- React 18.3.1
- TypeScript
- Tailwind CSS 4.1.12
- Radix UI Components
- Lucide React (icons)
- Sonner (toast notifications)
- Date-fns (date formatting)

### Backend:
- Deno Runtime
- Hono Web Framework
- Supabase Client
- KV Store (PostgreSQL-based)

---

## 📝 Notes
- Sistem ini adalah prototype/demo
- Untuk production, tambahkan:
  - Real authentication system
  - File upload to storage
  - Better error handling
  - Role-based access control
  - Audit logging
  - Data export features
  - Advanced reporting

---

## 👨‍💻 Developer
**MS Persada HRIS System**  
Built with ❤️ using React + Supabase

---

## 📞 Support
Untuk pertanyaan atau bantuan, silakan hubungi tim HRD.

---

**© 2025 MS Persada - All Rights Reserved**
