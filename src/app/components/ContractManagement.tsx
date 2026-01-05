import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { projectId, publicAnonKey } from "@/utils/supabase/client";

interface Contract {
  no_kontrak: string;
  nip: string;
  nama: string;
  tgl_kontrak: string;
  tgl_mulai: string;
  tgl_selesai: string;
  jabatan: string;
}

export function ContractManagement() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [formData, setFormData] = useState<Partial<Contract>>({});

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2b1ea9b2/contracts`,
        {
          headers: {
            "Authorization": `Bearer ${publicAnonKey}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setContracts(data.data);
      }
    } catch (error) {
      console.error("Fetch contracts error:", error);
      toast.error("Gagal mengambil data kontrak");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingContract
        ? `https://${projectId}.supabase.co/functions/v1/make-server-2b1ea9b2/contracts/${editingContract.no_kontrak}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-2b1ea9b2/contracts`;

      const method = editingContract ? "PUT" : "POST";

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
        fetchContracts();
        setIsDialogOpen(false);
        setEditingContract(null);
        setFormData({});
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Submit contract error:", error);
      toast.error("Gagal menyimpan kontrak");
    }
  };

  const handleDelete = async (no_kontrak: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus kontrak ini?")) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2b1ea9b2/contracts/${no_kontrak}`,
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
        fetchContracts();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Delete contract error:", error);
      toast.error("Gagal menghapus kontrak");
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>Data Kontrak</CardTitle>
            <CardDescription>Kelola data kontrak karyawan</CardDescription>
          </div>
          <Button onClick={() => {
            setEditingContract(null);
            setFormData({});
            setIsDialogOpen(true);
          }} className="gap-2">
            <Plus className="h-4 w-4" />
            Tambah Kontrak
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No. Kontrak</TableHead>
                <TableHead>NIP</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Jabatan</TableHead>
                <TableHead>Periode</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contracts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Tidak ada data kontrak
                  </TableCell>
                </TableRow>
              ) : (
                contracts.map((contract) => (
                  <TableRow key={contract.no_kontrak}>
                    <TableCell className="font-medium">{contract.no_kontrak}</TableCell>
                    <TableCell>{contract.nip}</TableCell>
                    <TableCell>{contract.nama}</TableCell>
                    <TableCell>{contract.jabatan}</TableCell>
                    <TableCell className="text-sm">
                      {new Date(contract.tgl_mulai).toLocaleDateString('id-ID')} - {new Date(contract.tgl_selesai).toLocaleDateString('id-ID')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setEditingContract(contract);
                            setFormData(contract);
                            setIsDialogOpen(true);
                          }}
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDelete(contract.no_kontrak)}
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingContract ? "Edit Kontrak" : "Tambah Kontrak Baru"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nip">NIP Karyawan *</Label>
                  <Input
                    id="nip"
                    value={formData.nip || ""}
                    onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nama">Nama *</Label>
                  <Input
                    id="nama"
                    value={formData.nama || ""}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
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
                  <Label htmlFor="tgl_kontrak">Tanggal Kontrak *</Label>
                  <Input
                    id="tgl_kontrak"
                    type="date"
                    value={formData.tgl_kontrak || ""}
                    onChange={(e) => setFormData({ ...formData, tgl_kontrak: e.target.value })}
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
                  <Label htmlFor="tgl_selesai">Tanggal Selesai *</Label>
                  <Input
                    id="tgl_selesai"
                    type="date"
                    value={formData.tgl_selesai || ""}
                    onChange={(e) => setFormData({ ...formData, tgl_selesai: e.target.value })}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Batal
                </Button>
                <Button type="submit">
                  {editingContract ? "Update" : "Tambah"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
