
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Home,
  CalendarDays,
  MessageCircle,
  Settings,
  BellOff,
} from "lucide-react";

import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  removeNotification,
} from "../app/slices/notificationSlice";

const notificationIcons = {
  new_message: MessageCircle,
  visit_request: CalendarDays,
  visit_confirmed: CalendarDays,
  visit_rejected: CalendarDays,
  visit_cancelled: CalendarDays,
  system: Settings,
};

const iconColors = {
  new_message: "bg-blue-100 text-blue-600",
  visit_request: "bg-green-100 text-green-600",
  visit_confirmed: "bg-green-100 text-green-600",
  visit_rejected: "bg-red-100 text-red-600",
  visit_cancelled: "bg-orange-100 text-orange-600",
  system: "bg-purple-100 text-purple-600",
};

const formatTime = (date) => {
  if (!date) return "";

  const notificationDate = new Date(date);

  if (Number.isNaN(notificationDate.getTime())) return "";

  return notificationDate.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

export default function Notifications() {
  const dispatch = useDispatch();

  const {
    notifications,
    unreadCount,
    loading,
    error,
  } = useSelector((state) => state.notifications);

  const [filter, setFilter] = useState("all");

  // Fetch notifications from MongoDB
  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const filteredNotifications = notifications.filter((item) => {
    if (filter === "unread") return !item.isRead;
    if (filter === "read") return item.isRead;
    return true;
  });

  // Mark one notification as read
  const markAsRead = (id) => {
    dispatch(markNotificationRead(id));
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    dispatch(markAllNotificationsRead());
  };

  // Delete one notification
  const deleteNotification = (id) => {
    dispatch(removeNotification(id));
  };

  const getNotificationIcon = (type) => {
    return notificationIcons[type] || Settings;
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <Link
              to="/"
              className="text-sm text-gray-500 hover:text-blue-600"
            >
              Home / Notifications
            </Link>

            <h1 className="mt-2 text-3xl font-bold text-gray-900">
              Notifications
            </h1>

            <p className="mt-2 text-gray-500">
              Stay updated with your HomeHunt activity.
            </p>
          </div>

          <button
            onClick={markAllAsRead}
            disabled={unreadCount === 0 || loading}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50"
          >
            <CheckCheck size={17} />
            Mark all read
          </button>
        </div>

        {/* Summary */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Bell size={21} />
            </div>

            <p className="text-sm text-gray-500">
              Total Notifications
            </p>

            <h2 className="mt-1 text-2xl font-bold text-gray-900">
              {notifications.length}
            </h2>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
              <Bell size={21} />
            </div>

            <p className="text-sm text-gray-500">
              Unread Notifications
            </p>

            <h2 className="mt-1 text-2xl font-bold text-gray-900">
              {unreadCount}
            </h2>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">
              <Check size={21} />
            </div>

            <p className="text-sm text-gray-500">
              Read Notifications
            </p>

            <h2 className="mt-1 text-2xl font-bold text-gray-900">
              {Math.max(0, notifications.length - unreadCount)}
            </h2>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            {[
              { label: "All", value: "all" },
              { label: "Unread", value: "unread" },
              { label: "Read", value: "read" },
            ].map((item) => (
              <button
                key={item.value}
                onClick={() => setFilter(item.value)}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  filter === item.value
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <span className="text-sm text-gray-500">
            {filteredNotifications.length} notifications
          </span>
        </div>

        {/* Notification List */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">

          {loading ? (
            <div className="py-16 text-center text-gray-500">
              Loading notifications...
            </div>
          ) : error ? (
            <div className="px-6 py-16 text-center">
              <p className="font-semibold text-red-500">{error}</p>

              <button
                onClick={() => dispatch(fetchNotifications())}
                className="mt-4 font-semibold text-blue-600 hover:underline"
              >
                Try again
              </button>
            </div>
          ) : filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => {
              const Icon = getNotificationIcon(notification.type);

              return (
                <div
                  key={notification._id}
                  className={`flex flex-col gap-4 border-b border-gray-100 p-5 transition last:border-0 sm:flex-row sm:items-start ${
                    !notification.isRead
                      ? "bg-blue-50/50"
                      : "bg-white"
                  }`}
                >
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                      iconColors[notification.type] ||
                      "bg-gray-100 text-gray-600"
                    }`}
                  >
                    <Icon size={22} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-gray-900">
                        {notification.title}
                      </h3>

                      {!notification.isRead && (
                        <span className="h-2 w-2 rounded-full bg-blue-600" />
                      )}
                    </div>

                    <p className="mt-1 text-sm leading-6 text-gray-600">
                      {notification.message}
                    </p>

                    <p className="mt-2 text-xs text-gray-400">
                      {formatTime(notification.createdAt)}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    {!notification.isRead && (
                      <button
                        onClick={() => markAsRead(notification._id)}
                        title="Mark as read"
                        className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                      >
                        <Check size={18} />
                      </button>
                    )}

                    <button
                      onClick={() =>
                        deleteNotification(notification._id)
                      }
                      title="Delete notification"
                      className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <BellOff size={30} className="text-gray-400" />
              </div>

              <h3 className="text-lg font-bold text-gray-900">
                No notifications found
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                {notifications.length === 0
                  ? "You're all caught up. New notifications will appear here."
                  : "There are no notifications in this category."}
              </p>

              {notifications.length > 0 && (
                <button
                  onClick={() => setFilter("all")}
                  className="mt-5 font-semibold text-blue-600 hover:underline"
                >
                  View all notifications
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
