
import api from "./axios";

// Get logged-in user's notifications
export const getNotifications = async (params = {}) => {
  const response = await api.get("/notifications", {
    params,
  });

  return response.data;
};

// Mark one notification as read
export const markNotificationAsRead = async (notificationId) => {
  const response = await api.patch(
    `/notifications/${notificationId}/read`
  );

  return response.data;
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async () => {
  const response = await api.patch("/notifications/read-all");

  return response.data;
};

// Delete one notification
export const deleteNotification = async (notificationId) => {
  const response = await api.delete(
    `/notifications/${notificationId}`
  );

  return response.data;
};
