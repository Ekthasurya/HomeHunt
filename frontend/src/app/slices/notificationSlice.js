
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "../../services/api/notificationApi";

// Fetch notifications
export const fetchNotifications = createAsyncThunk(
  "notifications/fetchNotifications",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await getNotifications(params);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch notifications"
      );
    }
  }
);

// Mark one notification as read
export const markNotificationRead = createAsyncThunk(
  "notifications/markRead",
  async (notificationId, { rejectWithValue }) => {
    try {
      const response = await markNotificationAsRead(notificationId);
      return response.notification;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to mark notification as read"
      );
    }
  }
);

// Mark all notifications as read
export const markAllNotificationsRead = createAsyncThunk(
  "notifications/markAllRead",
  async (_, { rejectWithValue }) => {
    try {
      return await markAllNotificationsAsRead();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to mark all as read"
      );
    }
  }
);

// Delete one notification
export const removeNotification = createAsyncThunk(
  "notifications/delete",
  async (notificationId, { rejectWithValue }) => {
    try {
      await deleteNotification(notificationId);
      return notificationId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete notification"
      );
    }
  }
);

const initialState = {
  notifications: [],
  unreadCount: 0,
  pagination: {
    currentPage: 1,
    limit: 20,
    totalNotifications: 0,
    totalPages: 0,
  },
  loading: false,
  error: null,
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,

  reducers: {
    // Add incoming Socket.io notification
    addNotification: (state, action) => {
      const notification = action.payload;

      if (!notification?._id) return;

      const alreadyExists = state.notifications.some(
        (item) => item._id === notification._id
      );

      if (alreadyExists) return;

      state.notifications.unshift(notification);

      if (!notification.isRead) {
        state.unreadCount += 1;
      }

      state.pagination.totalNotifications += 1;
    },

    // Clear notification errors
    clearNotificationError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // Fetch notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.notifications || [];
        state.unreadCount = action.payload.unreadCount || 0;
        state.pagination = action.payload.pagination || initialState.pagination;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Mark one as read
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const updatedNotification = action.payload;

        const notification = state.notifications.find(
          (item) => item._id === updatedNotification._id
        );

        if (notification && !notification.isRead) {
          notification.isRead = true;
          notification.readAt = updatedNotification.readAt;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })

      .addCase(markNotificationRead.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Mark all as read
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.notifications.forEach((notification) => {
          notification.isRead = true;
        });

        state.unreadCount = 0;
      })

      .addCase(markAllNotificationsRead.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Delete notification
      .addCase(removeNotification.fulfilled, (state, action) => {
        const notification = state.notifications.find(
          (item) => item._id === action.payload
        );

        if (notification && !notification.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }

        state.notifications = state.notifications.filter(
          (item) => item._id !== action.payload
        );

        state.pagination.totalNotifications = Math.max(
          0,
          state.pagination.totalNotifications - 1
        );
      })

      .addCase(removeNotification.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const {
  addNotification,
  clearNotificationError,
} = notificationSlice.actions;

export default notificationSlice.reducer;
