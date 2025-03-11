<<<<<<< HEAD
// import { configureStore } from "@reduxjs/toolkit";
// import questionReducer from "./feature/questionSlice";
// import userReducer from "./feature/userSlice"; // Already in your project

// export const store = configureStore({
//   reducer: {
//     question: questionReducer,
//     user: userReducer,
//   },
// });

// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;
=======
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
>>>>>>> f36b59a92228e1c92da773728ba55f9e12a14bfa
