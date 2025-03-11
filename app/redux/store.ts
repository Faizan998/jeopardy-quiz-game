import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./feature/userSlice";
import questionReducer from "./feature/questionSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    question: questionReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;