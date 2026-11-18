
import {
  Building2,
  CalendarCheck,
  MessageSquare,
  Eye,
} from "lucide-react";

import DashboardLayout from "../../layouts/DashboardLayout";
import StatCard from "../../components/dashboard/StatCard";

function AgentDashboard() {
  const stats = [
    {
      title: "My Properties",
      value: "24",
      change: "+3 this month",
      icon: Building2,
    },
    {
      title: "Total Views",
      value: "8,540",
      change: "+15.2% this month",
      icon: Eye,
    },
    {
      title: "Scheduled Visits",
      value: "18",
      change: "5 upcoming",
      icon: CalendarCheck,
    },
    {
      title: "New Inquiries",
      value: "32",
      change: "+8 this week",
      icon: MessageSquare,
    },
  ];

  const recentInquiries = [
    { name: "Rahul Sharma", property: "Luxury Apartment", date: "18 Nov 2026", status: "New" },
    { name: "Priya Das", property: "Modern Villa", date: "17 Nov 2026", status: "Contacted" },
    { name: "Amit Roy", property: "Family House", date: "16 Nov 2026", status: "New" },
  ];

  return (
    <DashboardLayout role="agent">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Agent Overview
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Track your properties, leads and visits.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-bold text-gray-900">
          Recent Inquiries
        </h2>

        <p className="mb-6 text-sm text-gray-500">
          People interested in your properties.
        </p>

        <div className="space-y-4">
          {recentInquiries.map((inquiry) => (
            <div
              key={inquiry.name}
              className="flex flex-col justify-between gap-3 border-b border-gray-100 pb-4 last:border-0 sm:flex-row sm:items-center"
            >
              <div>
                <h3 className="font-semibold text-gray-900">
                  {inquiry.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {inquiry.property}
                </p>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-gray-500">
                  {inquiry.date}
                </span>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    inquiry.status === "New"
                      ? "bg-blue-50 text-blue-700"
                      : "bg-green-50 text-green-700"
                  }`}
                >
                  {inquiry.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default AgentDashboard;
