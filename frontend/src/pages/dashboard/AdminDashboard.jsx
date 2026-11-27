
import { useEffect, useState } from "react";

import {
  Users,
  Building2,
  CalendarCheck,
  Star,
  MessageSquare,
} from "lucide-react";

import DashboardLayout from "../../layouts/DashboardLayout";
import StatCard from "../../components/dashboard/StatCard";
import { getAdminDashboard } from "../../services/api/adminDashboardApi";

import AdminUserRolesChart from "../../components/dashboard/AdminUserRolesChart";
import AdminPropertyApprovalChart from "../../components/dashboard/AdminPropertyApprovalChart";
import AdminPropertyStatusChart from "../../components/dashboard/AdminPropertyStatusChart";
import AdminPropertyTypeChart from "../../components/dashboard/AdminPropertyTypeChart";

function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getAdminDashboard();

        if (isMounted) {
          setDashboardData(response);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err.response?.data?.message ||
              "Unable to load admin dashboard."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const statsData = dashboardData?.stats || {};
  const analytics = dashboardData?.analytics || {};

  const stats = [
    {
      title: "Total Users",
      value: (statsData.totalUsers ?? 0).toLocaleString("en-IN"),
      change: "Registered users",
      icon: Users,
    },
    {
      title: "Total Properties",
      value: (statsData.totalProperties ?? 0).toLocaleString("en-IN"),
      change: "Platform listings",
      icon: Building2,
    },
    {
      title: "Property Visits",
      value: (statsData.totalVisits ?? 0).toLocaleString("en-IN"),
      change: "Total scheduled visits",
      icon: CalendarCheck,
    },
    {
      title: "Average Rating",
      value: Number(statsData.averageRating ?? 0).toFixed(1),
      change: "Platform satisfaction",
      icon: Star,
    },
    {
      title: "Total Reviews",
      value: (statsData.totalReviews ?? 0).toLocaleString("en-IN"),
      change: "Customer feedback",
      icon: MessageSquare,
    },
  ];

  const recentProperties = dashboardData?.recentProperties || [];
  const recentReviews = dashboardData?.recentReviews || [];
  const topRatedProperties = dashboardData?.topRatedProperties || [];

  const formatPrice = (price) => {
    if (price === undefined || price === null) return "Price unavailable";

    return `₹${Number(price).toLocaleString("en-IN")}`;
  };

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "available":
        return "bg-green-50 text-green-700";
      case "sold":
        return "bg-blue-50 text-blue-700";
      case "rented":
        return "bg-purple-50 text-purple-700";
      case "pending":
        return "bg-yellow-50 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <DashboardLayout role="admin">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Admin Overview
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Manage your HomeHunt platform and monitor performance.
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
          <p className="text-sm text-gray-500">
            Loading dashboard data...
          </p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Dashboard Content */}
      {!loading && !error && dashboardData && (
        <>
          {/* Statistics */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {stats.map((stat) => (
              <StatCard key={stat.title} {...stat} />
            ))}
          </div>

          {/* Admin Analytics */}
          <div className="mt-8">
            <h2 className="mb-6 text-xl font-bold text-gray-900">
              Platform Analytics
            </h2>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              {/* User Distribution */}
              <AdminUserRolesChart
                data={analytics.userRoles || {}}
              />

              {/* Property Approval Analytics */}
              <AdminPropertyApprovalChart
                data={analytics.propertyApprovals || {}}
              />

              {/* Property Status Analytics */}
              <AdminPropertyStatusChart
                data={analytics.propertyStatuses || {}}
              />

              {/* Property Type Analytics */}
              <AdminPropertyTypeChart
                data={analytics.propertyTypes || []}
              />
            </div>
          </div>

          {/* Recent Properties */}
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
            </div>

            {recentProperties.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-500">
                No properties available yet.
              </p>
            ) : (
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
                      <tr
                        key={property._id}
                        className="border-b last:border-0"
                      >
                        <td className="py-4 font-medium text-gray-900">
                          {property.title}
                        </td>

                        <td className="py-4 text-gray-500">
                          {property.location?.city || "Unavailable"}
                        </td>

                        <td className="py-4 text-gray-700">
                          {formatPrice(property.price)}
                        </td>

                        <td className="py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(
                              property.status
                            )}`}
                          >
                            {property.status || "Unknown"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Recent Customer Reviews */}
          <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-bold text-gray-900">
              Recent Customer Reviews
            </h2>

            <p className="mb-6 text-sm text-gray-500">
              Latest feedback across the platform.
            </p>

            {recentReviews.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-500">
                No customer reviews yet.
              </p>
            ) : (
              <div className="space-y-5">
                {recentReviews.map((review) => (
                  <div
                    key={review._id}
                    className="border-b border-gray-100 pb-5 last:border-0 last:pb-0"
                  >
                    <div className="flex flex-col justify-between gap-3 sm:flex-row">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {review.buyer?.name || "Anonymous Buyer"}
                        </h3>

                        <p className="text-sm text-gray-500">
                          {review.property?.title || "Property unavailable"}
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={16}
                            className={
                              star <= review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }
                          />
                        ))}

                        <span className="ml-1 text-sm font-semibold text-gray-700">
                          {review.rating}/5
                        </span>
                      </div>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-gray-600">
                      {review.comment}
                    </p>

                    <p className="mt-2 text-xs text-gray-400">
                      {formatDate(review.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Rated Properties */}
          <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-bold text-gray-900">
              Top Rated Properties
            </h2>

            <p className="mb-6 text-sm text-gray-500">
              Properties with the highest customer ratings.
            </p>

            {topRatedProperties.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-500">
                No rated properties available yet.
              </p>
            ) : (
              <div className="space-y-4">
                {topRatedProperties.map((property) => (
                  <div
                    key={property._id}
                    className="flex flex-col justify-between gap-3 border-b border-gray-100 pb-4 last:border-0 sm:flex-row sm:items-center"
                  >
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {property.title}
                      </h3>

                      <p className="text-sm text-gray-500">
                        {property.location?.city || "Location unavailable"}
                      </p>

                      <p className="mt-1 text-sm text-gray-700">
                        {formatPrice(property.price)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Star
                        size={17}
                        className="fill-yellow-400 text-yellow-400"
                      />

                      <span className="font-semibold text-gray-900">
                        {Number(property.averageRating).toFixed(1)}
                      </span>

                      <span className="text-sm text-gray-500">
                        ({property.totalReviews} reviews)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </DashboardLayout>
  );
}

export default AdminDashboard;
