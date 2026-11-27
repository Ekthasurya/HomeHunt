
import api from "./axios";

// Get all bookmarks
export const getBookmarks = async () => {
  const response = await api.get("/bookmarks");
  return response.data;
};

// Add a property to bookmarks
export const addBookmark = async (propertyId) => {
  const response = await api.post(`/bookmarks/${propertyId}`);
  return response.data;
};

// Remove a property from bookmarks
export const removeBookmark = async (propertyId) => {
  const response = await api.delete(`/bookmarks/${propertyId}`);
  return response.data;
};
