
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function AdminPropertyTypeChart({ data = [] }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <h2 className="mb-5 text-lg font-bold text-gray-900">
        Property Type Distribution
      </h2>

      {data.length === 0 ? (
        <p className="py-12 text-center text-sm text-gray-500">
          No property type data available.
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis
              dataKey="name"
              tick={{ fontSize: 12 }}
            />

            <YAxis allowDecimals={false} />

            <Tooltip />

            <Bar
              dataKey="count"
              fill="#6366f1"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default AdminPropertyTypeChart;
