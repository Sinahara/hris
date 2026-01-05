import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Plus, Edit, Trash2, UserX, FileText, Eye } from "lucide-react";
import { toast } from "sonner";
import { projectId, publicAnonKey } from "@/utils/supabase/client";

interface Employee {
  nip: string;
  status_karyawan: "Tetap" | "Kontrak";
  tgl_mulai: string;
  nama_lengkap: string;
  lokasi: string;
  departemen: string;
  jabatan: string;
  gender: "Laki-laki" | "Perempuan";
  nik: string;
  tempat_lahir: string;
  tgl_lahir: string;
  usia: number;
  alamat: string;
  kode_pos: string;
  agama: string;
  status_nikah: string;
  file_pdf?: string;
}

export function EmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [activeTab, setActiveTab] = useState<"Tetap" | "Kontrak">("Tetap");
  const [isResignDialogOpen, setIsResignDialogOpen] = useState(false);
  const [resignEmployee, setResignEmployee] = useState<Employee | null>(null);
  const [resignDate, setResignDate] = useState("");

  const [formData, setFormData] = useState<Partial<Employee>>({
    status_karyawan: "Tetap",
    gender: "Laki-laki",
  });

  // Fetch employees from server
  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    const filtered = employees.filter(emp => emp.status_karyawan === activeTab);
    setFilteredEmployees(filtered);
  }, [employees, activeTab]);

  const fetchEmployees = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2b1ea9b2/employees`,
        {
          headers: {
            "Authorization": `Bearer ${publicAnonKey}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setEmployees(data.data);
      }
    } catch (error) {
      console.error("Fetch employees error:", error);
      toast.error("Gagal mengambil data karyawan");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const employee: Employee = {
      ...formData as Employee,
      usia: formData.tgl_lahir ? 
        new Date().getFullYear() - new Date(formData.tgl_lahir).getFullYear() : 0,
    };

    try {
      const url = editingEmployee
        ? `https://${projectId}.supabase.co/functions/v1/make-server-2b1ea9b2/employees/${editingEmployee.nip}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-2b1ea9b2/employees`;

      const method = editingEmployee ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(employee),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(data.message);
        fetchEmployees();
        setIsDialogOpen(false);
        setEditingEmployee(null);
        setFormData({ status_karyawan: "Tetap", gender: "Laki-laki" });
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Submit employee error:", error);
      toast.error("Gagal menyimpan data karyawan");
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData(employee);
    setIsDialogOpen(true);
  };

  const handleDelete = async (nip: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus karyawan ini?")) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2b1ea9b2/employees/${nip}`,
        {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();
      
      if (data.success) {
        toast.success(data.message);
        fetchEmployees();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Delete employee error:", error);
      toast.error("Gagal menghapus karyawan");
    }
  };

  const handleResign = (employee: Employee) => {
    setResignEmployee(employee);
    setResignDate(new Date().toISOString().split('T')[0]);
    setIsResignDialogOpen(true);
  };

  const confirmResign = async () => {
    if (!resignEmployee) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2b1ea9b2/employees/${resignEmployee.nip}/resign`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ tgl_resign: resignDate }),
        }
      );

      const data = await response.json();
      
      if (data.success) {
        toast.success(data.message);
        fetchEmployees();
        setIsResignDialogOpen(false);
        setResignEmployee(null);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Resign employee error:", error);
      toast.error("Gagal menonaktifkan karyawan");
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>Data Karyawan</CardTitle>
            <CardDescription>Kelola data karyawan tetap dan kontrak</CardDescription>
          </div>
          <Button onClick={() => {
            setEditingEmployee(null);
            setFormData({ status_karyawan: activeTab, gender: "Laki-laki" });
            setIsDialogOpen(true);
          }} className="gap-2">
            <Plus className="h-4 w-4" />
            Tambah Karyawan
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "Tetap" | "Kontrak")}>
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="Tetap">Karyawan Tetap</TabsTrigger>
            <TabsTrigger value="Kontrak">Karyawan Kontrak</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>NIP</TableHead>
                    <TableHead>Nama Lengkap</TableHead>
                    <TableHead>Departemen</TableHead>
                    <TableHead>Jabatan</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        Tidak ada data karyawan {activeTab.toLowerCase()}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEmployees.map((employee) => (
                      <TableRow key={employee.nip}>
                        <TableCell className="font-medium">{employee.nip}</TableCell>
                        <TableCell>{employee.nama_lengkap}</TableCell>
                        <TableCell>{employee.departemen}</TableCell>
                        <TableCell>{employee.jabatan}</TableCell>
                        <TableCell>{employee.gender}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleEdit(employee)}
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleResign(employee)}
                              title="Non-aktifkan"
                            >
                              <UserX className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleDelete(employee.nip)}
                              title="Hapus"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                            {employee.file_pdf && (
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => window.open(employee.file_pdf, '_blank')}
                                title="Lihat PDF"
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>

        {/* Add/Edit Employee Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingEmployee ? "Edit Karyawan" : "Tambah Karyawan Baru"}
              </DialogTitle>
              <DialogDescription>
                Lengkapi form di bawah untuk {editingEmployee ? "mengupdate" : "menambahkan"} data karyawan
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nip">NIP *</Label>
                  <Input
                    id="nip"
                    value={formData.nip || ""}
                    onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                    required
                    disabled={!!editingEmployee}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status_karyawan">Status Karyawan *</Label>
                  <Select
                    value={formData.status_karyawan}
                    onValueChange={(value) => setFormData({ ...formData, status_karyawan: value as "Tetap" | "Kontrak" })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tetap">Tetap</SelectItem>
                      <SelectItem value="Kontrak">Kontrak</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nama_lengkap">Nama Lengkap *</Label>
                  <Input
                    id="nama_lengkap"
                    value={formData.nama_lengkap || ""}
                    onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tgl_mulai">Tanggal Mulai *</Label>
                  <Input
                    id="tgl_mulai"
                    type="date"
                    value={formData.tgl_mulai || ""}
                    onChange={(e) => setFormData({ ...formData, tgl_mulai: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="departemen">Departemen *</Label>
                  <Input
                    id="departemen"
                    value={formData.departemen || ""}
                    onChange={(e) => setFormData({ ...formData, departemen: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jabatan">Jabatan *</Label>
                  <Input
                    id="jabatan"
                    value={formData.jabatan || ""}
                    onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lokasi">Lokasi *</Label>
                  <Input
                    id="lokasi"
                    value={formData.lokasi || ""}
                    onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => setFormData({ ...formData, gender: value as "Laki-laki" | "Perempuan" })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                      <SelectItem value="Perempuan">Perempuan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nik">NIK *</Label>
                  <Input
                    id="nik"
                    value={formData.nik || ""}
                    onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tempat_lahir">Tempat Lahir *</Label>
                  <Input
                    id="tempat_lahir"
                    value={formData.tempat_lahir || ""}
                    onChange={(e) => setFormData({ ...formData, tempat_lahir: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tgl_lahir">Tanggal Lahir *</Label>
                  <Input
                    id="tgl_lahir"
                    type="date"
                    value={formData.tgl_lahir || ""}
                    onChange={(e) => setFormData({ ...formData, tgl_lahir: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="agama">Agama *</Label>
                  <Input
                    id="agama"
                    value={formData.agama || ""}
                    onChange={(e) => setFormData({ ...formData, agama: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status_nikah">Status Pernikahan *</Label>
                  <Input
                    id="status_nikah"
                    value={formData.status_nikah || ""}
                    onChange={(e) => setFormData({ ...formData, status_nikah: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kode_pos">Kode Pos *</Label>
                  <Input
                    id="kode_pos"
                    value={formData.kode_pos || ""}
                    onChange={(e) => setFormData({ ...formData, kode_pos: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="alamat">Alamat *</Label>
                  <Input
                    id="alamat"
                    value={formData.alamat || ""}
                    onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="file_pdf">File PDF URL (optional)</Label>
                  <Input
                    id="file_pdf"
                    type="url"
                    placeholder="https://example.com/file.pdf"
                    value={formData.file_pdf || ""}
                    onChange={(e) => setFormData({ ...formData, file_pdf: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Batal
                </Button>
                <Button type="submit">
                  {editingEmployee ? "Update" : "Tambah"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Resign Confirmation Dialog */}
        <Dialog open={isResignDialogOpen} onOpenChange={setIsResignDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Konfirmasi Non-aktifkan Karyawan</DialogTitle>
              <DialogDescription>
                Apakah Anda yakin ingin menonaktifkan karyawan <strong>{resignEmployee?.nama_lengkap}</strong>?
                Data akan dipindahkan ke menu Resign.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="resign_date">Tanggal Resign</Label>
              <Input
                id="resign_date"
                type="date"
                value={resignDate}
                onChange={(e) => setResignDate(e.target.value)}
                required
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsResignDialogOpen(false)}>
                Batal
              </Button>
              <Button variant="destructive" onClick={confirmResign}>
                Non-aktifkan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
