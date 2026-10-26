import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { Outlet } from "react-router-dom";

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);

  const handleToggleSidebar = () => {
    setCollapsed((prev) => !prev);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f7f8fa]">

      {/* =========================================
          SIDEBAR
      ========================================= */}

      <aside className="h-screen shrink-0">
        <Sidebar
          collapsed={collapsed}
          onToggle={handleToggleSidebar}
        />
      </aside>


      {/* =========================================
          RIGHT SIDE
      ========================================= */}

      <div className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">

        {/* =======================================
            TOPBAR
        ======================================= */}

        <header className="h-[60px] shrink-0">
          <Topbar />
        </header>


        {/* =======================================
            MAIN CONTENT
        ======================================= */}

        <main
          className="
            min-h-0
            min-w-0
            flex-1
            overflow-y-auto
            overflow-x-hidden
            bg-[#f7f8fa]
          "
        >
          <Outlet />
        </main>

      </div>

    </div>
  );
}