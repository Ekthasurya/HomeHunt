import api from "./axios";

// GET ADMIN ACTIVITIES
export const getAdminActivities = async (params = {}) => {
  const response = await api.get("/admin/activities", {
    params,
  });

  return response.data;
};