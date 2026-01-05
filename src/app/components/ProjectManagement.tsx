import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { Plus, Edit, Trash2, FileText } from "lucide-react";
import { toast } from "sonner";
import { projectId, publicAnonKey } from "../../utils/supabase/info";
import { TaskManagement } from "./TaskManagement";

interface Project {
  id_project: string;
  nama_project: string;
  client: string;
  alamat: string;
  status_project: "On Progress" | "Completed";
  no_kontrak: string;
  tgl_start: string;
  tgl_end: string;
  is_jakon: boolean;
  is_car: boolean;
}

export function ProjectManagement() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showTasks, setShowTasks] = useState(false);

  const [formData, setFormData] = useState<Partial<Project>>({
    status_project: "On Progress",
    is_jakon: false,
    is_car: false,
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2b1ea9b2/projects`,
        {
          headers: {
            "Authorization": `Bearer ${publicAnonKey}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setProjects(data.data);
      }
    } catch (error) {
      console.error("Fetch projects error:", error);
      toast.error("Gagal mengambil data project");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingProject
        ? `https://${projectId}.supabase.co/functions/v1/make-server-2b1ea9b2/projects/${editingProject.id_project}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-2b1ea9b2/projects`;

      const method = editingProject ? "PUT" : "POST";

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
        fetchProjects();
        setIsDialogOpen(false);
        setEditingProject(null);
        setFormData({ status_project: "On Progress", is_jakon: false, is_car: false });
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Submit project error:", error);
      toast.error("Gagal menyimpan data project");
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData(project);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id_project: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus project ini?")) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2b1ea9b2/projects/${id_project}`,
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
        fetchProjects();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Delete project error:", error);
      toast.error("Gagal menghapus project");
    }
  };

  if (showTasks && selectedProject) {
    return (
      <div>
        <Button variant="outline" onClick={() => setShowTasks(false)} className="mb-4">
          ← Kembali ke Daftar Project
        </Button>
        <TaskManagement project={selectedProject} />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>Data Project</CardTitle>
            <CardDescription>Kelola data project perusahaan</CardDescription>
          </div>
          <Button onClick={() => {
            setEditingProject(null);
            setFormData({ status_project: "On Progress", is_jakon: false, is_car: false });
            setIsDialogOpen(true);
          }} className="gap-2">
            <Plus className="h-4 w-4" />
            Tambah Project
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Project</TableHead>
                <TableHead>Nama Project</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Periode</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Tidak ada data project
                  </TableCell>
                </TableRow>
              ) : (
                projects.map((project) => (
                  <TableRow key={project.id_project}>
                    <TableCell className="font-medium">{project.id_project}</TableCell>
                    <TableCell>{project.nama_project}</TableCell>
                    <TableCell>{project.client}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                        project.status_project === "On Progress" 
                          ? "bg-yellow-100 text-yellow-800" 
                          : "bg-green-100 text-green-800"
                      }`}>
                        {project.status_project}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(project.tgl_start).toLocaleDateString('id-ID')} - {new Date(project.tgl_end).toLocaleDateString('id-ID')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEdit(project)}
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setSelectedProject(project);
                            setShowTasks(true);
                          }}
                          title="Surat Tugas"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDelete(project.id_project)}
                          title="Hapus"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
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
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProject ? "Edit Project" : "Tambah Project Baru"}
              </DialogTitle>
              <DialogDescription>
                Lengkapi form di bawah untuk {editingProject ? "mengupdate" : "menambahkan"} data project
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nama_project">Nama Project *</Label>
                  <Input
                    id="nama_project"
                    value={formData.nama_project || ""}
                    onChange={(e) => setFormData({ ...formData, nama_project: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client">Client *</Label>
                  <Input
                    id="client"
                    value={formData.client || ""}
                    onChange={(e) => setFormData({ ...formData, client: e.target.value })}
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
                <div className="space-y-2">
                  <Label htmlFor="status_project">Status Project *</Label>
                  <Select
                    value={formData.status_project}
                    onValueChange={(value) => setFormData({ ...formData, status_project: value as "On Progress" | "Completed" })}
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
                  <Label htmlFor="no_kontrak">No. Kontrak *</Label>
                  <Input
                    id="no_kontrak"
                    value={formData.no_kontrak || ""}
                    onChange={(e) => setFormData({ ...formData, no_kontrak: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tgl_start">Tanggal Mulai *</Label>
                  <Input
                    id="tgl_start"
                    type="date"
                    value={formData.tgl_start || ""}
                    onChange={(e) => setFormData({ ...formData, tgl_start: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tgl_end">Tanggal Selesai *</Label>
                  <Input
                    id="tgl_end"
                    type="date"
                    value={formData.tgl_end || ""}
                    onChange={(e) => setFormData({ ...formData, tgl_end: e.target.value })}
                    required
                  />
                </div>
                <div className="flex items-center space-x-4 md:col-span-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_jakon"
                      checked={formData.is_jakon || false}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_jakon: checked as boolean })}
                    />
                    <Label htmlFor="is_jakon" className="cursor-pointer">
                      Jasa Konstruksi (JAKON)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_car"
                      checked={formData.is_car || false}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_car: checked as boolean })}
                    />
                    <Label htmlFor="is_car" className="cursor-pointer">
                      CAR
                    </Label>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Batal
                </Button>
                <Button type="submit">
                  {editingProject ? "Update" : "Tambah"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
