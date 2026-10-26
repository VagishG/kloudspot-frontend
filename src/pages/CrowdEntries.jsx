import { CalendarDays } from "lucide-react";

const visitors = [
  {
    name: "Alice Johnson",
    sex: "Female",
    entry: "11:05 AM",
    exit: "--",
    dwellTime: "--",
    image: "https://i.pravatar.cc/100?img=47",
  },
  {
    name: "Brian Smith",
    sex: "Male",
    entry: "11:03 AM",
    exit: "--",
    dwellTime: "--",
    image: "https://i.pravatar.cc/100?img=12",
  },
  {
    name: "Catherine Lee",
    sex: "Female",
    entry: "11:00 AM",
    exit: "--",
    dwellTime: "--",
    image: "https://i.pravatar.cc/100?img=32",
  },
  {
    name: "David Brown",
    sex: "Male",
    entry: "10:50 AM",
    exit: "11:10 AM",
    dwellTime: "00:20",
    image: "https://i.pravatar.cc/100?img=11",
  },
  {
    name: "Eva White",
    sex: "Female",
    entry: "11:20 AM",
    exit: "11:30 AM",
    dwellTime: "00:10",
    image: "https://i.pravatar.cc/100?img=44",
  },
  {
    name: "Frank Green",
    sex: "Male",
    entry: "11:50 AM",
    exit: "12:10 AM",
    dwellTime: "00:20",
    image: "https://i.pravatar.cc/100?img=68",
  },
  {
    name: "Grace Taylor",
    sex: "Female",
    entry: "10:50 AM",
    exit: "11:10 AM",
    dwellTime: "00:20",
    image: "https://i.pravatar.cc/100?img=49",
  },
  {
    name: "Henry Wilson",
    sex: "Male",
    entry: "10:50 AM",
    exit: "11:10 AM",
    dwellTime: "00:20",
    image: "https://i.pravatar.cc/100?img=14",
  },
  {
    name: "Isabella Martinez",
    sex: "Female",
    entry: "10:50 AM",
    exit: "11:10 AM",
    dwellTime: "00:20",
    image: "https://i.pravatar.cc/100?img=25",
  },
  {
    name: "Jack Thompson",
    sex: "Male",
    entry: "10:50 AM",
    exit: "11:10 AM",
    dwellTime: "00:20",
    image: "https://i.pravatar.cc/100?img=15",
  },
  {
    name: "Katherine Anderson",
    sex: "Female",
    entry: "10:50 AM",
    exit: "11:10 AM",
    dwellTime: "00:20",
    image: "https://i.pravatar.cc/100?img=45",
  },
];

export default function Visitors() {
  return (
    <div className="w-full min-h-full bg-[#f7f8fa] p-6 lg:p-7">

      {/* =========================================
          HEADER
      ========================================= */}

      <div className="flex items-center justify-between mb-6">

        <h1 className="text-xl font-semibold text-gray-800">
          Overview
        </h1>

        <button
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
            Today
          </span>
        </button>

      </div>


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
                Sex
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

            </tr>

          </thead>


          {/* TABLE BODY */}

          <tbody>

            {visitors.map((visitor) => (

              <tr
                key={visitor.name}
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

                    <img
                      src={visitor.image}
                      alt={visitor.name}
                      className="
                        w-8
                        h-8
                        rounded-full
                        object-cover
                        shrink-0
                      "
                    />

                    <span className="text-sm text-gray-700">
                      {visitor.name}
                    </span>

                  </div>

                </td>


                {/* SEX */}

                <td className="px-5 py-3">
                  <span className="text-sm text-gray-500">
                    {visitor.sex}
                  </span>
                </td>


                {/* ENTRY */}

                <td className="px-5 py-3">
                  <span className="text-sm text-gray-500">
                    {visitor.entry}
                  </span>
                </td>


                {/* EXIT */}

                <td className="px-5 py-3">
                  <span className="text-sm text-gray-500">
                    {visitor.exit}
                  </span>
                </td>


                {/* DWELL TIME */}

                <td className="px-5 py-3">
                  <span className="text-sm text-gray-500">
                    {visitor.dwellTime}
                  </span>
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>


      {/* =========================================
          PAGINATION
      ========================================= */}

      <div className="flex items-center justify-center gap-6 mt-5">

        {/* Previous */}

        <button
          className="
            text-gray-400
            hover:text-gray-700
            transition
            text-sm
          "
        >
          ‹
        </button>


        {/* Page 1 */}

        <button
          className="
            relative
            px-2
            py-1
            text-sm
            font-medium
            text-gray-700
          "
        >
          1

          <span
            className="
              absolute
              left-1/2
              -translate-x-1/2
              bottom-0
              w-5
              h-0.5
              rounded-full
              bg-[#45b8b3]
            "
          />
        </button>


        {/* More */}

        <button
          className="
            w-7
            h-7
            flex
            items-center
            justify-center
            border
            border-gray-200
            rounded
            text-xs
            text-gray-500
          "
        >
          ...
        </button>


        {/* Page 5 */}

        <button className="text-sm text-gray-500">
          5
        </button>


        {/* Next */}

        <button
          className="
            text-gray-400
            hover:text-gray-700
            transition
            text-sm
          "
        >
          ›
        </button>

      </div>

    </div>
  );
}