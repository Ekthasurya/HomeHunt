
import api from "./axios";

// Get all properties with search, filters and pagination
export const getAdminProperties = async (params = {}) => {
  const response = await api.get("/admin/properties", {
    params,
  });

  return response.data;
};

// Approve or reject a property
export const updatePropertyApproval = async (
  propertyId,
  approvalStatus,
  rejectionReason = ""
) => {
  const response = await api.patch(
    `/admin/properties/${propertyId}/approval`,
    {
      approvalStatus,
      rejectionReason,
    }
  );

  return response.data;
};

// Verify or unverify a property
export const updatePropertyVerification = async (
  propertyId,
  isVerified
) => {
  const response = await api.patch(
    `/admin/properties/${propertyId}/verification`,
    {
      isVerified,
    }
  );

  return response.data;
};

// Update property availability
export const updatePropertyStatus = async (
  propertyId,
  status
) => {
  const response = await api.patch(
    `/admin/properties/${propertyId}/status`,
    {
      status,
    }
  );

  return response.data;
};

// Feature or unfeature a property
export const updatePropertyFeatured = async (
  propertyId,
  isFeatured
) => {
  const response = await api.patch(
    `/admin/properties/${propertyId}/featured`,
    {
      isFeatured,
    }
  );

  return response.data;
};
