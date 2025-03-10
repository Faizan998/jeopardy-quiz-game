import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import { fetchQuestionsFromAPI } from "../../utils/api";

interface QuestionState {
  questions: any[];
  selectedQuestionId: string | null;
  loading: boolean;
  score: number;
}

const initialState: QuestionState = {
  questions: [],
  selectedQuestionId: null,
  loading: false,
  score: 0,
};

export const fetchQuestions = createAsyncThunk("questions/fetchQuestions", async () => {
  const response = await fetchQuestionsFromAPI();
  return response;
});

const questionSlice = createSlice({
  name: "question",
  initialState,
  reducers: {
    openQuestion: (state, action) => {
      state.selectedQuestionId = action.payload;
    },
    closeQuestion: (state) => {
      state.selectedQuestionId = null;
    },
    updateScore: (state, action) => {
      state.score += action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuestions.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchQuestions.fulfilled, (state, action) => {
        state.loading = false;
        state.questions = action.payload;
      })
      .addCase(fetchQuestions.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { openQuestion, closeQuestion, updateScore } = questionSlice.actions;

export default questionSlice.reducer;
