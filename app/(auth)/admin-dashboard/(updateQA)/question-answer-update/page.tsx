"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useSession } from "next-auth/react";
import { Edit, Trash2, ExternalLink } from "lucide-react"; 
import { motion } from "framer-motion";

// Define types
interface User {
  id: string;
  name: string;
  email: string;
}

interface Answer {
  id: string;
  userId: string;
  questionId: string;
  selectedIdx: string;
  isCorrect: boolean;
  pointsEarned: number;
  user: User;
}

interface Question {
  id: string;
  value: string;
  options: string[];
  amount: number;
  CorrectIdx: number;
  categoryId: string;
  category: {
    id: string;
    name: string;
  };
  Answer: Answer[];
}

export default function QuestionAnswerUpdate() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const router = useRouter();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  // Fetch questions with answers
  const fetchQuestionsWithAnswers = async () => {
    try {
      if (status === "loading") return;
      if (!session || session.user.role !== "ADMIN") {
        setError("You are not authorized to view this page.");
        setLoading(false);
        return;
      }

      const response = await axios.get("/api/admin/questions-answers");
      if (response.data) {
        setQuestions(response.data);
      } else {
        setError("No questions found.");
      }
    } catch (err) {
      console.error("Error fetching question data:", err);
      setError("Failed to load questions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestionsWithAnswers();
  }, [session, status]);

  // Navigate to update page for a specific question
  const handleEditQuestion = (id: string) => {
    router.push(`/admin-dashboard/question-answer-update/${id}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-r from-blue-900 to-blue-600 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Question and Answer Management</h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      ) : error ? (
        <div className="bg-red-500 text-white p-4 rounded-lg mb-6">
          {error}
        </div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {questions.map((question) => (
            <motion.div
              key={question.id}
              variants={itemVariants}
              className="bg-blue-800/80 hover:bg-blue-700 rounded-lg shadow-lg overflow-hidden 
                         transition-all duration-300 transform hover:scale-105 border border-blue-400"
            >
              <div className="p-5 cursor-pointer" onClick={() => handleEditQuestion(question.id)}>
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-semibold mb-2 flex-1">{question.value}</h2>
                  <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {question.amount} pts
                  </span>
                </div>
                
                <div className="mb-4">
                  <h3 className="text-sm text-blue-300 mb-1">Options:</h3>
                  <ul className="space-y-1">
                    {Array.isArray(question.options) ? question.options.map((option, index) => (
                      <li 
                        key={index} 
                        className={`text-sm ${index === question.CorrectIdx ? 'text-green-400 font-bold' : 'text-white'}`}
                      >
                        {index + 1}. {option}
                        {index === question.CorrectIdx && ' ✓'}
                      </li>
                    )) : (
                      <li className="text-sm text-red-400">Options format error</li>
                    )}
                  </ul>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="bg-blue-600 px-2 py-1 rounded text-xs">
                    {question.category?.name || 'No category'}
                  </span>
                  <span className="text-sm">
                    {question.Answer.length} answers
                  </span>
                </div>
              </div>
              
              <div className="bg-blue-900 p-3 flex justify-end">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditQuestion(question.id);
                  }}
                  className="flex items-center text-blue-300 hover:text-white transition-colors duration-300"
                >
                  <Edit size={16} className="mr-1" />
                  Edit
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
} 