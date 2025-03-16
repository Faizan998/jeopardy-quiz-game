export interface Blog {
  id: string;
  title: string;
  content: string;
  category: string;
  imageUrl: string;
  created_at: string;
  updated_at: string;
  authorId: string;
  author: {
    name: string;
    email: string;
  };
} 