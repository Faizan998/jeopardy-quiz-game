// Jeopardy Question Type
export type JeopardyQuestion = {
  id: string;
  value: string;
  options: string[];
  amount: number;
  CorrectIdx: number;
  categoryId: string;
  isCorrect?: boolean;
  isAnswered?: boolean;
};

// Category Type
export type Category = {
  id: string;
  name: string;
  questions: JeopardyQuestion[];
};

// User Type
export type User = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "USER";
  image?: string;
  totalAmount: number;
};

// Session Type
export type Session = {
  user: User;
  expires: Date;
};

// API Response Types
export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export type AnswerResponse = {
  isCorrect: boolean;
  pointsEarned: number;
  newTotalAmount: number;
};
interface AnsweredQuestion {
  id: string;
  isCorrect: boolean;
}

interface Question {
  id: string;
  value: string;
  options: string[];
  amount: number;
  CorrectIdx: number;
  categoryId: string;
  category: Category; // Included from API response
  isAnswered?: boolean; // Added by API transformation
  isCorrect?: boolean; // Added by API transformation
}

interface GameState {
  categories: Category[];
  questions: Question[];
  selectedQuestion: Question | null;
  isModalOpen: boolean;
  userScore: number;
  answeredQuestions: AnsweredQuestion[];
}

interface JeopardyApiResponse {
  message: string;
  jeopardyData: {
    id: string;
    name: string;
    questions: {
      id: string;
      value: string;
      options: string[];
      amount: number;
      CorrectIdx: number;
      categoryId: string;
      isAnswered: boolean;
      isCorrect: boolean;
      Answer: { id: string; isCorrect: boolean }[];
    }[];
  }[];
}