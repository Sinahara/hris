// Helper script to seed initial data for testing
// This can be run from browser console

const projectId = "bbmkjfccfpenctlezhhz";
const publicAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJibWtqZmNjZnBlbmN0bGV6aGh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1ODE1MDQsImV4cCI6MjA4MzE1NzUwNH0.H2L4PIguc32OBc4hZUJkNzxOngPgLYQBHo2BdLUa8qM";

async function seedEmployees() {
  const employees = [
    {
      nip: "EMP001",
      status_karyawan: "Tetap",
      tgl_mulai: "2020-01-15",
      nama_lengkap: "Ahmad Wijaya",
      lokasi: "Jakarta",
      departemen: "IT",
      jabatan: "Software Engineer",
      gender: "Laki-laki",
      nik: "3201012345678901",
      tempat_lahir: "Jakarta",
      tgl_lahir: "1990-05-20",
      usia: 34,
      alamat: "Jl. Sudirman No. 123, Jakarta",
      kode_pos: "12190",
      agama: "Islam",
      status_nikah: "Menikah"
    },
    {
      nip: "EMP002",
      status_karyawan: "Kontrak",
      tgl_mulai: "2023-06-01",
      nama_lengkap: "Siti Rahma",
      lokasi: "Jakarta",
      departemen: "HRD",
      jabatan: "HR Staff",
      gender: "Perempuan",
      nik: "3201012345678902",
      tempat_lahir: "Bandung",
      tgl_lahir: "1995-08-15",
      usia: 29,
      alamat: "Jl. Gatot Subroto No. 45, Jakarta",
      kode_pos: "12930",
      agama: "Islam",
      status_nikah: "Belum Menikah"
    }
  ];

  for (const employee of employees) {
    await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-2b1ea9b2/employees`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify(employee),
    });
  }
  console.log("Employees seeded!");
}

async function seedProjects() {
  const projects = [
    {
      nama_project: "Website Development",
      client: "PT ABC Indonesia",
      alamat: "Jakarta Selatan",
      status_project: "On Progress",
      no_kontrak: "K-2024-001",
      tgl_start: "2024-01-10",
      tgl_end: "2024-12-31",
      is_jakon: false,
      is_car: true
    },
    {
      nama_project: "Mobile App Development",
      client: "PT XYZ Corp",
      alamat: "Bandung",
      status_project: "Completed",
      no_kontrak: "K-2023-045",
      tgl_start: "2023-03-15",
      tgl_end: "2023-11-30",
      is_jakon: true,
      is_car: false
    }
  ];

  for (const project of projects) {
    await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-2b1ea9b2/projects`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify(project),
    });
  }
  console.log("Projects seeded!");
}

async function seedAttendance() {
  const attendance = [
    {
      nama_karyawan: "Ahmad Wijaya",
      departemen: "IT",
      tanggal: "2025-01-04",
      jam_masuk: "07:45:00",
      jam_pulang: "17:00:00"
    },
    {
      nama_karyawan: "Ahmad Wijaya",
      departemen: "IT",
      tanggal: "2025-01-05",
      jam_masuk: "08:15:00",
      jam_pulang: "17:00:00"
    },
    {
      nama_karyawan: "Siti Rahma",
      departemen: "HRD",
      tanggal: "2025-01-04",
      jam_masuk: "08:00:00",
      jam_pulang: "17:00:00"
    }
  ];

  for (const record of attendance) {
    await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-2b1ea9b2/attendance`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify(record),
    });
  }
  console.log("Attendance seeded!");
}

// Run all seeds
async function seedAll() {
  console.log("Starting database seeding...");
  await seedEmployees();
  await seedProjects();
  await seedAttendance();
  console.log("✅ All data seeded successfully!");
}

// Export for use
if (typeof window !== 'undefined') {
  (window as any).seedHRISData = seedAll;
  console.log("To seed data, run: window.seedHRISData()");
}
