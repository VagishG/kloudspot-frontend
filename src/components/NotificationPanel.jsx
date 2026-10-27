import { X, MapPin } from "lucide-react";
import { useSocket } from "../context/SocketContext";
import { useSite } from "../context/SiteContext";

function formatAlertTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function NotificationPanel({ onClose }) {
  const { alerts } = useSocket();
  const { selectedSite } = useSite();

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
            aria-label="Close alerts"
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

          {alerts.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-sm text-gray-400">
              No alerts yet
            </div>
          ) : (
            <div className="flex flex-col gap-2">

              {alerts.map((alert) => (
                <AlertItem
                  key={alert.id}
                  alert={alert}
                  fallbackSite={selectedSite?.name}
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

function AlertItem({ alert, fallbackSite }) {

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

  const priorityValue = alert.severity
    ? String(alert.severity)
    : "Low";
  const priority =
    priorityValue.charAt(0).toUpperCase() +
    priorityValue.slice(1).toLowerCase();

  const styles =
    priorityStyles[priority] ||
    priorityStyles.Low;

  const action =
    alert.action === "exit" ? "Exited" : "Entered";

  const personName =
    alert.personName || "Visitor";

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
        {formatAlertTime(alert.time)}
      </p>


      {/* Main row */}

      <div className="mt-1 flex items-center justify-between gap-3">

        <div className="min-w-0">

          <p className="truncate text-xs font-medium text-gray-800">
            {personName} {action}
          </p>

          <div className="mt-1 flex items-center gap-1 text-[10px] text-gray-500">

            <MapPin size={10} />

            <span className="truncate">
              {alert.zone ||
                fallbackSite ||
                "Unknown Zone"}
            </span>

          </div>

          {alert.siteName && alert.siteName !== alert.zone && (
            <p className="mt-0.5 truncate text-[10px] text-gray-400">
              {alert.siteName}
            </p>
          )}

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
          {priority}
        </span>

      </div>

    </div>
  );
}
