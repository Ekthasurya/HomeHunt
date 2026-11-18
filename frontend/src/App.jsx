import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";

import Home from "./pages/Home";
import Properties from "./pages/Properties";
import EmiCalculator from "./pages/EmiCalculator";
import PropertyDetails from "./pages/PropertyDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import AgentDashboard from "./pages/dashboard/AgentDashboard";
import PropertiesManagement from "./pages/dashboard/PropertiesManagement";
import UsersManagement from "./pages/dashboard/UsersManagement";
import VisitsManagement from "./pages/dashboard/VisitsManagement";
import SavedProperties from "./pages/SavedProperties";
import Chat from "./pages/Chat";
import Notifications from "./pages/Notifications";

function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/properties/:id" element={<PropertyDetails />} />
          <Route path="/emi-calculator" element={<EmiCalculator />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/dashboard" element={<AgentDashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route
            path="/dashboard/properties"
            element={<PropertiesManagement />}
          />
          <Route path="/dashboard/users" element={<UsersManagement />} />
          <Route path="/dashboard/visits" element={<VisitsManagement />} />
          <Route path="/bookmarks" element={<SavedProperties />}/>
          <Route path="/chat" element={<Chat />}/>
          <Route path="/notifications" element={<Notifications />}/>

        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;
