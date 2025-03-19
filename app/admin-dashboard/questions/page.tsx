'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Question {
  id: string;
  question: string;
  answer: string;
  category: string;
  points: number;
  difficulty: string;
}

export default function AdminQuestions() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (session?.user?.role !== 'ADMIN') {
      router.push('/user-dashboard');
    } else {
      fetchQuestions();
      fetchCategories();
    }
  }, [status, session, router]);

  const fetchQuestions = async () => {
    try {
      const response = await fetch('/api/questions');
      const data = await response.json();
      setQuestions(data);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data.map((cat: any) => cat.name));
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleUpdateQuestion = async (questionId: string, updatedData: Partial<Question>) => {
    try {
      const response = await fetch(`/api/questions/${questionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        fetchQuestions();
        setEditingQuestion(null);
      }
    } catch (error) {
      console.error('Error updating question:', error);
    }
  };

  if (status === 'loading' || loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (session?.user?.role !== 'ADMIN') {
    return <div className="flex items-center justify-center min-h-screen">Access Denied</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Manage Questions</h1>
      
      <div className="space-y-6">
        {questions.map((question) => (
          <div key={question.id} className="bg-white p-6 rounded-lg shadow">
            {editingQuestion?.id === question.id ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={editingQuestion.question}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, question: e.target.value })}
                  className="w-full p-2 border rounded"
                  placeholder="Question"
                />
                <input
                  type="text"
                  value={editingQuestion.answer}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, answer: e.target.value })}
                  className="w-full p-2 border rounded"
                  placeholder="Answer"
                />
                <select
                  value={editingQuestion.category}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, category: e.target.value })}
                  className="w-full p-2 border rounded"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={editingQuestion.points}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, points: parseInt(e.target.value) })}
                  className="w-full p-2 border rounded"
                  placeholder="Points"
                />
                <select
                  value={editingQuestion.difficulty}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, difficulty: e.target.value })}
                  className="w-full p-2 border rounded"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleUpdateQuestion(question.id, editingQuestion)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingQuestion(null)}
                    className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-bold mb-2">{question.question}</h2>
                <p className="text-gray-600 mb-2">Answer: {question.answer}</p>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    Category: {question.category} | Points: {question.points} | Difficulty: {question.difficulty}
                  </div>
                  <button
                    onClick={() => setEditingQuestion(question)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Edit
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 