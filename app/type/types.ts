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



