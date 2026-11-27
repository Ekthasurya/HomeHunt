
import api from "./axios";

// Fetch agent dashboard data
export const getAgentDashboard = async () => {
  const response = await api.get("/agent-dashboard");
  return response.data;
};
