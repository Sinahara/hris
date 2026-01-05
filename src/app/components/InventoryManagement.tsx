import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import { projectId, publicAnonKey } from "@/utils/supabase/client";

interface Inventory {
  id_inventaris: string;
  kategori: string;
  nama_barang: string;
  merk: string;
  type: string;
  no_seri: string;
  tgl_beli: string;
  harga: number;
  garansi: string;
  foto_barang?: string;
}

export function InventoryManagement() {
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Inventory | null>(null);
  const [formData, setFormData] = useState<Partial<Inventory>>({});

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2b1ea9b2/inventory`,
        {
          headers: {
            "Authorization": `Bearer ${publicAnonKey}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setInventory(data.data);
      }
    } catch (error) {
      console.error("Fetch inventory error:", error);
      toast.error("Gagal mengambil data inventaris");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingItem
        ? `https://${projectId}.supabase.co/functions/v1/make-server-2b1ea9b2/inventory/${editingItem.id_inventaris}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-2b1ea9b2/inventory`;

      const method = editingItem ? "PUT" : "POST";

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
        fetchInventory();
        setIsDialogOpen(false);
        setEditingItem(null);
        setFormData({});
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Submit inventory error:", error);
      toast.error("Gagal menyimpan inventaris");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus inventaris ini?")) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2b1ea9b2/inventory/${id}`,
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
        fetchInventory();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Delete inventory error:", error);
      toast.error("Gagal menghapus inventaris");
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>Data Inventaris</CardTitle>
            <CardDescription>Kelola data inventaris perusahaan</CardDescription>
          </div>
          <Button onClick={() => {
            setEditingItem(null);
            setFormData({});
            setIsDialogOpen(true);
          }} className="gap-2">
            <Plus className="h-4 w-4" />
            Tambah Inventaris
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Nama Barang</TableHead>
                <TableHead>Merk</TableHead>
                <TableHead>Harga</TableHead>
                <TableHead>Garansi</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    Tidak ada data inventaris
                  </TableCell>
                </TableRow>
              ) : (
                inventory.map((item) => (
                  <TableRow key={item.id_inventaris}>
                    <TableCell className="font-medium">{item.id_inventaris}</TableCell>
                    <TableCell>{item.kategori}</TableCell>
                    <TableCell>{item.nama_barang}</TableCell>
                    <TableCell>{item.merk}</TableCell>
                    <TableCell>Rp {item.harga.toLocaleString('id-ID')}</TableCell>
                    <TableCell>{item.garansi}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setEditingItem(item);
                            setFormData(item);
                            setIsDialogOpen(true);
                          }}
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {item.foto_barang && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => window.open(item.foto_barang, '_blank')}
                            title="Lihat Foto"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDelete(item.id_inventaris)}
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
                {editingItem ? "Edit Inventaris" : "Tambah Inventaris Baru"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="kategori">Kategori *</Label>
                  <Input
                    id="kategori"
                    value={formData.kategori || ""}
                    onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nama_barang">Nama Barang *</Label>
                  <Input
                    id="nama_barang"
                    value={formData.nama_barang || ""}
                    onChange={(e) => setFormData({ ...formData, nama_barang: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="merk">Merk *</Label>
                  <Input
                    id="merk"
                    value={formData.merk || ""}
                    onChange={(e) => setFormData({ ...formData, merk: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type *</Label>
                  <Input
                    id="type"
                    value={formData.type || ""}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="no_seri">No. Seri *</Label>
                  <Input
                    id="no_seri"
                    value={formData.no_seri || ""}
                    onChange={(e) => setFormData({ ...formData, no_seri: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tgl_beli">Tanggal Beli *</Label>
                  <Input
                    id="tgl_beli"
                    type="date"
                    value={formData.tgl_beli || ""}
                    onChange={(e) => setFormData({ ...formData, tgl_beli: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="harga">Harga *</Label>
                  <Input
                    id="harga"
                    type="number"
                    value={formData.harga || ""}
                    onChange={(e) => setFormData({ ...formData, harga: parseFloat(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="garansi">Garansi *</Label>
                  <Input
                    id="garansi"
                    value={formData.garansi || ""}
                    onChange={(e) => setFormData({ ...formData, garansi: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="foto_barang">Foto URL (optional)</Label>
                  <Input
                    id="foto_barang"
                    type="url"
                    placeholder="https://example.com/foto.jpg"
                    value={formData.foto_barang || ""}
                    onChange={(e) => setFormData({ ...formData, foto_barang: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Batal
                </Button>
                <Button type="submit">
                  {editingItem ? "Update" : "Tambah"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
