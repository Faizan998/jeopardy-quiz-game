import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface QuestionState {
  selectedQuestion: {
    question: string;
    options: string[];
    correctAnswer: string;
  } | null;
  selectedAnswer: string | null;
  isCorrect: boolean | null;
}

const initialState: QuestionState = {
  selectedQuestion: null,
  selectedAnswer: null,
  isCorrect: null,
};

const questionSlice = createSlice({
  name: "question",
  initialState,
  reducers: {
    openQuestion: (state, action: PayloadAction<QuestionState["selectedQuestion"]>) => {
      state.selectedQuestion = action.payload;
      state.selectedAnswer = null;
      state.isCorrect = null;
    },
    selectAnswer: (state, action: PayloadAction<string>) => {
      state.selectedAnswer = action.payload;
      state.isCorrect = state.selectedQuestion?.correctAnswer === action.payload;
    },
    closeQuestion: (state) => {
      state.selectedQuestion = null;
      state.selectedAnswer = null;
      state.isCorrect = null;
    },
  },
});

export const { openQuestion, selectAnswer, closeQuestion } = questionSlice.actions;
export default questionSlice.reducer;
