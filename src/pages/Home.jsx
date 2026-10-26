import {
  CalendarDays,
  ChevronDown,
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

// ------------------------------------
// DATA
// ------------------------------------

const occupancyData = [
  { time: "8:00", count: 155 },
  { time: "8:30", count: 158 },
  { time: "9:00", count: 157 },
  { time: "9:30", count: 160 },
  { time: "10:00", count: 162 },
  { time: "10:30", count: 160 },
  { time: "11:00", count: 165 },
  { time: "11:30", count: 168 },
  { time: "12:00", count: 170 },
  { time: "12:30", count: 165 },
  { time: "13:00", count: 168 },
  { time: "13:30", count: 180 },
  { time: "14:00", count: 182 },
  { time: "14:30", count: 176 },
  { time: "15:00", count: 180 },
  { time: "15:30", count: 177 },
  { time: "16:00", count: 185 },
  { time: "16:30", count: 190 },
  { time: "17:00", count: 188 },
  { time: "17:30", count: 195 },
  { time: "18:00", count: 200 },
];

const demographicData = [
  { time: "8:00", male: 175, female: 135 },
  { time: "8:30", male: 180, female: 138 },
  { time: "9:00", male: 178, female: 140 },
  { time: "9:30", male: 182, female: 142 },
  { time: "10:00", male: 185, female: 145 },
  { time: "10:30", male: 183, female: 143 },
  { time: "11:00", male: 188, female: 147 },
  { time: "11:30", male: 190, female: 150 },
  { time: "12:00", male: 195, female: 152 },
  { time: "12:30", male: 190, female: 150 },
  { time: "13:00", male: 192, female: 153 },
  { time: "13:30", male: 198, female: 155 },
  { time: "14:00", male: 200, female: 157 },
  { time: "14:30", male: 196, female: 155 },
  { time: "15:00", male: 202, female: 158 },
  { time: "15:30", male: 204, female: 160 },
  { time: "16:00", male: 208, female: 162 },
  { time: "16:30", male: 210, female: 164 },
  { time: "17:00", male: 215, female: 166 },
];


// ------------------------------------
// STAT CARD
// ------------------------------------

const StatCard = ({
  title,
  value,
  change,
  positive = true,
}) => {
  return (
    <div className="flex-1 bg-white rounded-lg p-5 border border-gray-100">

      <p className="text-sm font-medium text-gray-600">
        {title}
      </p>

      <p className="mt-2 text-2xl font-semibold text-gray-900">
        {value}
      </p>

      <p
        className={`mt-2 text-xs ${
          positive
            ? "text-emerald-500"
            : "text-red-400"
        }`}
      >
        {positive ? "↗" : "↘"} {change}
      </p>

    </div>
  );
};


// ------------------------------------
// OCCUPANCY CHART
// ------------------------------------

const OccupancyChart = () => {
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

        <ResponsiveContainer width="100%" height="100%">

          <AreaChart
            data={occupancyData}
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
              dataKey="time"
              tick={{
                fontSize: 11,
                fill: "#777",
              }}
              tickLine={false}
              axisLine={false}
              interval={2}
            />

            <YAxis
              tick={{
                fontSize: 11,
                fill: "#777",
              }}
              tickLine={false}
              axisLine={false}
              domain={[0, 250]}
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
              dataKey="count"
              stroke="#55aeb0"
              strokeWidth={2}
              fill="url(#occupancyGradient)"
            />

          </AreaChart>

        </ResponsiveContainer>

      </div>

      <div className="text-center text-xs text-gray-400">
        Time
      </div>

    </div>
  );
};


// ------------------------------------
// DEMOGRAPHIC DONUT
// ------------------------------------

const DemographicDonut = () => {

  const data = [
    {
      name: "Male",
      value: 55,
    },
    {
      name: "Female",
      value: 45,
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-100 p-5 h-full">

      <h3 className="text-sm font-medium text-gray-800">
        Chart of Demographics
      </h3>

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
            100%
          </span>

        </div>

      </div>

      <div className="space-y-3">

        <div className="flex items-center gap-2 text-xs text-gray-600">

          <span className="w-2.5 h-2.5 rounded-full bg-[#76b9b8]" />

          <span className="font-semibold">
            55%
          </span>

          <span>
            Males
          </span>

        </div>

        <div className="flex items-center gap-2 text-xs text-gray-600">

          <span className="w-2.5 h-2.5 rounded-full bg-[#c4e3e2]" />

          <span className="font-semibold">
            45%
          </span>

          <span>
            Females
          </span>

        </div>

      </div>

    </div>
  );
};


// ------------------------------------
// DEMOGRAPHIC ANALYSIS
// ------------------------------------

const DemographicAnalysis = () => {

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

        <ResponsiveContainer
          width="100%"
          height="100%"
        >

          <LineChart
            data={demographicData}
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
              dataKey="time"
              tick={{
                fontSize: 10,
                fill: "#777",
              }}
              tickLine={false}
              axisLine={false}
              interval={2}
            />

            <YAxis
              tick={{
                fontSize: 10,
                fill: "#777",
              }}
              tickLine={false}
              axisLine={false}
              domain={[0, 330]}
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
              stroke="#76b9b8"
              strokeWidth={2}
              dot={false}
            />

            <Line
              type="monotone"
              dataKey="female"
              stroke="#b9dddd"
              strokeWidth={2}
              dot={false}
            />

          </LineChart>

        </ResponsiveContainer>

      </div>

      <div className="text-center text-xs text-gray-400">
        Time
      </div>

    </div>
  );
};


// ------------------------------------
// MAIN OVERVIEW
// ------------------------------------

const Home = () => {

  return (
    <div className="min-h-full bg-[#f5f7f8] p-6 lg:p-7">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">

        <h1 className="text-xl font-semibold text-gray-800">
          Overview
        </h1>

        <button
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

          Today

          <ChevronDown size={14} />

        </button>

      </div>


      {/* STAT CARDS */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">

        <StatCard
          title="Live Occupancy"
          value="734"
          change="10% More than yesterday"
        />

        <StatCard
          title="Today's Footfall"
          value="2,436"
          change="20% Less than yesterday"
          positive={false}
        />

        <StatCard
          title="Avg Dwell Time"
          value="08min 30sec"
          change="6% More than yesterday"
        />

      </div>


      {/* OCCUPANCY */}

      <OccupancyChart />


      {/* DEMOGRAPHICS */}

      <div className="mt-6">

        <h2 className="text-base font-medium text-gray-800 mb-3">
          Demographics
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">

          <DemographicDonut />

          <DemographicAnalysis />

        </div>

      </div>

    </div>
  );
};

export default Home;