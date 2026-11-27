import api from "./axios";

export const exportUsersReport = async (params = {}) => {
  const response = await api.get("/admin/reports/users", {
    params,
    responseType: "blob",
  });

  return response.data;
};

export const exportPropertiesReport = async (params = {}) => {
  const response = await api.get("/admin/reports/properties", {
    params,
    responseType: "blob",
  });

  return response.data;
};

export const exportVisitsReport = async (params = {}) => {
  const response = await api.get("/admin/reports/visits", {
    params,
    responseType: "blob",
  });

  return response.data;
};

export const exportReviewsReport = async (params = {}) => {
  const response = await api.get("/admin/reports/reviews", {
    params,
    responseType: "blob",
  });

  return response.data;
};