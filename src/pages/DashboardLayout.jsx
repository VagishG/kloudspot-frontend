import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { Outlet, useLocation } from "react-router-dom";
import { SiteProvider } from "../context/SiteContext";
import { SocketProvider } from "../context/SocketContext";

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const handleToggleSidebar = () => {
    setCollapsed((prev) => !prev);
  };

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <SiteProvider>
      <SocketProvider>
        <div className="flex h-screen w-full overflow-hidden bg-[#f7f8fa]">

          {/* =========================================
              DESKTOP SIDEBAR
          ========================================= */}

          <aside className="hidden h-screen shrink-0 lg:block">
            <Sidebar
              collapsed={collapsed}
              onToggle={handleToggleSidebar}
            />
          </aside>


          {/* =========================================
              MOBILE SIDEBAR
          ========================================= */}

          <div
            className={`
              fixed
              inset-0
              z-40
              bg-black/40
              transition-opacity
              lg:hidden
              ${
                mobileOpen
                  ? "opacity-100"
                  : "pointer-events-none opacity-0"
              }
            `}
            onClick={() => setMobileOpen(false)}
          />

          <aside
            className={`
              fixed
              inset-y-0
              left-0
              z-50
              w-64
              transform
              transition-transform
              duration-200
              lg:hidden
              ${
                mobileOpen
                  ? "translate-x-0"
                  : "-translate-x-full"
              }
            `}
          >
            <Sidebar
              collapsed={false}
              onToggle={() => setMobileOpen(false)}
              onNavigate={() => setMobileOpen(false)}
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
              <Topbar onMenuClick={() => setMobileOpen(true)} />
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
      </SocketProvider>
    </SiteProvider>
  );
}
