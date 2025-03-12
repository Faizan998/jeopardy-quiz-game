// import { createSlice } from "@reduxjs/toolkit";

// interface UserState {
//   id?: string;
//   email?: string;
//   name?: string;
//   isAuthenticated: boolean;
// }

// const initialState: UserState = {
//   isAuthenticated: false,
// };

// const userSlice = createSlice({
//   name: "user",
//   initialState,
//   reducers: {
//     loginUser: (state, action) => {
//       state.id = action.payload.id;
//       state.email = action.payload.email;
//       state.name = action.payload.name;
//       state.isAuthenticated = true;
//     },
//     logoutUser: (state) => {
//       state.id = undefined;
//       state.email = undefined;
//       state.name = undefined;
//       state.isAuthenticated = false;
//       localStorage.removeItem("token");
//     },
//   },
// });

// export const { loginUser, logoutUser } = userSlice.actions;
// export default userSlice.reducer;
