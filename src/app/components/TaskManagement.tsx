import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Plus, Edit, Trash2, Printer } from "lucide-react";
import { toast } from "sonner";
import { projectId, publicAnonKey } from "@/utils/supabase/client";

interface Task {
  no_tugas: string;
  id_project: string;
  nama_petugas: string;
  onsite_status: "On Progress" | "Completed";
  jabatan_tugas: string;
  tgl_mulai: string;
  tgl_selesai: string;
}

interface TaskManagementProps {
  project: {
    id_project: string;
    nama_project: string;
  };
}

export function TaskManagement({ project }: TaskManagementProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState<Partial<Task>>({
    onsite_status: "On Progress",
  });

  useEffect(() => {
    fetchTasks();
  }, [project.id_project]);

  const fetchTasks = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2b1ea9b2/projects/${project.id_project}/tasks`,
        {
          headers: {
            "Authorization": `Bearer ${publicAnonKey}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setTasks(data.data);
      }
    } catch (error) {
      console.error("Fetch tasks error:", error);
      toast.error("Gagal mengambil data surat tugas");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingTask
        ? `https://${projectId}.supabase.co/functions/v1/make-server-2b1ea9b2/projects/${project.id_project}/tasks/${editingTask.no_tugas}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-2b1ea9b2/projects/${project.id_project}/tasks`;

      const method = editingTask ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(data.message);
        fetchTasks();
        setIsDialogOpen(false);
        setEditingTask(null);
        setFormData({ onsite_status: "On Progress" });
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Submit task error:", error);
      toast.error("Gagal menyimpan surat tugas");
    }
  };

  const handlePrint = (task: Task) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Surat Tugas - ${task.no_tugas}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; }
              h1 { text-align: center; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              td { padding: 8px; border-bottom: 1px solid #ddd; }
              .label { font-weight: bold; width: 200px; }
            </style>
          </head>
          <body>
            <h1>SURAT TUGAS</h1>
            <h2 style="text-align: center;">${task.no_tugas}</h2>
            <table>
              <tr><td class="label">Project:</td><td>${project.nama_project}</td></tr>
              <tr><td class="label">Nama Petugas:</td><td>${task.nama_petugas}</td></tr>
              <tr><td class="label">Jabatan:</td><td>${task.jabatan_tugas}</td></tr>
              <tr><td class="label">Status:</td><td>${task.onsite_status}</td></tr>
              <tr><td class="label">Periode:</td><td>${new Date(task.tgl_mulai).toLocaleDateString('id-ID')} s/d ${new Date(task.tgl_selesai).toLocaleDateString('id-ID')}</td></tr>
            </table>
            <script>
              window.print();
              window.onafterprint = () => window.close();
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>Surat Tugas - {project.nama_project}</CardTitle>
            <CardDescription>Project ID: {project.id_project}</CardDescription>
          </div>
          <Button onClick={() => {
            setEditingTask(null);
            setFormData({ onsite_status: "On Progress" });
            setIsDialogOpen(true);
          }} className="gap-2">
            <Plus className="h-4 w-4" />
            Tambah Surat Tugas
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No. Tugas</TableHead>
                <TableHead>Nama Petugas</TableHead>
                <TableHead>Jabatan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Periode</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Tidak ada surat tugas
                  </TableCell>
                </TableRow>
              ) : (
                tasks.map((task) => (
                  <TableRow key={task.no_tugas}>
                    <TableCell className="font-medium">{task.no_tugas}</TableCell>
                    <TableCell>{task.nama_petugas}</TableCell>
                    <TableCell>{task.jabatan_tugas}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                        task.onsite_status === "On Progress" 
                          ? "bg-yellow-100 text-yellow-800" 
                          : "bg-green-100 text-green-800"
                      }`}>
                        {task.onsite_status}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(task.tgl_mulai).toLocaleDateString('id-ID')} - {new Date(task.tgl_selesai).toLocaleDateString('id-ID')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setEditingTask(task);
                            setFormData(task);
                            setIsDialogOpen(true);
                          }}
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handlePrint(task)}
                          title="Cetak"
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingTask ? "Edit Surat Tugas" : "Tambah Surat Tugas"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nama_petugas">Nama Petugas *</Label>
                <Input
                  id="nama_petugas"
                  value={formData.nama_petugas || ""}
                  onChange={(e) => setFormData({ ...formData, nama_petugas: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jabatan_tugas">Jabatan *</Label>
                <Input
                  id="jabatan_tugas"
                  value={formData.jabatan_tugas || ""}
                  onChange={(e) => setFormData({ ...formData, jabatan_tugas: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="onsite_status">Status Tugas *</Label>
                <Select
                  value={formData.onsite_status}
                  onValueChange={(value) => setFormData({ ...formData, onsite_status: value as "On Progress" | "Completed" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="On Progress">On Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
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
                <Label htmlFor="tgl_selesai">Tanggal Selesai *</Label>
                <Input
                  id="tgl_selesai"
                  type="date"
                  value={formData.tgl_selesai || ""}
                  onChange={(e) => setFormData({ ...formData, tgl_selesai: e.target.value })}
                  required
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Batal
                </Button>
                <Button type="submit">
                  {editingTask ? "Update" : "Tambah"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
