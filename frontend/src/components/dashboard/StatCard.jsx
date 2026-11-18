
import { TrendingUp } from "lucide-react";

function StatCard({ title, value, change, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <h3 className="mt-2 text-2xl font-bold text-gray-900">
            {value}
          </h3>
        </div>

        <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
          <Icon size={24} />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-sm text-green-600">
        <TrendingUp size={16} />
        <span>{change}</span>
      </div>
    </div>
  );
}

export default StatCard;
