
import { useState } from "react";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import DashboardHeader from "../components/dashboard/DashboardHeader";

function DashboardLayout({ children, role = "agent" }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardSidebar
        role={role}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="min-h-screen lg:pl-64">
        <DashboardHeader
          role={role}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="p-4 sm:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
