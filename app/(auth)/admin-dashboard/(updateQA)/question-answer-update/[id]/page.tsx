"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useSession } from "next-auth/react";
import { CheckCircle, XCircle, Save, ArrowLeft, Plus, Trash } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import React from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

interface Category {
  id: string;
  name: string;
}

interface Question {
  id: string;
  value: string;
  options: string[];
  amount: number;
  CorrectIdx: number;
  categoryId: string;
  category: Category;
  Answer: Answer[];
}

export default function QuestionDetail({ params }: { params: { id: string } | Promise<{ id: string }> }) {
  // Unwrap params using React.use() if it's a Promise
  const unwrappedParams = params instanceof Promise ? React.use(params) : params;
  const questionId = unwrappedParams.id;
  const [question, setQuestion] = useState<Question | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const router = useRouter();

  // Form state
  const [questionValue, setQuestionValue] = useState<string>("");
  const [amount, setAmount] = useState<number>(0);
  const [options, setOptions] = useState<string[]>(["", "", "", ""]);
  const [correctIdx, setCorrectIdx] = useState<number>(0);
  const [categoryId, setCategoryId] = useState<string>("");
  const [editingAnswers, setEditingAnswers] = useState<Answer[]>([]);

  // Add shuffle function
  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  // Fetch question data
  const fetchQuestionData = async () => {
    try {
      if (status === "loading") return;
      if (!session || session.user.role !== "ADMIN") {
        setError("You are not authorized to view this page.");
        setLoading(false);
        return;
      }

      // Fix: Use the correct API endpoint path with /admin/
      const response = await axios.get(`/api/admin/questions-answers/${questionId}`);
      if (response.data) {
        const questionData = response.data;
        setQuestion(questionData);
        setQuestionValue(questionData.value);
        setAmount(questionData.amount);
        setOptions(Array.isArray(questionData.options) ? questionData.options : []);
        setCorrectIdx(questionData.CorrectIdx);
        setCategoryId(questionData.categoryId);
        setEditingAnswers(questionData.Answer || []);
      } else {
        setError("Question not found.");
      }

      // Fetch categories for dropdown
      const categoriesResponse = await axios.get("/api/user/categories");
      if (categoriesResponse.data) {
        setCategories(categoriesResponse.data);
      }
    } catch (err) {
      console.error("Error fetching question data:", err);
      setError("Failed to load question data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestionData();
  }, [questionId, session, status]);

  // Handle option change
  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  // Handle adding a new option
  const handleAddOption = () => {
    setOptions([...options, ""]);
  };

  // Handle removing an option
  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) {
      setError("A question must have at least 2 options.");
      return;
    }
    
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
    
    // Adjust correctIdx if needed
    if (index === correctIdx) {
      setCorrectIdx(0); // Reset to first option if correct one was removed
    } else if (index < correctIdx) {
      setCorrectIdx(correctIdx - 1); // Decrement if we removed an option before the correct one
    }
  };

  // Save question changes
  const handleSaveQuestion = async () => {
    try {
      setSaving(true);
      setError(null);
      
      if (!questionValue.trim()) {
        toast.error("Question text cannot be empty.");
        setSaving(false);
        return;
      }
      
      if (options.some(option => !option.trim())) {
        toast.error("Options cannot be empty.");
        setSaving(false);
        return;
      }

      // Shuffle the options array
      const shuffledOptions = shuffleArray([...options]);
      
      // Find the new index of the correct answer after shuffling
      const correctAnswer = options[correctIdx];
      const newCorrectIdx = shuffledOptions.findIndex(opt => opt === correctAnswer);
      
      const payload = {
        value: questionValue,
        options: shuffledOptions,
        amount: amount,
        correctIdx: newCorrectIdx,
        categoryId: categoryId,
        answers: editingAnswers.map(answer => ({
          ...answer,
          selectedIdx: shuffledOptions.findIndex(opt => opt === options[Number(answer.selectedIdx)])
        }))
      };
      
      // Fix: Use the correct API endpoint path with /admin/
      const response = await axios.put(`/api/admin/questions-answers/${questionId}`, payload);
      
      if (response.data) {
        setQuestion(response.data);
        toast.success("Question updated successfully!");
      }
    } catch (err) {
      console.error("Error saving question:", err);
      toast.error("Failed to save question.");
    } finally {
      setSaving(false);
    }
  };

  // Go back to list page
  const handleBack = () => {
    router.push("/admin-dashboard/question-answer-update");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-r from-blue-900 to-blue-600">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error && !question) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-blue-900 to-blue-600 text-white p-6">
        <div className="bg-red-500/80 p-4 rounded-lg mb-6 max-w-md text-center">
          {error}
        </div>
        <button 
          onClick={handleBack}
          className="flex items-center bg-blue-700 hover:bg-blue-600 px-4 py-2 rounded-lg transition-colors"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back to Questions
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-r from-blue-900 to-blue-600 text-white p-6">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
      <div className="flex items-center mb-6">
        <button 
          onClick={handleBack}
          className="mr-4 bg-blue-700 hover:bg-blue-600 p-2 rounded-full transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">Edit Question and Answers</h1>
      </div>
      
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-red-500/80 p-3 rounded-lg mb-6 flex items-center"
          >
            <XCircle size={18} className="mr-2" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="bg-blue-800/60 rounded-lg shadow-xl p-6 mb-8 border border-blue-400/40">
        <div className="mb-5">
          <label className="block text-blue-200 mb-2">Question Text</label>
          <textarea
            value={questionValue}
            onChange={(e) => setQuestionValue(e.target.value)}
            className="w-full bg-blue-900/80 text-white rounded-lg p-3 border border-blue-500 focus:border-blue-300 focus:ring focus:ring-blue-300/40"
            rows={3}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
          <div>
            <label className="block text-blue-200 mb-2">Points</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full bg-blue-900/80 text-white rounded-lg p-3 border border-blue-500 focus:border-blue-300 focus:ring focus:ring-blue-300/40"
              min={0}
            />
          </div>
          
          <div>
            <label className="block text-blue-200 mb-2">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-blue-900/80 text-white rounded-lg p-3 border border-blue-500 focus:border-blue-300 focus:ring focus:ring-blue-300/40"
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="text-blue-200">Options</label>
            <button
              onClick={handleAddOption}
              className="bg-blue-700 hover:bg-blue-600 p-1.5 rounded-full transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>
          
          {options.map((option, index) => (
            <div key={index} className="flex items-center mb-2">
              <div className="flex-grow flex items-center bg-blue-900/80 rounded-lg border border-blue-500 overflow-hidden">
                <div 
                  className={`px-3 py-2.5 cursor-pointer ${correctIdx === index ? 'bg-green-600' : 'bg-blue-700 hover:bg-blue-600'}`}
                  onClick={() => setCorrectIdx(index)}
                >
                  {correctIdx === index ? <CheckCircle size={18} /> : index + 1}
                </div>
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  className="w-full bg-transparent text-white p-3 border-none focus:ring-0"
                  placeholder={`Option ${index + 1}`}
                />
              </div>
              
              <button
                onClick={() => handleRemoveOption(index)}
                className="ml-2 text-red-400 hover:text-red-300 p-1.5"
                disabled={options.length <= 2}
              >
                <Trash size={16} />
              </button>
            </div>
          ))}
          <p className="text-xs text-blue-300 mt-1">
            Click on the number to set the correct answer (currently option {correctIdx + 1})
          </p>
        </div>
        
        <button
          onClick={handleSaveQuestion}
          disabled={saving}
          className={`cursor-pointer flex items-center justify-center w-full py-3 rounded-lg text-white font-medium ${
            saving ? 'bg-blue-700 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500'
          } transition-colors`}
        >
          {saving ? (
            <>
              <div className="cursor-pointer animate-spin h-4 w-4 border-2 border-white border-r-transparent rounded-full mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Save size={18} className="mr-2" />
              Save Question
            </>
          )}
        </button>
      </div>
      
      {question && (
        <div className="bg-blue-800/60 rounded-lg shadow-xl p-6 border border-blue-400/40">
          <h2 className="text-xl font-semibold mb-4">Answers ({question.Answer.length})</h2>
          
          {question.Answer.length === 0 ? (
            <p className="text-blue-300 italic">No answers have been submitted for this question yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-blue-700/70 text-left">
                    <th className="py-3 px-4 rounded-tl-lg">User</th>
                    <th className="py-3 px-4">Selected Option</th>
                    <th className="py-3 px-4">Correct</th>
                    <th className="py-3 px-4 rounded-tr-lg">Points Earned</th>
                  </tr>
                </thead>
                <tbody>
                  {question.Answer.map((answer, index) => (
                    <tr 
                      key={answer.id}
                      className={`border-b border-blue-700/50 ${
                        index % 2 === 0 ? 'bg-blue-900/30' : 'bg-blue-900/10'
                      }`}
                    >
                      <td className="py-3 px-4">
                        {answer.user?.name || 'Unknown'} <br />
                        <span className="text-xs text-blue-300">{answer.user?.email || 'No email'}</span>
                      </td>
                      <td className="py-3 px-4">
                        {Array.isArray(question.options) && question.options.length > Number(answer.selectedIdx)
                          ? question.options[Number(answer.selectedIdx)]
                          : `Option ${Number(answer.selectedIdx) + 1}`}
                      </td>
                      <td className="py-3 px-4">
                        {answer.isCorrect ? (
                          <CheckCircle size={20} className="text-green-500" />
                        ) : (
                          <XCircle size={20} className="text-red-500" />
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {answer.pointsEarned}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 