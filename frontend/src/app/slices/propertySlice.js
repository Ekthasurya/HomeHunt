
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import {
  getProperties,
  getPropertyById
} from "../../services/api/propertyApi";

// Fetch properties with server-side pagination and filters
export const fetchProperties = createAsyncThunk(
  "properties/fetchProperties",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await getProperties(params);

      return {
        properties: response.properties,
        pagination: response.pagination
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch properties"
      );
    }
  }
);

// Fetch single property
export const fetchPropertyById = createAsyncThunk(
  "properties/fetchPropertyById",
  async (propertyId, { rejectWithValue }) => {
    try {
      const response = await getPropertyById(propertyId);
      return response.property;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch property details"
      );
    }
  }
);

const propertySlice = createSlice({
  name: "properties",

  initialState: {
    properties: [],

    pagination: {
      currentPage: 1,
      pageSize: 9,
      totalProperties: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPrevPage: false
    },

    selectedProperty: null,
    loading: false,
    detailsLoading: false,
    error: null,
    detailsError: null
  },

  reducers: {
    clearSelectedProperty: (state) => {
      state.selectedProperty = null;
      state.detailsError = null;
    },

    clearPropertyError: (state) => {
      state.error = null;
      state.detailsError = null;
    }
  },

  extraReducers: (builder) => {
    builder

      // Fetch all properties
      .addCase(fetchProperties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchProperties.fulfilled, (state, action) => {
        state.loading = false;

        state.properties = action.payload.properties || [];

        state.pagination = {
          ...state.pagination,
          ...action.payload.pagination
        };
      })

      .addCase(fetchProperties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch single property
      .addCase(fetchPropertyById.pending, (state) => {
        state.detailsLoading = true;
        state.detailsError = null;
      })

      .addCase(fetchPropertyById.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.selectedProperty = action.payload;
      })

      .addCase(fetchPropertyById.rejected, (state, action) => {
        state.detailsLoading = false;
        state.detailsError = action.payload;
      });
  }
});

export const {
  clearSelectedProperty,
  clearPropertyError
} = propertySlice.actions;

export default propertySlice.reducer;
