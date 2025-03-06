import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// API Call function
export const fetchQuestions = createAsyncThunk("questions/fetchQuestions", async () => {
  const response = await fetch("/api/questions");
  if (!response.ok) throw new Error("Failed to fetch questions");

  const data = await response.json();
  console.log("Redux Fetched Data:", data); // ✅ Debugging Redux response
  return data.data || []; // ✅ Ensure data is always an array
});

const questionSlice = createSlice({
  name: "question",
  initialState: {
    questions: [],
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuestions.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchQuestions.fulfilled, (state, action) => {
        state.loading = false;
        state.questions = action.payload ?? []; // ✅ Always set an array
      })
      .addCase(fetchQuestions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch questions";
      });
  },
});

export default questionSlice.reducer;
