// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import axios from "axios";


// // Async function to fetch questions from API
// export const fetchQuestions = createAsyncThunk("questions/fetch", async () => {
//   const res = await axios.get("/api/questions");
//   console.log("res",res);
//   return res.data.data;

// });

// const questionSlice = createSlice({
//   name: "question",
//   initialState: { 
//     questions: [], 
//     selectedQuestion: null, 
//     loading: false, 
//     error: null as string | null
//   },
//   reducers: {
//     openQuestion: (state, action) => {
//       state.selectedQuestion = action.payload;
//     },
//     closeQuestion: (state) => {
//       state.selectedQuestion = null;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchQuestions.pending, (state) => { state.loading = true; })
//       .addCase(fetchQuestions.fulfilled, (state, action) => {
//         state.loading = false;
//         state.questions = action.payload;
//       })
//       .addCase(fetchQuestions.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.error.message ?? null;
//       });
//   },
// });

// export const { openQuestion, closeQuestion } = questionSlice.actions;
// export default questionSlice.reducer;
