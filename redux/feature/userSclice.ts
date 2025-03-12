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