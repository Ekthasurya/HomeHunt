
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
  updateUserProfile,
} from "../../services/api/authApi";

// REGISTER
export const register = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      return await registerUser(userData);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Registration failed"
      );
    }
  }
);

// LOGIN
export const login = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      return await loginUser(credentials);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Login failed"
      );
    }
  }
);

// GET CURRENT USER
export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      return await getCurrentUser();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Unable to fetch user"
      );
    }
  }
);

// UPDATE PROFILE
export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      return await updateUserProfile(profileData);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Profile update failed"
      );
    }
  }
);

// LOGOUT
export const logout = createAsyncThunk(
  "auth/logout",
  async () => {
    try {
      return await logoutUser();
    } catch (error) {
      // Local session will still be cleared by the reducer.
      throw error;
    }
  }
);

const authSlice = createSlice({
  name: "auth",

  initialState: {
    user: null,
    isAuthenticated: false,
    loading: false,
    initialized: false,
    error: null,
  },

  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },

    clearAuthSession: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.initialized = true;
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // REGISTER
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.initialized = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // LOGIN
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.initialized = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.initialized = true;
        state.error = action.payload;
      })

      // FETCH CURRENT USER
      .addCase(fetchCurrentUser.pending, (state) => {
        state.error = null;
        state.initialized = false;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isAuthenticated = Boolean(action.payload.user);
        state.initialized = true;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.initialized = true;
      })

      // UPDATE PROFILE
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // LOGOUT
      .addCase(logout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.initialized = true;
      })
      .addCase(logout.rejected, (state) => {
        // Clear local session even if server logout fails.
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.initialized = true;
        state.error = null;
      });
  },
});

export const {
  clearAuthError,
  clearAuthSession
} = authSlice.actions;

export default authSlice.reducer;
