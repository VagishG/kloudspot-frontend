import React, {
  useState,
  useEffect,
  useCallback,
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
  getTodayRange,
  getDayRange,
} from "../api/api";

import { useSite } from "../context/SiteContext";


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
    <div className="flex-1 bg-white rounded-lg p-5 border border-gray-100">

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
                positive
                  ? "text-emerald-500"
                  : "text-red-400"
              }`}
            >
              {positive ? "↗" : "↘"} {change}
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
    <div className="bg-white rounded-lg border border-gray-100 p-5">

      <div className="flex items-center justify-between mb-4">

        <h3 className="text-sm font-medium text-gray-800">
          Overall Occupancy
        </h3>

        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span className="w-2 h-2 rounded-full bg-teal-500" />
          Occupancy
        </div>

      </div>

      <div className="h-[280px]">

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
    <div className="bg-white rounded-lg border border-gray-100 p-5 h-full">

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
    <div className="flex-1 bg-white rounded-lg border border-gray-100 p-5">

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

      <div className="h-[260px]">

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
// MAIN OVERVIEW
// ------------------------------------

const Home = () => {

  const { selectedSite } = useSite();

  const [dateRange, setDateRange] = useState(dateOptions[0]);
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);

  // API data states
  const [footfall, setFootfall] = useState(null);
  const [dwell, setDwell] = useState(null);
  const [occupancyData, setOccupancyData] = useState([]);
  const [demographicData, setDemographicData] = useState([]);
  const [maleTotal, setMaleTotal] = useState(0);
  const [femaleTotal, setFemaleTotal] = useState(0);

  // Loading / error states
  const [statsLoading, setStatsLoading] = useState(true);
  const [occupancyLoading, setOccupancyLoading] = useState(true);
  const [demoLoading, setDemoLoading] = useState(true);
  const [error, setError] = useState(null);


  // Build time range based on selection
  const getTimeRange = useCallback(() => {
    if (dateRange.days === 0) {
      return getTodayRange();
    }
    if (dateRange.days === 1) {
      return getDayRange(1);
    }
    // Multi-day range
    const now = new Date();
    const start = new Date(now);
    start.setUTCDate(start.getUTCDate() - dateRange.days);
    start.setUTCHours(0, 0, 0, 0);
    return { fromUtc: start.getTime(), toUtc: now.getTime() };
  }, [dateRange]);


  // Fetch all analytics data
  const fetchData = useCallback(async () => {
    if (!selectedSite) return;

    const siteId = selectedSite.siteId;
    const { fromUtc, toUtc } = getTimeRange();

    setError(null);
    setStatsLoading(true);
    setOccupancyLoading(true);
    setDemoLoading(true);

    // Fetch stat cards (footfall + dwell) in parallel
    try {
      const [footfallRes, dwellRes] = await Promise.allSettled([
        getFootfall({ siteId, fromUtc, toUtc }),
        getDwell({ siteId, fromUtc, toUtc }),
      ]);

      if (footfallRes.status === "fulfilled") {
        setFootfall(footfallRes.value);
      }
      if (dwellRes.status === "fulfilled") {
        setDwell(dwellRes.value);
      }
    } catch (err) {
      console.error("Stats fetch error:", err);
      setError("Failed to load statistics");
    } finally {
      setStatsLoading(false);
    }

    // Fetch occupancy chart
    try {
      const occRes = await getOccupancy({ siteId, fromUtc, toUtc });
      // Normalize — API may return { buckets: [...] } or an array directly
      const buckets = Array.isArray(occRes)
        ? occRes
        : occRes?.buckets || occRes?.data || [];

      const formatted = buckets.map((b) => ({
        hour: b.hour ?? b.label ?? b.time ?? "",
        avgOccupancy: b.avgOccupancy ?? b.count ?? b.value ?? 0,
      }));

      setOccupancyData(formatted);
    } catch (err) {
      console.error("Occupancy fetch error:", err);
    } finally {
      setOccupancyLoading(false);
    }

    // Fetch demographics chart
    try {
      const demoRes = await getDemographics({ siteId, fromUtc, toUtc });
      const buckets = Array.isArray(demoRes)
        ? demoRes
        : demoRes?.buckets || demoRes?.data || [];

      let mTotal = 0;
      let fTotal = 0;

      const formatted = buckets.map((b) => {
        const male = b.male ?? b.maleCount ?? 0;
        const female = b.female ?? b.femaleCount ?? 0;
        mTotal += male;
        fTotal += female;
        return {
          hour: b.hour ?? b.label ?? b.time ?? "",
          male,
          female,
        };
      });

      setDemographicData(formatted);
      setMaleTotal(mTotal);
      setFemaleTotal(fTotal);
    } catch (err) {
      console.error("Demographics fetch error:", err);
    } finally {
      setDemoLoading(false);
    }
  }, [selectedSite, getTimeRange]);


  useEffect(() => {
    fetchData();
  }, [fetchData]);


  // Compute live occupancy from the latest occupancy bucket
  const liveOccupancy =
    occupancyData.length > 0
      ? occupancyData[occupancyData.length - 1].avgOccupancy
      : null;

  // Format dwell time
  const dwellDisplay = dwell?.avgDwellMinutes
    ? (() => {
        const mins = Math.floor(dwell.avgDwellMinutes);
        const secs = Math.round((dwell.avgDwellMinutes - mins) * 60);
        return `${String(mins).padStart(2, "0")}min ${String(secs).padStart(2, "0")}sec`;
      })()
    : "--";


  return (
    <div className="min-h-full bg-[#f5f7f8] p-6 lg:p-7">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">

        <h1 className="text-xl font-semibold text-gray-800">
          Overview
          {selectedSite && (
            <span className="text-sm font-normal text-gray-400 ml-2">
              — {selectedSite.name}
            </span>
          )}
        </h1>

        {/* Date Range Picker */}
        <div className="relative">

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">

        <StatCard
          title="Live Occupancy"
          value={
            liveOccupancy != null
              ? liveOccupancy.toLocaleString()
              : "--"
          }
          change={
            footfall?.footfall != null
              ? `Based on ${dateRange.label.toLowerCase()} data`
              : null
          }
          loading={occupancyLoading}
        />

        <StatCard
          title="Today's Footfall"
          value={
            footfall?.footfall != null
              ? footfall.footfall.toLocaleString()
              : "--"
          }
          change={
            footfall?.footfall != null
              ? `Total entries for ${dateRange.label.toLowerCase()}`
              : null
          }
          positive={true}
          loading={statsLoading}
        />

        <StatCard
          title="Avg Dwell Time"
          value={dwellDisplay}
          change={
            dwell?.dwellRecords
              ? `Based on ${dwell.dwellRecords.toLocaleString()} records`
              : null
          }
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

        <h2 className="text-base font-medium text-gray-800 mb-3">
          Demographics
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">

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
