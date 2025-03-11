<<<<<<< HEAD
// import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// interface UserState {
//   name: string;
//   email: string;
//   token: string | null;
// }

// const initialState: UserState = {
//   name: "",
//   email: "",
//   token: null,
// };

// const userSlice = createSlice({
//   name: "user",
//   initialState,
//   reducers: {
//     setUser: (state, action: PayloadAction<UserState>) => {
//       state.name = action.payload.name;
//       state.email = action.payload.email;
//       state.token = action.payload.token;
//     },
//     logoutUser: (state) => {
//       localStorage.removeItem("token"); // Remove token on logout
//       state.name = "";
//       state.email = "";
//       state.token = null;
//     },
//   },
// });

// export const { setUser, logoutUser } = userSlice.actions;
// export default userSlice.reducer;
=======
import { createSlice } from "@reduxjs/toolkit";

interface UserState {
  id?: string;
  email?: string;
  name?: string;
  isAuthenticated: boolean;
}

const initialState: UserState = {
  isAuthenticated: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    loginUser: (state, action) => {
      state.id = action.payload.id;
      state.email = action.payload.email;
      state.name = action.payload.name;
      state.isAuthenticated = true;
    },
    logoutUser: (state) => {
      state.id = undefined;
      state.email = undefined;
      state.name = undefined;
      state.isAuthenticated = false;
      localStorage.removeItem("token");
    },
  },
});

export const { loginUser, logoutUser } = userSlice.actions;
export default userSlice.reducer;
>>>>>>> f36b59a92228e1c92da773728ba55f9e12a14bfa
