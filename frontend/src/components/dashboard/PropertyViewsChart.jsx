
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function PropertyViewsChart({ properties = [] }) {
  const chartData = properties.map((property) => ({
    name:
      property.title?.length > 15
        ? `${property.title.slice(0, 15)}...`
        : property.title || "Property",
    views: property.views || 0,
  }));

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900">
          Property Views Analytics
        </h2>

        <p className="text-sm text-gray-500">
          Compare views across your top properties.
        </p>
      </div>

      {chartData.length === 0 ? (
        <p className="py-12 text-center text-sm text-gray-500">
          No property view data available yet.
        </p>
      ) : (
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 10,
                right: 15,
                left: 0,
                bottom: 10,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
              />

              <XAxis
                dataKey="name"
                tick={{ fontSize: 11 }}
                interval={0}
              />

              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 12 }}
              />

              <Tooltip
                formatter={(value) => [
                  Number(value).toLocaleString("en-IN"),
                  "Views",
                ]}
              />

              <Bar
                dataKey="views"
                fill="#2563EB"
                radius={[6, 6, 0, 0]}
                maxBarSize={55}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default PropertyViewsChart;
