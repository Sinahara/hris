import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Users, Briefcase, Package, Calendar, UserMinus, FileText, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { EmployeeManagement } from "./EmployeeManagement";
import { ProjectManagement } from "./ProjectManagement";
import { InventoryManagement } from "./InventoryManagement";
import { AttendanceManagement } from "./AttendanceManagement";
import { ResignationManagement } from "./ResignationManagement";
import { ContractManagement } from "./ContractManagement";

interface DashboardProps {
  onLogout: () => void;
}

export function Dashboard({ onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState("employees");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">HRIS - MS Persada</h1>
            <p className="text-sm opacity-90">Sistem Informasi Manajemen Karyawan</p>
          </div>
          <Button variant="outline" size="sm" onClick={onLogout} className="gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 h-auto p-2">
            <TabsTrigger value="employees" className="gap-2 flex-col h-auto py-2">
              <Users className="h-5 w-5" />
              <span className="text-xs">Karyawan</span>
            </TabsTrigger>
            <TabsTrigger value="projects" className="gap-2 flex-col h-auto py-2">
              <Briefcase className="h-5 w-5" />
              <span className="text-xs">Project</span>
            </TabsTrigger>
            <TabsTrigger value="inventory" className="gap-2 flex-col h-auto py-2">
              <Package className="h-5 w-5" />
              <span className="text-xs">Inventaris</span>
            </TabsTrigger>
            <TabsTrigger value="attendance" className="gap-2 flex-col h-auto py-2">
              <Calendar className="h-5 w-5" />
              <span className="text-xs">Absensi</span>
            </TabsTrigger>
            <TabsTrigger value="resignations" className="gap-2 flex-col h-auto py-2">
              <UserMinus className="h-5 w-5" />
              <span className="text-xs">Resign</span>
            </TabsTrigger>
            <TabsTrigger value="contracts" className="gap-2 flex-col h-auto py-2">
              <FileText className="h-5 w-5" />
              <span className="text-xs">Kontrak</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="employees" className="mt-6">
            <EmployeeManagement />
          </TabsContent>

          <TabsContent value="projects" className="mt-6">
            <ProjectManagement />
          </TabsContent>

          <TabsContent value="inventory" className="mt-6">
            <InventoryManagement />
          </TabsContent>

          <TabsContent value="attendance" className="mt-6">
            <AttendanceManagement />
          </TabsContent>

          <TabsContent value="resignations" className="mt-6">
            <ResignationManagement />
          </TabsContent>

          <TabsContent value="contracts" className="mt-6">
            <ContractManagement />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
