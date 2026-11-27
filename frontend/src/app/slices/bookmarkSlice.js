
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import {
  getBookmarks,
  addBookmark,
  removeBookmark,
} from "../../services/api/bookmarkApi";

import {
  fetchCurrentUser,
  logout,
} from "./authSlice";

// Fetch all bookmarks
export const fetchBookmarks = createAsyncThunk(
  "bookmarks/fetchBookmarks",
  async (_, { rejectWithValue }) => {
    try {
      return await getBookmarks();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch bookmarks"
      );
    }
  }
);

// Add bookmark
export const createBookmark = createAsyncThunk(
  "bookmarks/createBookmark",
  async (propertyId, { rejectWithValue }) => {
    try {
      return await addBookmark(propertyId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add bookmark"
      );
    }
  }
);

// Remove bookmark
export const deleteBookmark = createAsyncThunk(
  "bookmarks/deleteBookmark",
  async (propertyId, { rejectWithValue }) => {
    try {
      await removeBookmark(propertyId);
      return propertyId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to remove bookmark"
      );
    }
  }
);

const getPropertyId = (bookmark) => {
  const property = bookmark?.property;

  return typeof property === "object"
    ? property?._id
    : property;
};

const bookmarkSlice = createSlice({
  name: "bookmarks",

  initialState: {
    bookmarks: [],
    loading: false,
    actionLoading: false,
    error: null,
  },

  reducers: {
    clearBookmarkError: (state) => {
      state.error = null;
    },

    clearBookmarks: (state) => {
      state.bookmarks = [];
      state.loading = false;
      state.actionLoading = false;
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      // Fetch bookmarks
      .addCase(fetchBookmarks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchBookmarks.fulfilled, (state, action) => {
        state.loading = false;
        state.bookmarks = action.payload?.bookmarks || [];
      })

      .addCase(fetchBookmarks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch bookmarks";
      })

      // Add bookmark
      .addCase(createBookmark.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })

      .addCase(createBookmark.fulfilled, (state, action) => {
        state.actionLoading = false;

        const newBookmark = action.payload?.bookmark;

        if (
          newBookmark &&
          !state.bookmarks.some(
            (item) =>
              item._id === newBookmark._id ||
              getPropertyId(item) === getPropertyId(newBookmark)
          )
        ) {
          state.bookmarks.push(newBookmark);
        }
      })

      .addCase(createBookmark.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload || "Failed to add bookmark";
      })

      // Remove bookmark
      .addCase(deleteBookmark.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })

      .addCase(deleteBookmark.fulfilled, (state, action) => {
        state.actionLoading = false;

        state.bookmarks = state.bookmarks.filter(
          (item) => getPropertyId(item) !== action.payload
        );
      })

      .addCase(deleteBookmark.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload || "Failed to remove bookmark";
      })

      // Clear bookmarks when the user logs out
      .addCase(logout.fulfilled, (state) => {
        state.bookmarks = [];
        state.loading = false;
        state.actionLoading = false;
        state.error = null;
      })

      // Clear stale bookmarks if session restoration fails
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.bookmarks = [];
        state.loading = false;
        state.actionLoading = false;
        state.error = null;
      });
  },
});

export const {
  clearBookmarkError,
  clearBookmarks,
} = bookmarkSlice.actions;

export default bookmarkSlice.reducer;
