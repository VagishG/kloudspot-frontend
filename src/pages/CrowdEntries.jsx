import {
  useState,
  useEffect,
  useCallback,
} from "react";

import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  RefreshCw,
  User,
} from "lucide-react";

import { getEntryExit } from "../api/api";
import { useSite } from "../context/SiteContext";
import { getRangeForDays, getSiteDateKey } from "../utils/dateRange";
import { readCache, writeCache } from "../utils/dataCache";


// ------------------------------------
// DATE RANGE OPTIONS
// ------------------------------------

const dateOptions = [
  { label: "Today", days: 0 },
  { label: "Yesterday", days: 1 },
  { label: "Last 7 Days", days: 7 },
  { label: "Last 30 Days", days: 30 },
];

const PAGE_SIZE = 10;


export default function CrowdEntries() {

  const { selectedSite } = useSite();

  const [dateRange, setDateRange] = useState(dateOptions[0]);
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);

  // API data
  const [records, setRecords] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);

  // States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  // Build site-timezone aware time range
  const getTimeRange = useCallback(
    () => getRangeForDays(dateRange.days, selectedSite?.timezone),
    [dateRange, selectedSite?.timezone]
  );


  // Fetch data
  const fetchData = useCallback(async () => {
    if (!selectedSite) return;

    const siteId = selectedSite.siteId;
    const { fromUtc, toUtc } = getTimeRange();
    const cacheKey = `entries:${siteId}:${dateRange.days}:${pageNumber}:${getSiteDateKey(
      selectedSite.timezone
    )}`;
    const cached = readCache(cacheKey, "session");

    setError(null);

    if (cached?.data) {
      setRecords(cached.data.records || []);
      setTotalRecords(cached.data.totalRecords || 0);
      setTotalPages(cached.data.totalPages || 0);
      setLoading(false);
    } else {
      setLoading(true);
    }

    try {
      const res = await getEntryExit({
        siteId,
        fromUtc,
        toUtc,
        pageSize: PAGE_SIZE,
        pageNumber,
      });

      const snapshot = {
        records: res?.records || [],
        totalRecords: res?.totalRecords || 0,
        totalPages: res?.totalPages || 0,
      };

      setRecords(snapshot.records);
      setTotalRecords(snapshot.totalRecords);
      setTotalPages(snapshot.totalPages);
      writeCache(cacheKey, snapshot, 2 * 60 * 1000, "session");
    } catch (err) {
      if (!cached?.data) {
        setRecords([]);
        setTotalRecords(0);
        setTotalPages(0);
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load crowd entries"
        );
      }
    } finally {
      setLoading(false);
    }
  }, [selectedSite, getTimeRange, pageNumber, dateRange.days]);


  useEffect(() => {
    fetchData();
  }, [fetchData]);


  // Reset to page 1 when the site changes
  useEffect(() => {
    setPageNumber(1);
  }, [selectedSite?.siteId]);


  // Format epoch millis to readable time
  function formatTime(epochMs) {
    if (!epochMs) return "--";
    const d = new Date(epochMs);
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  // Format dwell minutes
  function formatDwell(mins) {
    if (mins == null) return "--";
    const m = Math.floor(mins);
    const s = Math.round((mins - m) * 60);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  // Generate page numbers for pagination
  function getPageNumbers() {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (pageNumber > 3) pages.push("...");

      const start = Math.max(2, pageNumber - 1);
      const end = Math.min(totalPages - 1, pageNumber + 1);
      for (let i = start; i <= end; i++) pages.push(i);

      if (pageNumber < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  }


  return (
    <div className="w-full min-h-full bg-[#f7f8fa] p-6 lg:p-7">

      {/* =========================================
          HEADER
      ========================================= */}

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-gray-800">
            Crowd Entries
          </h1>

          {!loading && (
            <p className="text-xs text-gray-400 mt-1">
              {totalRecords.toLocaleString()} total records
              {selectedSite && ` — ${selectedSite.name}`}
            </p>
          )}
        </div>

        {/* Date Range Picker */}
        <div className="relative shrink-0 self-start sm:self-auto">

          <button
            onClick={() =>
              setDateDropdownOpen((prev) => !prev)
            }
            className="
              h-10
              px-4
              bg-white
              border
              border-gray-200
              rounded-md
              flex
              items-center
              gap-2
              text-sm
              text-gray-600
              hover:bg-gray-50
              transition
            "
          >
            <CalendarDays size={16} />

            <span>
              {dateRange.label}
            </span>

            <ChevronDown
              size={14}
              className={`transition-transform ${
                dateDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {dateDropdownOpen && (
            <div
              className="
                absolute
                right-0
                top-full
                mt-1
                min-w-[160px]
                rounded-md
                border
                border-gray-200
                bg-white
                shadow-lg
                py-1
                z-50
              "
            >
              {dateOptions.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => {
                    setDateRange(opt);
                    setPageNumber(1);
                    setDateDropdownOpen(false);
                  }}
                  className={`
                    w-full
                    px-4
                    py-2
                    text-left
                    text-sm
                    transition
                    ${
                      dateRange.label === opt.label
                        ? "bg-[#e8f5f4] text-[#039a94] font-medium"
                        : "text-gray-700 hover:bg-gray-50"
                    }
                  `}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

        </div>

      </div>


      {/* ERROR */}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchData}
            className="flex items-center gap-1 text-xs text-red-600 hover:text-red-800 transition"
          >
            <RefreshCw size={13} />
            Retry
          </button>
        </div>
      )}


      {/* =========================================
          TABLE
      ========================================= */}

      <div
        className="
          w-full
          overflow-x-auto
          bg-white
          border
          border-gray-200
          rounded-lg
        "
      >

        <table className="w-full min-w-[700px]">

          {/* TABLE HEADER */}

          <thead>

            <tr className="bg-[#e9e9e9]">

              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700">
                Name
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700">
                Zone
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700">
                Entry
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700">
                Exit
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700">
                Dwell Time
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700">
                Severity
              </th>

            </tr>

          </thead>


          {/* TABLE BODY */}

          <tbody>

            {loading ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-16 text-center"
                >
                  <div className="flex items-center justify-center gap-2 text-gray-400">
                    <Loader2 size={20} className="animate-spin" />
                    <span className="text-sm">Loading entries...</span>
                  </div>
                </td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-16 text-center text-gray-400 text-sm"
                >
                  No entries found for this period
                </td>
              </tr>
            ) : (
              records.map((record, idx) => (

                <tr
                  key={`${record.personId}-${record.entryUtc}-${idx}`}
                  className="
                    border-t
                    border-gray-100
                    hover:bg-gray-50
                    transition
                  "
                >

                  {/* NAME */}

                  <td className="px-5 py-3">

                    <div className="flex items-center gap-3">

                      <div
                        className="
                          w-8
                          h-8
                          rounded-full
                          bg-[#e8f5f4]
                          flex
                          items-center
                          justify-center
                          shrink-0
                        "
                      >
                        <User
                          size={16}
                          strokeWidth={1.8}
                          className="text-[#45b8b3]"
                        />
                      </div>

                      <span className="text-sm text-gray-700">
                        {record.personName || record.personId || "Unknown"}
                      </span>

                    </div>

                  </td>


                  {/* ZONE */}

                  <td className="px-5 py-3">
                    <span className="text-sm text-gray-500">
                      {record.zoneName || record.zoneId || "--"}
                    </span>
                  </td>


                  {/* ENTRY */}

                  <td className="px-5 py-3">
                    <span className="text-sm text-gray-500">
                      {record.entryLocal || formatTime(record.entryUtc)}
                    </span>
                  </td>


                  {/* EXIT */}

                  <td className="px-5 py-3">
                    <span className="text-sm text-gray-500">
                      {record.exitUtc
                        ? (record.exitLocal || formatTime(record.exitUtc))
                        : "--"}
                    </span>
                  </td>


                  {/* DWELL TIME */}

                  <td className="px-5 py-3">
                    <span className="text-sm text-gray-500">
                      {formatDwell(record.dwellMinutes)}
                    </span>
                  </td>


                  {/* SEVERITY */}

                  <td className="px-5 py-3">
                    <SeverityBadge severity={record.severity} />
                  </td>

                </tr>

              ))
            )}

          </tbody>

        </table>

      </div>


      {/* =========================================
          PAGINATION
      ========================================= */}

      {totalPages > 1 && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">

          {/* Previous */}
          <button
            disabled={pageNumber <= 1}
            onClick={() =>
              setPageNumber((p) => Math.max(1, p - 1))
            }
            className="
              w-8
              h-8
              flex
              items-center
              justify-center
              rounded
              text-gray-500
              hover:bg-gray-100
              disabled:opacity-30
              disabled:cursor-not-allowed
              transition
            "
          >
            <ChevronLeft size={16} />
          </button>


          {/* Page numbers */}

          {getPageNumbers().map((p, i) =>
            p === "..." ? (
              <span
                key={`dots-${i}`}
                className="
                  w-8
                  h-8
                  flex
                  items-center
                  justify-center
                  text-xs
                  text-gray-400
                "
              >
                ...
              </span>
            ) : (
              <button
                key={p}
                onClick={() => setPageNumber(p)}
                className={`
                  relative
                  w-8
                  h-8
                  flex
                  items-center
                  justify-center
                  rounded
                  text-sm
                  transition
                  ${
                    pageNumber === p
                      ? "font-medium text-gray-700"
                      : "text-gray-500 hover:bg-gray-100"
                  }
                `}
              >
                {p}

                {pageNumber === p && (
                  <span
                    className="
                      absolute
                      bottom-0
                      left-1/2
                      -translate-x-1/2
                      w-5
                      h-0.5
                      rounded-full
                      bg-[#45b8b3]
                    "
                  />
                )}
              </button>
            )
          )}


          {/* Next */}
          <button
            disabled={pageNumber >= totalPages}
            onClick={() =>
              setPageNumber((p) =>
                Math.min(totalPages, p + 1)
              )
            }
            className="
              w-8
              h-8
              flex
              items-center
              justify-center
              rounded
              text-gray-500
              hover:bg-gray-100
              disabled:opacity-30
              disabled:cursor-not-allowed
              transition
            "
          >
            <ChevronRight size={16} />
          </button>

        </div>
      )}

    </div>
  );
}


// ------------------------------------
// SEVERITY BADGE
// ------------------------------------

function SeverityBadge({ severity }) {
  if (!severity) return <span className="text-sm text-gray-400">--</span>;

  const styles = {
    high: "bg-red-600 text-white",
    medium: "bg-orange-400 text-white",
    low: "bg-emerald-500 text-white",
  };

  const s = severity.toLowerCase();
  const cls = styles[s] || styles.low;

  return (
    <span
      className={`
        inline-block
        rounded-sm
        px-2
        py-1
        text-[10px]
        font-medium
        capitalize
        ${cls}
      `}
    >
      {severity}
    </span>
  );
}
