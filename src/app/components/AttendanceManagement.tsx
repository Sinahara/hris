import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Plus, Filter } from "lucide-react";
import { toast } from "sonner";
import { projectId, publicAnonKey } from "../../utils/supabase/info";

interface Attendance {
  id: string;
  nama_karyawan: string;
  departemen: string;
  tanggal: string;
  jam_masuk: string;
  jam_pulang: string;
  status_telat: boolean;
}

export function AttendanceManagement() {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [filteredAttendance, setFilteredAttendance] = useState<Attendance[]>([]);
  const [filters, setFilters] = useState({
    nama_karyawan: "",
    departemen: "",
    tgl_dari: "",
    tgl_sampai: "",
  });

  useEffect(() => {
    fetchAttendance();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [attendance, filters]);

  const fetchAttendance = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2b1ea9b2/attendance`,
        {
          headers: {
            "Authorization": `Bearer ${publicAnonKey}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setAttendance(data.data);
      }
    } catch (error) {
      console.error("Fetch attendance error:", error);
      toast.error("Gagal mengambil data absensi");
    }
  };

  const applyFilters = () => {
    let filtered = [...attendance];

    if (filters.nama_karyawan) {
      filtered = filtered.filter(item => 
        item.nama_karyawan.toLowerCase().includes(filters.nama_karyawan.toLowerCase())
      );
    }

    if (filters.departemen) {
      filtered = filtered.filter(item => 
        item.departemen.toLowerCase().includes(filters.departemen.toLowerCase())
      );
    }

    if (filters.tgl_dari) {
      filtered = filtered.filter(item => item.tanggal >= filters.tgl_dari);
    }

    if (filters.tgl_sampai) {
      filtered = filtered.filter(item => item.tanggal <= filters.tgl_sampai);
    }

    setFilteredAttendance(filtered);
  };

  const getDayName = (dateString: string) => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const date = new Date(dateString);
    return days[date.getDay()];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Absensi</CardTitle>
        <CardDescription>Kelola dan filter data absensi karyawan</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filter Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filter Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="filter_nama">Nama Karyawan</Label>
                <Input
                  id="filter_nama"
                  placeholder="Cari nama..."
                  value={filters.nama_karyawan}
                  onChange={(e) => setFilters({ ...filters, nama_karyawan: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="filter_dept">Departemen</Label>
                <Input
                  id="filter_dept"
                  placeholder="Cari departemen..."
                  value={filters.departemen}
                  onChange={(e) => setFilters({ ...filters, departemen: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="filter_dari">Dari Tanggal</Label>
                <Input
                  id="filter_dari"
                  type="date"
                  value={filters.tgl_dari}
                  onChange={(e) => setFilters({ ...filters, tgl_dari: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="filter_sampai">Sampai Tanggal</Label>
                <Input
                  id="filter_sampai"
                  type="date"
                  value={filters.tgl_sampai}
                  onChange={(e) => setFilters({ ...filters, tgl_sampai: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Karyawan</TableHead>
                <TableHead>Departemen</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Hari</TableHead>
                <TableHead>Jam Masuk</TableHead>
                <TableHead>Jam Pulang</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAttendance.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    Tidak ada data absensi
                  </TableCell>
                </TableRow>
              ) : (
                filteredAttendance.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.nama_karyawan}</TableCell>
                    <TableCell>{item.departemen}</TableCell>
                    <TableCell>{new Date(item.tanggal).toLocaleDateString('id-ID')}</TableCell>
                    <TableCell>{getDayName(item.tanggal)}</TableCell>
                    <TableCell>{item.jam_masuk}</TableCell>
                    <TableCell>{item.jam_pulang || "-"}</TableCell>
                    <TableCell>
                      {item.status_telat ? (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-red-100 text-red-800">
                          Telat
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                          Tepat Waktu
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="text-sm text-muted-foreground">
          Menampilkan {filteredAttendance.length} dari {attendance.length} data absensi
        </div>
      </CardContent>
    </Card>
  );
}
