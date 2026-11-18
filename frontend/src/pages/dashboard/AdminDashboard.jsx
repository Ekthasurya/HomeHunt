
import {
  Users,
  Building2,
  DollarSign,
  CalendarCheck,
  ArrowUpRight,
} from "lucide-react";

import DashboardLayout from "../../layouts/DashboardLayout";
import StatCard from "../../components/dashboard/StatCard";

function AdminDashboard() {
  const stats = [
    {
      title: "Total Users",
      value: "2,450",
      change: "+12.5% this month",
      icon: Users,
    },
    {
      title: "Total Properties",
      value: "1,280",
      change: "+8.2% this month",
      icon: Building2,
    },
    {
      title: "Total Revenue",
      value: "₹8,45,000",
      change: "+18.4% this month",
      icon: DollarSign,
    },
    {
      title: "Property Visits",
      value: "856",
      change: "+10.3% this month",
      icon: CalendarCheck,
    },
  ];

  const recentProperties = [
    { name: "Luxury Apartment", location: "Kolkata", price: "₹85 Lakh", status: "Approved" },
    { name: "Modern Villa", location: "Bangalore", price: "₹1.2 Cr", status: "Pending" },
    { name: "Family House", location: "Mumbai", price: "₹95 Lakh", status: "Approved" },
  ];

  return (
    <DashboardLayout role="admin">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Admin Overview
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your HomeHunt platform.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Recent Properties
            </h2>
            <p className="text-sm text-gray-500">
              Latest property submissions
            </p>
          </div>

          <button className="flex items-center gap-1 text-sm font-medium text-blue-600">
            View All <ArrowUpRight size={16} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[550px] text-left text-sm">
            <thead>
              <tr className="border-b text-gray-500">
                <th className="pb-3 font-medium">Property</th>
                <th className="pb-3 font-medium">Location</th>
                <th className="pb-3 font-medium">Price</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>

            <tbody>
              {recentProperties.map((property) => (
                <tr key={property.name} className="border-b last:border-0">
                  <td className="py-4 font-medium text-gray-900">
                    {property.name}
                  </td>
                  <td className="py-4 text-gray-500">
                    {property.location}
                  </td>
                  <td className="py-4 text-gray-700">
                    {property.price}
                  </td>
                  <td className="py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        property.status === "Approved"
                          ? "bg-green-50 text-green-700"
                          : "bg-yellow-50 text-yellow-700"
                      }`}
                    >
                      {property.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default AdminDashboard;
