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
  subscriptionType?: 'NONE' | 'ONE_MONTH' | 'ONE_YEAR' | 'LIFETIME';
  subscriptionTypeEnd?: string;
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

export interface AnsweredQuestion {
  id: string;
  isCorrect: boolean;
}

export interface Question {
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

export interface GameState {
  categories: Category[];
  questions: Question[];
  selectedQuestion: Question | null;
  isModalOpen: boolean;
  userScore: number;
  answeredQuestions: AnsweredQuestion[];
}

export interface JeopardyApiResponse {
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

// app/types.ts (example)
export interface Product {
  id: string;
  categoryId: string;
  title: string;
  description: string;
  imageUrl: string;
  basePrice: number;
  createdAt: string;
  updated_at: string;
  category?: {
    id: string;
    name: string;
    created_at: string;
    updated_at: string;
  };
}

export interface ProductCategory {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export interface Cart {
  items: CartItem[];
}
