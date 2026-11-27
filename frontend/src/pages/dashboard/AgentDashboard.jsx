
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  Building2,
  CalendarCheck,
  MessageSquare,
  Eye,
  Star,
} from "lucide-react";

import DashboardLayout from "../../layouts/DashboardLayout";
import StatCard from "../../components/dashboard/StatCard";
import { getAgentDashboard } from "../../services/api/agentDashboardApi";

import PropertyViewsChart from "../../components/dashboard/PropertyViewsChart";
import PropertyStatusChart from "../../components/dashboard/PropertyStatusChart";

function AgentDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getAgentDashboard();

        if (isMounted) {
          setDashboardData(response);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err.response?.data?.message ||
              "Unable to load dashboard data."
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

  const stats = [
    {
      title: "My Properties",
      value: statsData.totalProperties ?? 0,
      change: "All your properties",
      icon: Building2,
    },
    {
      title: "Total Views",
      value: (statsData.totalViews ?? 0).toLocaleString("en-IN"),
      change: "Across your properties",
      icon: Eye,
    },
    {
      title: "Scheduled Visits",
      value: statsData.scheduledVisits ?? 0,
      change: "Upcoming visits",
      icon: CalendarCheck,
    },
    {
      title: "New Inquiries",
      value: statsData.newInquiries ?? 0,
      change: "Unread buyer messages",
      icon: MessageSquare,
    },
    {
      title: "Average Rating",
      value: Number(statsData.averageRating ?? 0).toFixed(1),
      change: "Customer satisfaction",
      icon: Star,
    },
    {
      title: "Total Reviews",
      value: statsData.totalReviews ?? 0,
      change: "Across your properties",
      icon: MessageSquare,
    },
  ];

  const recentInquiries = dashboardData?.recentInquiries || [];
  const upcomingVisits = dashboardData?.upcomingVisits || [];
  const recentReviews = dashboardData?.recentReviews || [];
  const topViewedProperties = dashboardData?.topViewedProperties || [];

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <DashboardLayout role="agent">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Agent Overview
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Track your properties, leads, visits and customer feedback.
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

          {/* Analytics Charts */}
          <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
            <PropertyViewsChart
              properties={topViewedProperties}
            />

            <PropertyStatusChart
              stats={statsData}
            />
          </div>

          {/* Top Viewed Properties */}
          <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-900">
                Top Viewed Properties
              </h2>

              <p className="text-sm text-gray-500">
                Your most popular property listings based on views.
              </p>
            </div>

            {topViewedProperties.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-500">
                No property analytics available yet.
              </p>
            ) : (
              <div className="space-y-4">
                {topViewedProperties.map((property, index) => {
                  const image = property.images?.[0]?.url;

                  return (
                    <div
                      key={property._id}
                      className="flex flex-col gap-4 rounded-xl border border-gray-100 p-4 sm:flex-row sm:items-center"
                    >
                      {/* Property Image */}
                      <div className="h-24 w-full overflow-hidden rounded-lg bg-gray-100 sm:w-32">
                        {image ? (
                          <img
                            src={image}
                            alt={property.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Building2
                              size={30}
                              className="text-gray-400"
                            />
                          </div>
                        )}
                      </div>

                      {/* Property Details */}
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                            #{index + 1} Most Viewed
                          </span>
                        </div>

                        <h3 className="truncate font-semibold text-gray-900">
                          {property.title}
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                          {property.location?.city || "Location unavailable"}
                          {property.location?.state
                            ? `, ${property.location.state}`
                            : ""}
                        </p>

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-gray-800">
                            ₹{Number(property.price || 0).toLocaleString("en-IN")}
                          </span>

                          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs capitalize text-gray-600">
                            {property.listingType || "Property"}
                          </span>

                          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs capitalize text-gray-600">
                            {property.status || "available"}
                          </span>
                        </div>
                      </div>

                      {/* View Count */}
                      <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-3 sm:flex-col sm:gap-1">
                        <Eye size={20} className="text-blue-600" />

                        <span className="text-lg font-bold text-blue-700">
                          {Number(property.views || 0).toLocaleString("en-IN")}
                        </span>

                        <span className="text-xs text-blue-600">
                          Views
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Inquiries */}
          <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6">
            {/* Heading */}
            <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Recent Inquiries
                </h2>

                <p className="text-sm text-gray-500">
                  People interested in your properties.
                </p>
              </div>

              <Link
                to="/chat"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#006A4E] transition hover:text-[#00543E]"
              >
                <MessageSquare size={17} />
                View All Messages
              </Link>
            </div>

            {recentInquiries.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-500">
                No inquiries available yet.
              </p>
            ) : (
              <div className="space-y-2">
                {recentInquiries.map((inquiry) => {
                  const lastMessage = inquiry.lastMessage;
                  const sender = lastMessage?.sender;

                  const isUnread =
                    sender?.role === "buyer" &&
                    lastMessage?.isRead === false;

                  const status = isUnread
                    ? "Unread"
                    : sender?.role === "agent"
                      ? "Replied"
                      : "Read";

                  return (
                    <Link
                      to={`/chat?conversationId=${inquiry._id}`}
                      key={inquiry._id}
                      className="flex flex-col justify-between gap-3 rounded-xl border-b border-gray-100 p-4 transition hover:bg-gray-50 sm:flex-row sm:items-center last:border-0"
                    >
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {inquiry.buyer?.name || "Unknown Buyer"}
                        </h3>

                        <p className="text-sm text-gray-500">
                          {inquiry.property?.title || "General inquiry"}
                        </p>

                        {lastMessage?.text && (
                          <p className="mt-1 max-w-md truncate text-xs text-gray-400">
                            {lastMessage.text}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm text-gray-500">
                          {formatDate(inquiry.lastMessageAt)}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            status === "Unread"
                              ? "bg-blue-50 text-blue-700"
                              : status === "Replied"
                                ? "bg-green-50 text-green-700"
                                : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {status}
                        </span>

                        <MessageSquare
                          size={18}
                          className="shrink-0 text-[#006A4E]"
                        />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Customer Reviews */}
          <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-900">
                Recent Customer Reviews
              </h2>

              <p className="text-sm text-gray-500">
                Feedback received on your properties.
              </p>
            </div>

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
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {review.buyer?.name || "Anonymous Buyer"}
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                          {review.property?.title || "Property"}
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

          {/* Upcoming Visits */}
          <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-bold text-gray-900">
              Upcoming Visits
            </h2>

            <p className="mb-6 text-sm text-gray-500">
              Your next scheduled property visits.
            </p>

            {upcomingVisits.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-500">
                No upcoming visits.
              </p>
            ) : (
              <div className="space-y-4">
                {upcomingVisits.map((visit) => (
                  <div
                    key={visit._id}
                    className="flex flex-col justify-between gap-3 border-b border-gray-100 pb-4 last:border-0 sm:flex-row sm:items-center"
                  >
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {visit.property?.title || "Property"}
                      </h3>

                      <p className="text-sm text-gray-500">
                        Buyer: {visit.buyer?.name || "Unknown"}
                      </p>
                    </div>

                    <div className="text-sm text-gray-500">
                      <p>{formatDate(visit.visitDate)}</p>
                      <p>{visit.visitTime || "Time unavailable"}</p>
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

export default AgentDashboard;
