<<<<<<< HEAD
// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import axios from "axios";
=======
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
>>>>>>> f36b59a92228e1c92da773728ba55f9e12a14bfa

interface Answer {
  id: string;
  text: string;
  correct: boolean;
}

<<<<<<< HEAD
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
=======
interface Question {
  id: string;
  text: string;
  answers: Answer[];
  points?: number; // Added dynamically
}

interface QuestionState {
  questions: Question[];
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

export const fetchQuestions = createAsyncThunk<Question[], void, { rejectValue: string }>(
  "questions/fetchQuestions",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/questions", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch questions");
      }

      const data = await response.json();
      return Array.isArray(data) ? data : data.data; // Adjust based on API response
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Unknown error");
    }
  }
);

const questionSlice = createSlice({
  name: "question",
  initialState,
  reducers: {
    openQuestion: (state, action) => {
      state.selectedQuestionId = action.payload.id;
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
      .addCase(fetchQuestions.rejected, (state, action) => {
        state.loading = false;
        console.error("Fetch questions failed:", action.payload);
        state.questions = []; // Ensure it stays an array
      });
  },
});

export const { openQuestion, closeQuestion, updateScore } = questionSlice.actions;
export default questionSlice.reducer;
>>>>>>> f36b59a92228e1c92da773728ba55f9e12a14bfa
