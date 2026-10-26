import React, { useState } from "react";
import {
  MapPin,
  ChevronDown,
  Bell,
} from "lucide-react";

import NotificationPanel from "./NotificationPanel";

export default function Topbar() {

  const [notificationsOpen, setNotificationsOpen] =
    useState(false);


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


          {/* Location */}

          <button
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
              Avenue Mall
            </span>

            <ChevronDown
              size={14}
              className="text-gray-500"
            />

          </button>

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