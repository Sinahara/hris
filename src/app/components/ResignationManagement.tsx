import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { toast } from "sonner";
import { projectId, publicAnonKey } from "../../utils/supabase/info";

interface Resignation {
  nip: string;
  nama_lengkap: string;
  departemen: string;
  jabatan: string;
  tgl_mulai: string;
  tgl_resign: string;
  gender: string;
  resigned_at: string;
}

export function ResignationManagement() {
  const [resignations, setResignations] = useState<Resignation[]>([]);

  useEffect(() => {
    fetchResignations();
  }, []);

  const fetchResignations = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2b1ea9b2/resignations`,
        {
          headers: {
            "Authorization": `Bearer ${publicAnonKey}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setResignations(data.data);
      }
    } catch (error) {
      console.error("Fetch resignations error:", error);
      toast.error("Gagal mengambil data resign");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Karyawan Resign</CardTitle>
        <CardDescription>Data karyawan yang telah di-nonaktifkan (read-only)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>NIP</TableHead>
                <TableHead>Nama Lengkap</TableHead>
                <TableHead>Departemen</TableHead>
                <TableHead>Jabatan</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Tgl Mulai</TableHead>
                <TableHead>Tgl Resign</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resignations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    Tidak ada data karyawan resign
                  </TableCell>
                </TableRow>
              ) : (
                resignations.map((item) => (
                  <TableRow key={item.nip}>
                    <TableCell className="font-medium">{item.nip}</TableCell>
                    <TableCell>{item.nama_lengkap}</TableCell>
                    <TableCell>{item.departemen}</TableCell>
                    <TableCell>{item.jabatan}</TableCell>
                    <TableCell>{item.gender}</TableCell>
                    <TableCell>{new Date(item.tgl_mulai).toLocaleDateString('id-ID')}</TableCell>
                    <TableCell className="text-red-600 font-medium">
                      {new Date(item.tgl_resign).toLocaleDateString('id-ID')}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          Total karyawan resign: {resignations.length}
        </div>
      </CardContent>
    </Card>
  );
}
