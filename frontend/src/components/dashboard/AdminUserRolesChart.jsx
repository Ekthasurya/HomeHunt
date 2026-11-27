
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = ["#2563eb", "#16a34a", "#f59e0b"];

function AdminUserRolesChart({ data = {} }) {
  const chartData = [
    { name: "Buyers", value: data.buyer || 0 },
    { name: "Agents", value: data.agent || 0 },
    { name: "Admins", value: data.admin || 0 },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <h2 className="mb-5 text-lg font-bold text-gray-900">
        User Distribution
      </h2>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData.filter((item) => item.value > 0)}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label
          >
            {chartData
              .filter((item) => item.value > 0)
              .map((item) => (
                <Cell
                  key={item.name}
                  fill={COLORS[chartData.indexOf(item)]}
                />
              ))}
          </Pie>

          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default AdminUserRolesChart;
