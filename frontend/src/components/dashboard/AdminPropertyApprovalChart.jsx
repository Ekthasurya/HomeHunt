
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = ["#f59e0b", "#16a34a", "#dc2626"];

function AdminPropertyApprovalChart({ data = {} }) {
  const chartData = [
    { name: "Pending", value: data.pending || 0 },
    { name: "Approved", value: data.approved || 0 },
    { name: "Rejected", value: data.rejected || 0 },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <h2 className="mb-5 text-lg font-bold text-gray-900">
        Property Approval Analytics
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

export default AdminPropertyApprovalChart;
