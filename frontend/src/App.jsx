import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { fetchCurrentUser } from "./app/slices/authSlice";
import { fetchBookmarks } from "./app/slices/bookmarkSlice";
import {
  addNotification,
  fetchNotifications,
} from "./app/slices/notificationSlice";

import socket from "./services/socket";

import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./components/common/ProtectedRoute";

// Public Pages
import Home from "./pages/Home";
import Properties from "./pages/Properties";
import EmiCalculator from "./pages/EmiCalculator";
import PropertyDetails from "./pages/PropertyDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Unauthorized from "./pages/Unauthorized";

// Dashboard Pages
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import AgentDashboard from "./pages/dashboard/AgentDashboard";
import PropertiesManagement from "./pages/dashboard/PropertiesManagement";
import UsersManagement from "./pages/dashboard/UsersManagement";
import VisitsManagement from "./pages/dashboard/VisitsManagement";
import DeletedUsers from "./pages/dashboard/DeletedUsers";
import AdminProperties from "./pages/dashboard/AdminProperties";
import AdminActivityLog from "./pages/dashboard/AdminActivityLog";
import AdminReports from "./pages/dashboard/AdminReports";

// User Pages
import SavedProperties from "./pages/Bookmarks";
import Chat from "./pages/Chat";
import Notifications from "./pages/Notifications";

function App() {
  const dispatch = useDispatch();

  const { isAuthenticated, initialized } = useSelector((state) => state.auth);

  // Restore login session
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const result = await dispatch(fetchCurrentUser()).unwrap();
        console.log("SESSION RESTORED:", result);
      } catch (error) {
        console.error("SESSION RESTORATION FAILED:", error);
      }
    };

    restoreSession();
  }, [dispatch]);

  // Fetch bookmarks and notifications after authentication
  useEffect(() => {
    if (initialized && isAuthenticated) {
      dispatch(fetchBookmarks());
      dispatch(fetchNotifications());
    }
  }, [dispatch, initialized, isAuthenticated]);

  // Connect Socket.io and listen for notifications
  useEffect(() => {
    if (!initialized) return;

    if (isAuthenticated) {
      const handleNewNotification = (notification) => {
        console.log("NEW NOTIFICATION RECEIVED:", notification);
        dispatch(addNotification(notification));
      };

      socket.on("new_notification", handleNewNotification);
      socket.connect();

      console.log("Socket connection requested");

      return () => {
        socket.off("new_notification", handleNewNotification);
        socket.disconnect();
      };
    }

    socket.disconnect();
  }, [dispatch, initialized, isAuthenticated]);

  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/properties/:id" element={<PropertyDetails />} />
          <Route path="/emi-calculator" element={<EmiCalculator />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Authenticated User Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/bookmarks" element={<SavedProperties />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/notifications" element={<Notifications />} />
          </Route>

          {/* Agent Routes */}
          <Route element={<ProtectedRoute allowedRoles={["agent"]} />}>
            <Route path="/dashboard" element={<AgentDashboard />} />
            <Route
              path="/dashboard/properties"
              element={<PropertiesManagement />}
            />
            <Route path="/dashboard/visits" element={<VisitsManagement />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UsersManagement />} />
            <Route path="/admin/deleted-users" element={<DeletedUsers />} />
            <Route path="/admin/properties" element={<AdminProperties />} />
            <Route path="/admin/activities" element={<AdminActivityLog />} />
            <Route path="/admin/reports" element={<AdminReports />} />
          </Route>
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;
