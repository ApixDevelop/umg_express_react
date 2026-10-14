import React, { useState } from "react";
import { Outlet } from "react-router";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg text-text flex print:block print:bg-white print:text-black">
      <div className="no-print">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>
      <div className="lg:pl-[232px] flex flex-col min-h-screen w-full min-w-0 print:pl-0 print:min-h-0 print:block">
        <div className="no-print">
          <Topbar onOpenSidebar={() => setSidebarOpen(true)} />
        </div>
        <main className="flex-1 p-6 w-full max-w-full print:p-0 print:m-0 print:block">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
