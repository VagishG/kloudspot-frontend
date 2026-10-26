import React, {
  useState,
  useEffect,
} from "react";

import {
  X,
  MapPin,
  Loader2,
} from "lucide-react";

import { getEntryExit, getTodayRange } from "../api/api";
import { useSite } from "../context/SiteContext";


export default function NotificationPanel({ onClose }) {

  const { selectedSite } = useSite();

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    async function fetchAlerts() {
      if (!selectedSite) {
        setLoading(false);
        return;
      }

      try {
        const { fromUtc, toUtc } = getTodayRange();
        const res = await getEntryExit({
          siteId: selectedSite.siteId,
          fromUtc,
          toUtc,
          pageSize: 20,
          pageNumber: 1,
        });

        // Convert entry-exit records into alert-style items
        const items = (res?.records || []).map((r, idx) => ({
          id: `${r.personId}-${r.entryUtc}-${idx}`,
          time: r.entryLocal || new Date(r.entryUtc).toLocaleString(),
          title: `${r.personName || r.personId || "Unknown"} Entered`,
          zone: r.zoneName || r.zoneId || "Unknown Zone",
          priority: r.severity
            ? r.severity.charAt(0).toUpperCase() + r.severity.slice(1)
            : "Low",
        }));

        setAlerts(items);
      } catch (err) {
        console.error("Failed to fetch alerts:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchAlerts();
  }, [selectedSite]);


  return (
    <>
      {/* =========================================
          BACKDROP
      ========================================= */}

      <div
        className="
          fixed
          inset-0
          z-40
          bg-black/35
        "
        onClick={onClose}
      />


      {/* =========================================
          NOTIFICATION PANEL
      ========================================= */}

      <div
        className="
          fixed
          right-0
          top-0
          z-50
          h-screen
          w-[380px]
          max-w-[90vw]
          bg-white
          shadow-2xl
          flex
          flex-col
        "
      >

        {/* =======================================
            HEADER
        ======================================= */}

        <div
          className="
            h-[58px]
            shrink-0
            flex
            items-center
            justify-between
            px-4
            border-b
            border-gray-200
          "
        >

          <h2 className="text-sm font-semibold text-gray-800">
            Alerts
            {alerts.length > 0 && (
              <span className="ml-2 text-xs font-normal text-gray-400">
                ({alerts.length})
              </span>
            )}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="
              flex
              h-7
              w-7
              items-center
              justify-center
              rounded-md
              text-gray-500
              hover:bg-gray-100
              hover:text-gray-800
            "
          >
            <X size={16} />
          </button>

        </div>


        {/* =======================================
            ALERT LIST
        ======================================= */}

        <div className="flex-1 overflow-y-auto p-2">

          {loading ? (
            <div className="flex items-center justify-center h-32 text-gray-400">
              <Loader2 size={20} className="animate-spin" />
              <span className="ml-2 text-sm">Loading alerts...</span>
            </div>
          ) : alerts.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
              No alerts for today
            </div>
          ) : (
            <div className="flex flex-col gap-2">

              {alerts.map((alert) => (
                <AlertItem
                  key={alert.id}
                  alert={alert}
                />
              ))}

            </div>
          )}

        </div>

      </div>
    </>
  );
}


/* =========================================
   ALERT ITEM
========================================= */

function AlertItem({ alert }) {

  const priorityStyles = {
    High: {
      badge: "bg-red-600 text-white",
      border: "border-gray-200",
    },

    Medium: {
      badge: "bg-orange-400 text-white",
      border: "border-gray-200",
    },

    Low: {
      badge: "bg-emerald-500 text-white",
      border: "border-gray-200",
    },
  };

  const styles =
    priorityStyles[alert.priority] ||
    priorityStyles.Low;

  return (
    <div
      className={`
        rounded-lg
        border
        ${styles.border}
        px-3
        py-2.5
        bg-white
        hover:bg-gray-50
        transition
      `}
    >

      {/* Time */}

      <p className="text-[10px] text-gray-400">
        {alert.time}
      </p>


      {/* Main row */}

      <div className="mt-1 flex items-center justify-between gap-3">

        <div className="min-w-0">

          <p className="text-xs font-medium text-gray-800">
            {alert.title}
          </p>

          <div className="mt-1 flex items-center gap-1 text-[10px] text-gray-500">

            <MapPin size={10} />

            <span>
              {alert.zone}
            </span>

          </div>

        </div>


        {/* Priority */}

        <span
          className={`
            shrink-0
            rounded-sm
            px-2
            py-1
            text-[9px]
            font-medium
            ${styles.badge}
          `}
        >
          {alert.priority}
        </span>

      </div>

    </div>
  );
}