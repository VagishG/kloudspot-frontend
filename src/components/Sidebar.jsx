import React from "react";
import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import {
  Menu,
  House,
  SquareArrowDownRight,
  Power,
} from "lucide-react";


const items = [
  {
    icon: House,
    text: "Overview",
    nav: "/dashboard",
    end: true,
  },
  {
    icon: SquareArrowDownRight,
    text: "Crowd Entries",
    nav: "/dashboard/crowdentries",
  },
];


export default function Sidebar({
  collapsed = false,
  onToggle,
}) {

  const navigate = useNavigate();


  // ================================
  // Logout
  // ================================

  function handleLogout() {
    // Remove authentication token
    localStorage.removeItem("token");

    // Redirect to login
    navigate("/login", {
      replace: true,
    });
  }


  return (
    <aside
      className="
        flex
        h-full
        w-full
        flex-col
        overflow-hidden
        whitespace-nowrap
        text-white
      "
      style={{
        backgroundImage:
          "linear-gradient(to bottom, #2a2d2d 0%, #17504f 50%, #2a2d2d 100%)",
      }}
    >

      {/* =========================================
          HEADER
      ========================================= */}

      <div
        className={`
          flex
          items-center
          py-5

          ${
            collapsed
              ? "justify-center"
              : "justify-between px-6"
          }
        `}
      >

        {!collapsed && (
          <img
            src="/logo.svg"
            alt="Kloudspot"
            className="h-8"
          />
        )}


        <button
          type="button"
          onClick={onToggle}
          aria-label={
            collapsed
              ? "Expand sidebar"
              : "Collapse sidebar"
          }
          aria-expanded={!collapsed}
          className="
            rounded-md
            p-1
            hover:bg-white/10
          "
        >
          <Menu size={22} />
        </button>

      </div>


      {/* =========================================
          NAVIGATION
      ========================================= */}

      <nav className="mt-4 flex flex-col gap-3 px-4">

        {items.map((item) => (
          <NavTab
            key={item.nav}
            collapsed={collapsed}
            {...item}
          />
        ))}

      </nav>


      {/* =========================================
          LOGOUT
      ========================================= */}

      <div className="mt-auto px-4 pb-6">

        <button
          type="button"
          onClick={handleLogout}
          title={
            collapsed
              ? "Logout"
              : undefined
          }
          className={`
            flex
            w-full
            items-center
            gap-4
            rounded-md
            py-4
            text-lg
            font-light
            hover:bg-white/10
            transition

            ${
              collapsed
                ? "justify-center"
                : "px-5 text-left"
            }
          `}
        >

          <Power
            size={26}
            strokeWidth={1.5}
            className="shrink-0"
          />

          {!collapsed && (
            <span>
              Logout
            </span>
          )}

        </button>

      </div>

    </aside>
  );
}


/* =========================================
   NAVIGATION TAB
========================================= */

function NavTab({
  icon: Icon,
  text,
  nav,
  collapsed,
  end = false,
}) {

  return (
    <NavLink
      to={nav}
      end={end}
      title={
        collapsed
          ? text
          : undefined
      }

      className={({ isActive }) =>
        `
          relative
          flex
          h-12
          items-center
          rounded-md
          text-base
          font-light
          transition-all
          duration-200

          ${
            collapsed
              ? "justify-center"
              : "gap-4 px-4"
          }

          ${
            isActive
              ? "bg-white/20"
              : "hover:bg-white/10"
          }
        `
      }
    >

      {({ isActive }) => (
        <>

          {/* Active indicator */}

          {isActive && (
            <span
              className="
                absolute
                -left-3
                top-1/2
                h-7
                w-1
                -translate-y-1/2
                rounded-r-full
                bg-white
              "
            />
          )}


          <Icon
            size={22}
            strokeWidth={1.7}
            className="shrink-0"
          />


          {!collapsed && (
            <span>
              {text}
            </span>
          )}

        </>
      )}

    </NavLink>
  );
}