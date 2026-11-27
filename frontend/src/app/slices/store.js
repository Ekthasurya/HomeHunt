
import { configureStore } from "@reduxjs/toolkit";

import propertyReducer from "./propertySlice";
import authReducer from "./authSlice";
import bookmarkReducer from "./bookmarkSlice";
import notificationReducer from "./notificationSlice";
import reviewReducer from "./reviewSlice";

const store = configureStore({
  reducer: {
    properties: propertyReducer,
    auth: authReducer,
    bookmarks: bookmarkReducer,
    notifications: notificationReducer,
    reviews: reviewReducer,
  },
});

export default store;
