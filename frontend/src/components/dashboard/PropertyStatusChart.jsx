
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = ["#2563EB", "#16A34A", "#F59E0B"];

function PropertyStatusChart({
  stats = {},
}) {
  const chartData = [
    {
      name: "Available",
      value: stats.availableProperties || 0,
    },
    {
      name: "Sold",
      value: stats.soldProperties || 0,
    },
    {
      name: "Rented",
      value: stats.rentedProperties || 0,
    },
  ];

  const totalProperties = chartData.reduce(
    (total, item) => total + item.value,
    0
  );

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900">
          Property Status Analytics
        </h2>

        <p className="text-sm text-gray-500">
          Distribution of your property listings.
        </p>
      </div>

      {totalProperties === 0 ? (
        <p className="py-12 text-center text-sm text-gray-500">
          No property status data available yet.
        </p>
      ) : (
        <>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="45%"
                  outerRadius={90}
                  paddingAngle={3}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={COLORS[index]}
                    />
                  ))}
                </Pie>

                <Tooltip />

                <Legend verticalAlign="bottom" />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            {chartData.map((item, index) => (
              <div
                key={item.name}
                className="rounded-lg bg-gray-50 p-3 text-center"
              >
                <div
                  className="mx-auto mb-2 h-2 w-8 rounded-full"
                  style={{ backgroundColor: COLORS[index] }}
                />

                <p className="text-xs text-gray-500">
                  {item.name}
                </p>

                <p className="mt-1 text-lg font-bold text-gray-900">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default PropertyStatusChart;
