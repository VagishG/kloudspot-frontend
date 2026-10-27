import {
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";

import {
  CalendarDays,
  ChevronDown,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

import {
  getFootfall,
  getDwell,
  getOccupancy,
  getDemographics,
} from "../api/api";

import { useSite } from "../context/SiteContext";
import { useSocket } from "../context/SocketContext";
import {
  getRangeForDays,
  getComparisonRange,
  percentChange,
  comparisonLabel,
  formatComparison,
  getSiteDateKey,
} from "../utils/dateRange";
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


// ------------------------------------
// STAT CARD
// ------------------------------------

const StatCard = ({
  title,
  value,
  change,
  positive = true,
  loading = false,
}) => {
  return (
    <div className="min-w-0 flex-1 rounded-lg border border-gray-100 bg-white p-4 sm:p-5">

      <p className="text-sm font-medium text-gray-600">
        {title}
      </p>

      {loading ? (
        <div className="mt-2 flex items-center gap-2 text-gray-400">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-sm">Loading...</span>
        </div>
      ) : (
        <>
          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {value ?? "--"}
          </p>

          {change && (
            <p
              className={`mt-2 text-xs ${
                change.startsWith("Same")
                  ? "text-gray-400"
                  : positive
                    ? "text-emerald-500"
                    : "text-red-400"
              }`}
            >
              {change.startsWith("Same")
                ? "•"
                : positive
                  ? "↗"
                  : "↘"}{" "}
              {change}
            </p>
          )}
        </>
      )}

    </div>
  );
};


// ------------------------------------
// OCCUPANCY CHART
// ------------------------------------

const OccupancyChart = ({ data, loading }) => {
  return (
    <div className="min-w-0 rounded-lg border border-gray-100 bg-white p-4 sm:p-5">

      <div className="mb-4 flex items-center justify-between gap-3">

        <h3 className="text-sm font-medium text-gray-800">
          Overall Occupancy
        </h3>

        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span className="w-2 h-2 rounded-full bg-teal-500" />
          Occupancy
        </div>

      </div>

      <div className="h-[240px] sm:h-[280px]">

        {loading ? (
          <div className="h-full flex items-center justify-center text-gray-400">
            <Loader2 size={24} className="animate-spin" />
            <span className="ml-2 text-sm">Loading chart data...</span>
          </div>
        ) : data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm">
            No occupancy data available for this period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">

            <AreaChart
              data={data}
              margin={{
                top: 10,
                right: 10,
                left: 0,
                bottom: 5,
              }}
            >

              <defs>
                <linearGradient
                  id="occupancyGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="#76b9b8"
                    stopOpacity={0.20}
                  />

                  <stop
                    offset="100%"
                    stopColor="#76b9b8"
                    stopOpacity={0.02}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 4"
                stroke="#eeeeee"
              />

              <XAxis
                dataKey="hour"
                tick={{
                  fontSize: 11,
                  fill: "#777",
                }}
                tickLine={false}
                axisLine={false}
                interval={1}
              />

              <YAxis
                tick={{
                  fontSize: 11,
                  fill: "#777",
                }}
                tickLine={false}
                axisLine={false}
                width={40}
              />

              <Tooltip
                contentStyle={{
                  fontSize: "12px",
                  borderRadius: "6px",
                  border: "1px solid #eee",
                }}
              />

              <Area
                type="monotone"
                dataKey="avgOccupancy"
                name="Occupancy"
                stroke="#55aeb0"
                strokeWidth={2}
                fill="url(#occupancyGradient)"
              />

            </AreaChart>

          </ResponsiveContainer>
        )}

      </div>

      <div className="text-center text-xs text-gray-400">
        Time (Hour)
      </div>

    </div>
  );
};


// ------------------------------------
// DEMOGRAPHIC DONUT
// ------------------------------------

const DemographicDonut = ({ maleTotal, femaleTotal, loading }) => {

  const total = maleTotal + femaleTotal;
  const malePct = total > 0 ? Math.round((maleTotal / total) * 100) : 0;
  const femalePct = total > 0 ? 100 - malePct : 0;

  const data = [
    { name: "Male", value: malePct || 0 },
    { name: "Female", value: femalePct || 0 },
  ];

  return (
    <div className="h-full min-w-0 rounded-lg border border-gray-100 bg-white p-4 sm:p-5">

      <h3 className="text-sm font-medium text-gray-800">
        Chart of Demographics
      </h3>

      {loading ? (
        <div className="h-[190px] mt-3 flex items-center justify-center text-gray-400">
          <Loader2 size={24} className="animate-spin" />
        </div>
      ) : (
        <>
          <div className="relative h-[190px] mt-3">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <PieChart>

                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={82}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="white"
                  strokeWidth={3}
                >

                  <Cell fill="#76b9b8" />
                  <Cell fill="#c4e3e2" />

                </Pie>

              </PieChart>

            </ResponsiveContainer>

            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">

              <span className="text-xs text-gray-500">
                Total Crowd
              </span>

              <span className="text-lg font-semibold text-gray-800">
                {total > 0 ? total.toLocaleString() : "--"}
              </span>

            </div>

          </div>

          <div className="space-y-3">

            <div className="flex items-center gap-2 text-xs text-gray-600">

              <span className="w-2.5 h-2.5 rounded-full bg-[#76b9b8]" />

              <span className="font-semibold">
                {malePct}%
              </span>

              <span>
                Males ({maleTotal.toLocaleString()})
              </span>

            </div>

            <div className="flex items-center gap-2 text-xs text-gray-600">

              <span className="w-2.5 h-2.5 rounded-full bg-[#c4e3e2]" />

              <span className="font-semibold">
                {femalePct}%
              </span>

              <span>
                Females ({femaleTotal.toLocaleString()})
              </span>

            </div>

          </div>
        </>
      )}

    </div>
  );
};


// ------------------------------------
// DEMOGRAPHIC ANALYSIS
// ------------------------------------

const DemographicAnalysis = ({ data, loading }) => {

  return (
    <div className="min-w-0 flex-1 rounded-lg border border-gray-100 bg-white p-4 sm:p-5">

      <div className="flex items-center justify-between mb-3">

        <h3 className="text-sm font-medium text-gray-800">
          Demographics Analysis
        </h3>

        <div className="flex items-center gap-5 text-xs text-gray-400">

          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#76b9b8]" />
            Male
          </span>

          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#c4e3e2]" />
            Female
          </span>

        </div>

      </div>

      <div className="h-[220px] sm:h-[260px]">

        {loading ? (
          <div className="h-full flex items-center justify-center text-gray-400">
            <Loader2 size={24} className="animate-spin" />
            <span className="ml-2 text-sm">Loading chart data...</span>
          </div>
        ) : data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm">
            No demographics data available for this period
          </div>
        ) : (
          <ResponsiveContainer
            width="100%"
            height="100%"
          >

            <LineChart
              data={data}
              margin={{
                top: 10,
                right: 10,
                left: 0,
                bottom: 5,
              }}
            >

              <CartesianGrid
                strokeDasharray="3 4"
                stroke="#eeeeee"
              />

              <XAxis
                dataKey="hour"
                tick={{
                  fontSize: 10,
                  fill: "#777",
                }}
                tickLine={false}
                axisLine={false}
                interval={1}
              />

              <YAxis
                tick={{
                  fontSize: 10,
                  fill: "#777",
                }}
                tickLine={false}
                axisLine={false}
                width={40}
              />

              <Tooltip
                contentStyle={{
                  fontSize: "12px",
                  borderRadius: "6px",
                  border: "1px solid #eee",
                }}
              />

              <Line
                type="monotone"
                dataKey="male"
                name="Male"
                stroke="#76b9b8"
                strokeWidth={2}
                dot={false}
              />

              <Line
                type="monotone"
                dataKey="female"
                name="Female"
                stroke="#b9dddd"
                strokeWidth={2}
                dot={false}
              />

            </LineChart>

          </ResponsiveContainer>
        )}

      </div>

      <div className="text-center text-xs text-gray-400">
        Time (Hour)
      </div>

    </div>
  );
};


// ------------------------------------
// ERROR BANNER
// ------------------------------------

const ErrorBanner = ({ message, onRetry }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-center justify-between">
    <div className="flex items-center gap-2 text-red-600 text-sm">
      <AlertCircle size={16} />
      <span>{message}</span>
    </div>
    {onRetry && (
      <button
        onClick={onRetry}
        className="flex items-center gap-1 text-xs text-red-600 hover:text-red-800 transition"
      >
        <RefreshCw size={13} />
        Retry
      </button>
    )}
  </div>
);


// ------------------------------------
// NORMALIZERS
// ------------------------------------

function normalizeOccupancyBuckets(response) {
  const buckets = Array.isArray(response)
    ? response
    : response?.buckets || response?.data || [];

  return buckets.map((bucket) => ({
    hour: bucket.hour ?? bucket.label ?? bucket.time ?? "",
    avgOccupancy: bucket.avgOccupancy ?? bucket.count ?? bucket.value ?? 0,
  }));
}

function normalizeDemographicBuckets(response) {
  const buckets = Array.isArray(response)
    ? response
    : response?.buckets || response?.data || [];

  let maleTotal = 0;
  let femaleTotal = 0;

  const data = buckets.map((bucket) => {
    const male = bucket.male ?? bucket.maleCount ?? 0;
    const female = bucket.female ?? bucket.femaleCount ?? 0;
    maleTotal += male;
    femaleTotal += female;

    return {
      hour: bucket.hour ?? bucket.label ?? bucket.time ?? "",
      male,
      female,
    };
  });

  return { data, maleTotal, femaleTotal };
}

function previousLiveOccupancy(currentBuckets, previousBuckets) {
  if (currentBuckets.length === 0 || previousBuckets.length === 0) {
    return null;
  }

  const latest = currentBuckets[currentBuckets.length - 1];
  const match =
    previousBuckets.find((bucket) => bucket.hour === latest.hour) ||
    previousBuckets[previousBuckets.length - 1];

  return match?.avgOccupancy ?? null;
}


// ------------------------------------
// MAIN OVERVIEW
// ------------------------------------

const Home = () => {

  const { selectedSite } = useSite();
  const { liveOccupancy: socketOccupancy } = useSocket();

  const [dateRange, setDateRange] = useState(dateOptions[0]);
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);

  // API data states
  const [footfall, setFootfall] = useState(null);
  const [dwell, setDwell] = useState(null);
  const [occupancyData, setOccupancyData] = useState([]);
  const [demographicData, setDemographicData] = useState([]);
  const [maleTotal, setMaleTotal] = useState(0);
  const [femaleTotal, setFemaleTotal] = useState(0);
  const [comparisons, setComparisons] = useState({
    footfall: null,
    dwell: null,
    occupancy: null,
  });

  // Loading / error states
  const [statsLoading, setStatsLoading] = useState(true);
  const [occupancyLoading, setOccupancyLoading] = useState(true);
  const [demoLoading, setDemoLoading] = useState(true);
  const [error, setError] = useState(null);

  const requestIdRef = useRef(0);


  // Fetch all analytics data in parallel
  const fetchData = useCallback(async () => {
    if (!selectedSite) return;

    const siteId = selectedSite.siteId;
    const timezone = selectedSite.timezone;
    const now = new Date();
    const currentRange = getRangeForDays(
      dateRange.days,
      timezone,
      now
    );
    const previousRange = getComparisonRange(
      dateRange.days,
      timezone,
      now
    );

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    const cacheKey = `dashboard:${siteId}:${dateRange.days}:${getSiteDateKey(
      timezone,
      now
    )}`;
    const cached = readCache(cacheKey);
    const cachedData = cached?.data || null;

    setError(null);

    if (cachedData) {
      setFootfall(cachedData.footfall ?? null);
      setDwell(cachedData.dwell ?? null);
      setOccupancyData(cachedData.occupancy ?? []);
      setDemographicData(cachedData.demographics?.data ?? []);
      setMaleTotal(cachedData.demographics?.maleTotal ?? 0);
      setFemaleTotal(cachedData.demographics?.femaleTotal ?? 0);
      setComparisons(
        cachedData.comparisons ?? {
          footfall: null,
          dwell: null,
          occupancy: null,
        }
      );
      setStatsLoading(false);
      setOccupancyLoading(false);
      setDemoLoading(false);
    } else {
      setStatsLoading(true);
      setOccupancyLoading(true);
      setDemoLoading(true);
    }

    const [
      footfallRes,
      dwellRes,
      occupancyRes,
      demographicsRes,
      previousFootfallRes,
      previousDwellRes,
      previousOccupancyRes,
    ] = await Promise.allSettled([
      getFootfall({ siteId, ...currentRange }),
      getDwell({ siteId, ...currentRange }),
      getOccupancy({ siteId, ...currentRange }),
      getDemographics({ siteId, ...currentRange }),
      getFootfall({ siteId, ...previousRange }),
      getDwell({ siteId, ...previousRange }),
      getOccupancy({ siteId, ...previousRange }),
    ]);

    if (requestId !== requestIdRef.current) return;

    const currentResults = [
      footfallRes,
      dwellRes,
      occupancyRes,
      demographicsRes,
    ];

    const allCurrentFailed = currentResults.every(
      (result) => result.status === "rejected"
    );

    if (allCurrentFailed) {
      if (!cachedData) {
        setFootfall(null);
        setDwell(null);
        setOccupancyData([]);
        setDemographicData([]);
        setMaleTotal(0);
        setFemaleTotal(0);
        setComparisons({
          footfall: null,
          dwell: null,
          occupancy: null,
        });
        setError("Failed to load dashboard data");
      }
      setStatsLoading(false);
      setOccupancyLoading(false);
      setDemoLoading(false);
      return;
    }

    const footfallValue =
      footfallRes.status === "fulfilled"
        ? footfallRes.value
        : cachedData?.footfall ?? null;
    const dwellValue =
      dwellRes.status === "fulfilled"
        ? dwellRes.value
        : cachedData?.dwell ?? null;

    const occupancy =
      occupancyRes.status === "fulfilled"
        ? normalizeOccupancyBuckets(occupancyRes.value)
        : cachedData?.occupancy ?? [];
    const demographics =
      demographicsRes.status === "fulfilled"
        ? normalizeDemographicBuckets(demographicsRes.value)
        : cachedData?.demographics ?? {
            data: [],
            maleTotal: 0,
            femaleTotal: 0,
          };
    const previousOccupancy = normalizeOccupancyBuckets(
      previousOccupancyRes.status === "fulfilled"
        ? previousOccupancyRes.value
        : []
    );

    const previousFootfall =
      previousFootfallRes.status === "fulfilled"
        ? previousFootfallRes.value?.footfall
        : null;
    const previousDwell =
      previousDwellRes.status === "fulfilled"
        ? previousDwellRes.value?.avgDwellMinutes
        : null;
    const currentLiveOccupancy =
      occupancy.length > 0
        ? occupancy[occupancy.length - 1].avgOccupancy
        : null;

    const comparisons = {
      footfall:
        footfallRes.status === "fulfilled" &&
        previousFootfallRes.status === "fulfilled"
          ? percentChange(footfallValue?.footfall, previousFootfall)
          : cachedData?.comparisons?.footfall ?? null,
      dwell:
        dwellRes.status === "fulfilled" &&
        previousDwellRes.status === "fulfilled"
          ? percentChange(dwellValue?.avgDwellMinutes, previousDwell)
          : cachedData?.comparisons?.dwell ?? null,
      occupancy:
        occupancyRes.status === "fulfilled" &&
        previousOccupancyRes.status === "fulfilled"
          ? percentChange(
              currentLiveOccupancy,
              previousLiveOccupancy(occupancy, previousOccupancy)
            )
          : cachedData?.comparisons?.occupancy ?? null,
    };

    const snapshot = {
      footfall: footfallValue,
      dwell: dwellValue,
      occupancy,
      demographics,
      comparisons,
    };

    setFootfall(snapshot.footfall);
    setDwell(snapshot.dwell);
    setOccupancyData(snapshot.occupancy);
    setDemographicData(snapshot.demographics.data);
    setMaleTotal(snapshot.demographics.maleTotal);
    setFemaleTotal(snapshot.demographics.femaleTotal);
    setComparisons(snapshot.comparisons);
    writeCache(cacheKey, snapshot);

    setStatsLoading(false);
    setOccupancyLoading(false);
    setDemoLoading(false);
  }, [selectedSite, dateRange]);


  useEffect(() => {
    fetchData();
  }, [fetchData]);


  const bucketLiveOccupancy =
    occupancyData.length > 0
      ? occupancyData[occupancyData.length - 1].avgOccupancy
      : null;

  const liveOccupancy =
    socketOccupancy?.count ?? bucketLiveOccupancy;

  const changeScope = comparisonLabel(dateRange.days);
  const footfallComparison = formatComparison(
    comparisons.footfall,
    changeScope
  );
  const dwellComparison = formatComparison(
    comparisons.dwell,
    changeScope
  );
  const occupancyComparison = formatComparison(
    comparisons.occupancy,
    changeScope
  );

  // Format dwell time
  const dwellDisplay = dwell?.avgDwellMinutes
    ? (() => {
        const mins = Math.floor(dwell.avgDwellMinutes);
        const secs = Math.round((dwell.avgDwellMinutes - mins) * 60);
        return `${String(mins).padStart(2, "0")}min ${String(secs).padStart(2, "0")}sec`;
      })()
    : "--";


  return (
    <div className="min-h-full bg-[#f5f7f8] p-4 sm:p-6 lg:p-7">

      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        <h1 className="min-w-0 truncate text-xl font-semibold text-gray-800">
          Overview
          {selectedSite && (
            <span className="ml-2 text-sm font-normal text-gray-400">
              — {selectedSite.name}
            </span>
          )}
        </h1>

        {/* Date Range Picker */}
        <div className="relative shrink-0 self-start sm:self-auto">

          <button
            onClick={() =>
              setDateDropdownOpen((prev) => !prev)
            }
            className="
              h-9
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

            <CalendarDays size={15} />

            {dateRange.label}

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
        <ErrorBanner
          message={error}
          onRetry={fetchData}
        />
      )}


      {/* STAT CARDS */}

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">

        <StatCard
          title="Live Occupancy"
          value={
            liveOccupancy != null
              ? liveOccupancy.toLocaleString()
              : "--"
          }
          change={occupancyComparison}
          positive={(comparisons.occupancy ?? 0) >= 0}
          loading={occupancyLoading && socketOccupancy?.count == null}
        />

        <StatCard
          title={
            dateRange.days === 0
              ? "Today's Footfall"
              : "Footfall"
          }
          value={
            footfall?.footfall != null
              ? footfall.footfall.toLocaleString()
              : "--"
          }
          change={footfallComparison}
          positive={(comparisons.footfall ?? 0) >= 0}
          loading={statsLoading}
        />

        <StatCard
          title="Avg Dwell Time"
          value={dwellDisplay}
          change={dwellComparison}
          positive={(comparisons.dwell ?? 0) >= 0}
          loading={statsLoading}
        />

      </div>


      {/* OCCUPANCY */}

      <OccupancyChart
        data={occupancyData}
        loading={occupancyLoading}
      />


      {/* DEMOGRAPHICS */}

      <div className="mt-6">

        <h2 className="mb-3 text-base font-medium text-gray-800">
          Demographics
        </h2>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">

          <DemographicDonut
            maleTotal={maleTotal}
            femaleTotal={femaleTotal}
            loading={demoLoading}
          />

          <DemographicAnalysis
            data={demographicData}
            loading={demoLoading}
          />

        </div>

      </div>

    </div>
  );
};

export default Home;
