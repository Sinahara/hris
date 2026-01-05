import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-2b1ea9b2/health", (c) => {
  return c.json({ status: "ok" });
});

// ==================== AUTHENTICATION ====================
app.post("/make-server-2b1ea9b2/auth/login", async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    // Hardcoded credentials
    if (email === "hrd.mspersada@gmail.com" && password === "Mpersada01") {
      return c.json({ 
        success: true, 
        message: "Login berhasil",
        user: { email }
      });
    }
    
    return c.json({ success: false, message: "Email atau password salah" }, 401);
  } catch (error) {
    console.log("Login error:", error);
    return c.json({ success: false, message: "Login gagal" }, 500);
  }
});

// ==================== EMPLOYEES ====================
// Get all employees
app.get("/make-server-2b1ea9b2/employees", async (c) => {
  try {
    const employees = await kv.getByPrefix("employee:");
    return c.json({ success: true, data: employees });
  } catch (error) {
    console.log("Get employees error:", error);
    return c.json({ success: false, message: "Gagal mengambil data karyawan" }, 500);
  }
});

// Get employee by NIP
app.get("/make-server-2b1ea9b2/employees/:nip", async (c) => {
  try {
    const nip = c.req.param("nip");
    const employee = await kv.get(`employee:${nip}`);
    
    if (!employee) {
      return c.json({ success: false, message: "Karyawan tidak ditemukan" }, 404);
    }
    
    return c.json({ success: true, data: employee });
  } catch (error) {
    console.log("Get employee error:", error);
    return c.json({ success: false, message: "Gagal mengambil data karyawan" }, 500);
  }
});

// Create employee
app.post("/make-server-2b1ea9b2/employees", async (c) => {
  try {
    const employee = await c.req.json();
    await kv.set(`employee:${employee.nip}`, employee);
    return c.json({ success: true, message: "Karyawan berhasil ditambahkan", data: employee });
  } catch (error) {
    console.log("Create employee error:", error);
    return c.json({ success: false, message: "Gagal menambahkan karyawan" }, 500);
  }
});

// Update employee
app.put("/make-server-2b1ea9b2/employees/:nip", async (c) => {
  try {
    const nip = c.req.param("nip");
    const employee = await c.req.json();
    await kv.set(`employee:${nip}`, employee);
    return c.json({ success: true, message: "Karyawan berhasil diupdate", data: employee });
  } catch (error) {
    console.log("Update employee error:", error);
    return c.json({ success: false, message: "Gagal mengupdate karyawan" }, 500);
  }
});

// Delete employee
app.delete("/make-server-2b1ea9b2/employees/:nip", async (c) => {
  try {
    const nip = c.req.param("nip");
    await kv.del(`employee:${nip}`);
    return c.json({ success: true, message: "Karyawan berhasil dihapus" });
  } catch (error) {
    console.log("Delete employee error:", error);
    return c.json({ success: false, message: "Gagal menghapus karyawan" }, 500);
  }
});

// Resign employee (move to resignations)
app.post("/make-server-2b1ea9b2/employees/:nip/resign", async (c) => {
  try {
    const nip = c.req.param("nip");
    const { tgl_resign } = await c.req.json();
    
    const employee = await kv.get(`employee:${nip}`);
    if (!employee) {
      return c.json({ success: false, message: "Karyawan tidak ditemukan" }, 404);
    }
    
    // Create resignation record
    const resignation = {
      ...employee,
      tgl_resign,
      resigned_at: new Date().toISOString()
    };
    
    await kv.set(`resignation:${nip}`, resignation);
    await kv.del(`employee:${nip}`);
    
    return c.json({ success: true, message: "Karyawan berhasil dinonaktifkan" });
  } catch (error) {
    console.log("Resign employee error:", error);
    return c.json({ success: false, message: "Gagal menonaktifkan karyawan" }, 500);
  }
});

// ==================== PROJECTS ====================
// Get all projects
app.get("/make-server-2b1ea9b2/projects", async (c) => {
  try {
    const projects = await kv.getByPrefix("project:");
    return c.json({ success: true, data: projects });
  } catch (error) {
    console.log("Get projects error:", error);
    return c.json({ success: false, message: "Gagal mengambil data project" }, 500);
  }
});

// Create project
app.post("/make-server-2b1ea9b2/projects", async (c) => {
  try {
    const project = await c.req.json();
    
    // Generate project ID
    const projects = await kv.getByPrefix("project:");
    const projectCount = projects.length + 1;
    const id_project = `PRJ-${String(projectCount).padStart(3, '0')}`;
    
    const newProject = { ...project, id_project };
    await kv.set(`project:${id_project}`, newProject);
    
    return c.json({ success: true, message: "Project berhasil ditambahkan", data: newProject });
  } catch (error) {
    console.log("Create project error:", error);
    return c.json({ success: false, message: "Gagal menambahkan project" }, 500);
  }
});

// Update project
app.put("/make-server-2b1ea9b2/projects/:id", async (c) => {
  try {
    const id_project = c.req.param("id");
    const project = await c.req.json();
    await kv.set(`project:${id_project}`, { ...project, id_project });
    return c.json({ success: true, message: "Project berhasil diupdate", data: project });
  } catch (error) {
    console.log("Update project error:", error);
    return c.json({ success: false, message: "Gagal mengupdate project" }, 500);
  }
});

// Delete project
app.delete("/make-server-2b1ea9b2/projects/:id", async (c) => {
  try {
    const id_project = c.req.param("id");
    await kv.del(`project:${id_project}`);
    
    // Delete related tasks
    const tasks = await kv.getByPrefix(`task:${id_project}:`);
    for (const task of tasks) {
      await kv.del(`task:${id_project}:${task.no_tugas}`);
    }
    
    return c.json({ success: true, message: "Project berhasil dihapus" });
  } catch (error) {
    console.log("Delete project error:", error);
    return c.json({ success: false, message: "Gagal menghapus project" }, 500);
  }
});

// ==================== PROJECT TASKS ====================
// Get tasks by project
app.get("/make-server-2b1ea9b2/projects/:id/tasks", async (c) => {
  try {
    const id_project = c.req.param("id");
    const tasks = await kv.getByPrefix(`task:${id_project}:`);
    return c.json({ success: true, data: tasks });
  } catch (error) {
    console.log("Get tasks error:", error);
    return c.json({ success: false, message: "Gagal mengambil data surat tugas" }, 500);
  }
});

// Create task
app.post("/make-server-2b1ea9b2/projects/:id/tasks", async (c) => {
  try {
    const id_project = c.req.param("id");
    const task = await c.req.json();
    
    // Generate task number
    const tasks = await kv.getByPrefix(`task:${id_project}:`);
    const taskCount = tasks.length + 1;
    const no_tugas = `ST-${String(taskCount).padStart(3, '0')}`;
    
    const newTask = { ...task, no_tugas, id_project };
    await kv.set(`task:${id_project}:${no_tugas}`, newTask);
    
    return c.json({ success: true, message: "Surat tugas berhasil ditambahkan", data: newTask });
  } catch (error) {
    console.log("Create task error:", error);
    return c.json({ success: false, message: "Gagal menambahkan surat tugas" }, 500);
  }
});

// Update task
app.put("/make-server-2b1ea9b2/projects/:id/tasks/:taskId", async (c) => {
  try {
    const id_project = c.req.param("id");
    const no_tugas = c.req.param("taskId");
    const task = await c.req.json();
    
    await kv.set(`task:${id_project}:${no_tugas}`, { ...task, no_tugas, id_project });
    return c.json({ success: true, message: "Surat tugas berhasil diupdate", data: task });
  } catch (error) {
    console.log("Update task error:", error);
    return c.json({ success: false, message: "Gagal mengupdate surat tugas" }, 500);
  }
});

// Delete task
app.delete("/make-server-2b1ea9b2/projects/:id/tasks/:taskId", async (c) => {
  try {
    const id_project = c.req.param("id");
    const no_tugas = c.req.param("taskId");
    await kv.del(`task:${id_project}:${no_tugas}`);
    return c.json({ success: true, message: "Surat tugas berhasil dihapus" });
  } catch (error) {
    console.log("Delete task error:", error);
    return c.json({ success: false, message: "Gagal menghapus surat tugas" }, 500);
  }
});

// ==================== INVENTORY ====================
// Get all inventory
app.get("/make-server-2b1ea9b2/inventory", async (c) => {
  try {
    const inventory = await kv.getByPrefix("inventory:");
    return c.json({ success: true, data: inventory });
  } catch (error) {
    console.log("Get inventory error:", error);
    return c.json({ success: false, message: "Gagal mengambil data inventaris" }, 500);
  }
});

// Create inventory
app.post("/make-server-2b1ea9b2/inventory", async (c) => {
  try {
    const item = await c.req.json();
    
    // Generate inventory ID
    const inventory = await kv.getByPrefix("inventory:");
    const inventoryCount = inventory.length + 1;
    const id_inventaris = `INV-${String(inventoryCount).padStart(3, '0')}`;
    
    const newItem = { ...item, id_inventaris };
    await kv.set(`inventory:${id_inventaris}`, newItem);
    
    return c.json({ success: true, message: "Inventaris berhasil ditambahkan", data: newItem });
  } catch (error) {
    console.log("Create inventory error:", error);
    return c.json({ success: false, message: "Gagal menambahkan inventaris" }, 500);
  }
});

// Update inventory
app.put("/make-server-2b1ea9b2/inventory/:id", async (c) => {
  try {
    const id_inventaris = c.req.param("id");
    const item = await c.req.json();
    await kv.set(`inventory:${id_inventaris}`, { ...item, id_inventaris });
    return c.json({ success: true, message: "Inventaris berhasil diupdate", data: item });
  } catch (error) {
    console.log("Update inventory error:", error);
    return c.json({ success: false, message: "Gagal mengupdate inventaris" }, 500);
  }
});

// Delete inventory
app.delete("/make-server-2b1ea9b2/inventory/:id", async (c) => {
  try {
    const id_inventaris = c.req.param("id");
    await kv.del(`inventory:${id_inventaris}`);
    return c.json({ success: true, message: "Inventaris berhasil dihapus" });
  } catch (error) {
    console.log("Delete inventory error:", error);
    return c.json({ success: false, message: "Gagal menghapus inventaris" }, 500);
  }
});

// ==================== ATTENDANCE ====================
// Get all attendance
app.get("/make-server-2b1ea9b2/attendance", async (c) => {
  try {
    const attendance = await kv.getByPrefix("attendance:");
    return c.json({ success: true, data: attendance });
  } catch (error) {
    console.log("Get attendance error:", error);
    return c.json({ success: false, message: "Gagal mengambil data absensi" }, 500);
  }
});

// Create attendance
app.post("/make-server-2b1ea9b2/attendance", async (c) => {
  try {
    const record = await c.req.json();
    
    // Generate ID
    const id = `${record.nama_karyawan}-${record.tanggal}-${Date.now()}`;
    
    // Check if late (after 08:00:00)
    const jamMasuk = record.jam_masuk || "00:00:00";
    const status_telat = jamMasuk > "08:00:00";
    
    const newRecord = { ...record, id, status_telat };
    await kv.set(`attendance:${id}`, newRecord);
    
    return c.json({ success: true, message: "Absensi berhasil ditambahkan", data: newRecord });
  } catch (error) {
    console.log("Create attendance error:", error);
    return c.json({ success: false, message: "Gagal menambahkan absensi" }, 500);
  }
});

// ==================== RESIGNATIONS ====================
// Get all resignations
app.get("/make-server-2b1ea9b2/resignations", async (c) => {
  try {
    const resignations = await kv.getByPrefix("resignation:");
    return c.json({ success: true, data: resignations });
  } catch (error) {
    console.log("Get resignations error:", error);
    return c.json({ success: false, message: "Gagal mengambil data resign" }, 500);
  }
});

// ==================== CONTRACTS ====================
// Get all contracts
app.get("/make-server-2b1ea9b2/contracts", async (c) => {
  try {
    const contracts = await kv.getByPrefix("contract:");
    return c.json({ success: true, data: contracts });
  } catch (error) {
    console.log("Get contracts error:", error);
    return c.json({ success: false, message: "Gagal mengambil data kontrak" }, 500);
  }
});

// Create contract
app.post("/make-server-2b1ea9b2/contracts", async (c) => {
  try {
    const contract = await c.req.json();
    
    // Generate contract number
    const contracts = await kv.getByPrefix("contract:");
    const contractCount = contracts.length + 1;
    const year = new Date().getFullYear();
    const no_kontrak = `KONTRAK-${year}-${String(contractCount).padStart(3, '0')}`;
    
    const newContract = { ...contract, no_kontrak };
    await kv.set(`contract:${no_kontrak}`, newContract);
    
    return c.json({ success: true, message: "Kontrak berhasil ditambahkan", data: newContract });
  } catch (error) {
    console.log("Create contract error:", error);
    return c.json({ success: false, message: "Gagal menambahkan kontrak" }, 500);
  }
});

// Update contract
app.put("/make-server-2b1ea9b2/contracts/:id", async (c) => {
  try {
    const no_kontrak = c.req.param("id");
    const contract = await c.req.json();
    await kv.set(`contract:${no_kontrak}`, { ...contract, no_kontrak });
    return c.json({ success: true, message: "Kontrak berhasil diupdate", data: contract });
  } catch (error) {
    console.log("Update contract error:", error);
    return c.json({ success: false, message: "Gagal mengupdate kontrak" }, 500);
  }
});

// Delete contract
app.delete("/make-server-2b1ea9b2/contracts/:id", async (c) => {
  try {
    const no_kontrak = c.req.param("id");
    await kv.del(`contract:${no_kontrak}`);
    return c.json({ success: true, message: "Kontrak berhasil dihapus" });
  } catch (error) {
    console.log("Delete contract error:", error);
    return c.json({ success: false, message: "Gagal menghapus kontrak" }, 500);
  }
});

Deno.serve(app.fetch);
