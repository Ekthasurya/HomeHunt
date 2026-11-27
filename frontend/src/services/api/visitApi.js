
import api from "./axios";

// Schedule a property visit
export const createVisit = async (visitData) => {
  const response = await api.post("/visits", visitData);
  return response.data;
};

// Get logged-in user's visits
export const getMyVisits = async () => {
  const response = await api.get("/visits/my-visits");
  return response.data;
};

// Update visit status
export const updateVisitStatus = async (visitId, status, agentNote = "") => {
  const response = await api.patch(`/visits/${visitId}/status`, {
    status,
    agentNote,
  });

  return response.data;
};

// Cancel a visit
export const cancelVisit = async (visitId) => {
  const response = await api.patch(`/visits/${visitId}/cancel`);
  return response.data;
};
