
import api from "./axios";

// Get all public properties
export const getProperties = async (params = {}) => {
  const response = await api.get("/properties", {
    params: {
      limit: 30,
      ...params,
    },
  });

  return response.data;
};

// Get properties for Agent/Admin dashboard
export const getManagedProperties = async (params = {}) => {
  const response = await api.get("/properties/manage", {
    params: {
      limit: 100,
      ...params,
    },
  });

  return response.data;
};

// Get property by ID
export const getPropertyById = async (propertyId) => {
  const response = await api.get(`/properties/${propertyId}`);
  return response.data;
};

// Create property
export const createProperty = async (propertyData) => {
  const response = await api.post("/properties", propertyData);
  return response.data;
};

// Update property
export const updateProperty = async (propertyId, propertyData) => {
  const response = await api.patch(
    `/properties/${propertyId}`,
    propertyData
  );

  return response.data;
};

// Delete property
export const deleteProperty = async (propertyId) => {
  const response = await api.delete(`/properties/${propertyId}`);
  return response.data;
};



// Upload property images to Cloudinary
export const uploadPropertyImages = async (images) => {
  const formData = new FormData();

  images.forEach((image) => {
    formData.append("images", image);
  });

  const response = await api.post(
    "/properties/upload-images",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};