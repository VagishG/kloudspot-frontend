import React, { useState, useRef, useEffect } from "react";
import {
  MapPin,
  ChevronDown,
  Bell,
} from "lucide-react";

import NotificationPanel from "./NotificationPanel";
import { useSite } from "../context/SiteContext";

export default function Topbar() {

  const [notificationsOpen, setNotificationsOpen] =
    useState(false);

  const [siteDropdownOpen, setSiteDropdownOpen] =
    useState(false);

  const dropdownRef = useRef(null);

  const {
    sites,
    selectedSite,
    selectSite,
    loading: sitesLoading,
  } = useSite();


  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setSiteDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  return (
    <>
      <header
        className="
          relative
          z-30
          h-[60px]
          w-full
          bg-white
          border-b
          border-gray-200
          flex
          items-center
          justify-between
          px-5
        "
      >

        {/* =====================================
            LEFT
        ===================================== */}

        <div className="flex items-center gap-4">

          {/* Brand */}

          <div className="text-sm font-medium text-gray-900 whitespace-nowrap">
            Crowd Solutions
          </div>


          {/* Divider */}

          <div className="h-5 w-px bg-gray-300" />


          {/* Location Picker */}

          <div
            className="relative"
            ref={dropdownRef}
          >

            <button
              onClick={() =>
                setSiteDropdownOpen((prev) => !prev)
              }
              className="
                h-8
                px-3
                flex
                items-center
                gap-2
                rounded-md
                border
                border-gray-300
                bg-white
                text-sm
                text-gray-700
                hover:bg-gray-50
                transition
              "
            >

              <MapPin
                size={15}
                strokeWidth={2}
              />

              <span>
                {sitesLoading
                  ? "Loading..."
                  : selectedSite?.name || "Select Site"}
              </span>

              <ChevronDown
                size={14}
                className={`text-gray-500 transition-transform ${
                  siteDropdownOpen ? "rotate-180" : ""
                }`}
              />

            </button>


            {/* Dropdown */}

            {siteDropdownOpen && sites.length > 0 && (
              <div
                className="
                  absolute
                  left-0
                  top-full
                  mt-1
                  min-w-[220px]
                  rounded-md
                  border
                  border-gray-200
                  bg-white
                  shadow-lg
                  py-1
                  z-50
                "
              >

                {sites.map((site) => (
                  <button
                    key={site.siteId}
                    onClick={() => {
                      selectSite(site.siteId);
                      setSiteDropdownOpen(false);
                    }}
                    className={`
                      w-full
                      px-4
                      py-2.5
                      text-left
                      text-sm
                      flex
                      items-center
                      gap-2
                      transition
                      ${
                        selectedSite?.siteId === site.siteId
                          ? "bg-[#e8f5f4] text-[#039a94] font-medium"
                          : "text-gray-700 hover:bg-gray-50"
                      }
                    `}
                  >
                    <MapPin size={13} strokeWidth={2} />

                    <div className="min-w-0">
                      <div className="truncate">
                        {site.name}
                      </div>

                      <div className="text-[10px] text-gray-400">
                        {site.city}, {site.country}
                      </div>
                    </div>

                  </button>
                ))}

              </div>
            )}

          </div>

        </div>


        {/* =====================================
            RIGHT
        ===================================== */}

        <div className="flex items-center gap-5">

          {/* Language */}

          <div className="flex items-center gap-1">

            <button
              className="
                w-7
                h-7
                rounded-full
                bg-[#45b8b3]
                text-white
                text-xs
                font-medium
              "
            >
              En
            </button>

            <button
              className="
                w-7
                h-7
                rounded-full
                text-gray-500
                text-xs
                hover:bg-gray-100
              "
            >
              €
            </button>

          </div>


          {/* =================================
              NOTIFICATION BUTTON
          ================================= */}

          <button
            type="button"
            onClick={() =>
              setNotificationsOpen(
                (previous) => !previous
              )
            }
            className="
              relative
              flex
              items-center
              justify-center
              text-gray-600
              hover:text-gray-900
                cursor-pointer
              "
          >

            <Bell
              size={20}
              strokeWidth={1.8}
            />

            {/* Notification dot */}

            <span
              className="
                absolute
                -top-1
                -right-1
                h-2
                w-2
                rounded-full
                bg-red-400
                border
                border-white
              "
            />

          </button>


          {/* Profile */}

          <button
            className="
              w-8
              h-8
              rounded-full
              overflow-hidden
              border
              border-gray-200
            "
          >

            <img
              src="https://i.pravatar.cc/100?img=12"
              alt="Profile"
              className="w-full h-full object-cover"
            />

          </button>

        </div>

      </header>


      {/* =====================================
          NOTIFICATION PANEL
      ===================================== */}

      {notificationsOpen && (
        <NotificationPanel
          onClose={() =>
            setNotificationsOpen(false)
          }
        />
      )}

    </>
  );
}
