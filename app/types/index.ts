// Blog related types
export interface Blog {
  id: string;
  title: string;
  content: string;
  imageUrl: string;
  categoryId: string;
  created_at: string;
  updated_at: string;
  category?: BlogCategory;
}

export interface BlogCategory {
  id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

// Request/Response types
export interface BlogPostData {
  title: string;
  content: string;
  categoryId: string;
  imageUrl: string;
}

export interface ApiResponse<T> {
  message: string;
  data?: T;
  error?: string;
} 