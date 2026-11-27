import api from "./axios";

// Get all users with search, filters and pagination
export const getAdminUsers = async (params = {}) => {
  const response = await api.get("/admin/users", {
    params,
  });

  return response.data;
};

// Activate or deactivate a user
export const updateAdminUserStatus = async (userId, isActive) => {
  const response = await api.patch(
    `/admin/users/${userId}/status`,
    { isActive }
  );

  return response.data;
};

// Delete a user
export const deleteAdminUser = async (userId) => {
  const response = await api.delete(`/admin/users/${userId}`);

  return response.data;
};



// Get deleted users
export const getDeletedAdminUsers = async (params = {}) => {
  const response = await api.get("/admin/users/deleted", {
    params,
  });

  return response.data;
};

// Restore deleted user
export const restoreAdminUser = async (userId) => {
  const response = await api.patch(
    `/admin/users/${userId}/restore`
  );

  return response.data;
};