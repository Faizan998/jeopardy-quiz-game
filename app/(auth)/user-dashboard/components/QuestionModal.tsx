"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

interface Question {
  id: string;
  value: string;
  amount: number;
  options: string | string[];
  CorrectIdx: number;
  categoryId: string;
}

interface QuestionModalProps {
  question: Question;
  onClose: () => void;
  onSubmit: (questionId: string, isCorrect: boolean) => void;
}

interface ApiResponse {
  message: string;
  pointsEarned: number;
  answer: any;
  correctAnswer: string;
  selectedAnswer: string;
  userScore: number;
  category: string;
}

const QuestionModal: React.FC<QuestionModalProps> = ({ question, onClose, onSubmit }) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [result, setResult] = useState<"correct" | "incorrect" | null>(null);
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
  
  // Parse options from comma-separated string
  const parsedOptions = React.useMemo(() => {
    try {
      // Make sure options is a string before trying to split it
      if (typeof question.options === 'string') {
        return question.options.split(',').map((option: string) => option.trim());
      } else if (Array.isArray(question.options)) {
        return question.options.map((option: string) => option.trim());
      } else {
        console.error("Options is neither a string nor an array:", question.options);
        return ["Option A", "Option B", "Option C", "Option D"];
      }
    } catch (e) {
      console.error("Error parsing options:", e);
      return ["Option A", "Option B", "Option C", "Option D"];
    }
  }, [question.options]);
  
  // Timer effect
  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    
    const timer = setTimeout(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [timeLeft]);
  
  const handleOptionSelect = (index: number) => {
    if (isSubmitting || showAnswer) return;
    setSelectedOption(index);
  };
  
  const handleSubmit = async () => {
    if (isSubmitting || showAnswer) return;
    
    setIsSubmitting(true);
    setError("");
    
    try {
      // If time ran out and no option was selected, automatically mark as incorrect
      const isCorrect = selectedOption !== null && selectedOption === question.CorrectIdx;
      
      // Submit the answer to the API
      const response = await axios.post('/api/user/submit-answer', {
        questionId: question.id,
        selectedIdx: selectedOption !== null ? selectedOption.toString() : "-1",
        isCorrect
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Store the API response
      setApiResponse(response.data);
      
      // Show the result
      setResult(isCorrect ? "correct" : "incorrect");
      setShowAnswer(true);
      
      // Wait 2 seconds before closing the modal
      setTimeout(() => {
        // Call the onSubmit callback with the result
        onSubmit(question.id, isCorrect);
      }, 3000); // Increased to 3 seconds to give more time to read the answer
      
    } catch (error: any) {
      console.error('Error submitting answer:', error);
      setError(error.response?.data?.message || 'Failed to submit answer. Please try again.');
      setIsSubmitting(false);
    }
  };
  
  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", bounce: 0.3 }}
          className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-lg p-6 max-w-2xl w-full mx-4 relative shadow-2xl border border-blue-700"
        >
          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          {/* Header with amount and timer */}
          <div className="mb-6 flex justify-between items-center">
            <div className="flex flex-col">
              <motion.div 
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                className="text-yellow-400 font-bold text-2xl px-4 py-2 bg-blue-950 rounded-lg shadow-inner"
              >
                ${question.amount}
              </motion.div>
              <div className="text-blue-300 text-sm mt-2 ml-1">
                Category: {apiResponse?.category || "Loading..."}
              </div>
            </div>
            <div className="relative">
              <svg className="w-16 h-16" viewBox="0 0 100 100">
                <circle 
                  cx="50" 
                  cy="50" 
                  r="45" 
                  fill="none" 
                  stroke="#1e3a8a" 
                  strokeWidth="10" 
                />
                <circle 
                  cx="50" 
                  cy="50" 
                  r="45" 
                  fill="none" 
                  stroke={timeLeft <= 10 ? "#ef4444" : "#3b82f6"} 
                  strokeWidth="10" 
                  strokeDasharray="283"
                  strokeDashoffset={283 - (283 * timeLeft) / 30}
                  transform="rotate(-90 50 50)"
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`font-bold text-xl ${timeLeft <= 10 ? 'text-red-500' : 'text-white'}`}>
                  {timeLeft}
                </span>
              </div>
            </div>
          </div>
          
          {/* Question */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-blue-800 p-6 rounded-lg mb-6 shadow-lg border-l-4 border-blue-500"
          >
            <h3 className="text-white text-xl font-bold mb-3">Question:</h3>
            <p className="text-blue-100 text-xl leading-relaxed">{question.value}</p>
          </motion.div>
          
          {/* Options */}
          <div className="space-y-3 mb-6">
            {parsedOptions.map((option: string, index: number) => (
              <motion.button
                key={index}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className={`w-full text-left p-4 rounded-lg transition-all duration-300 transform hover:scale-102 ${
                  showAnswer && index === question.CorrectIdx
                    ? 'bg-green-500 text-white font-bold shadow-lg'
                    : showAnswer && selectedOption === index && index !== question.CorrectIdx
                    ? 'bg-red-500 text-white font-bold shadow-lg'
                    : selectedOption === index 
                    ? 'bg-yellow-500 text-blue-900 font-bold shadow-md' 
                    : 'bg-blue-700 text-white hover:bg-blue-600 shadow'
                }`}
                onClick={() => handleOptionSelect(index)}
                disabled={isSubmitting || showAnswer}
              >
                <div className="flex items-center">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-900 text-white mr-3">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span>{option}</span>
                </div>
              </motion.button>
            ))}
          </div>
          
          {/* Result animation */}
          {showAnswer && (
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`absolute inset-0 flex items-center justify-center bg-opacity-80 rounded-lg ${
                result === "correct" ? "bg-green-500" : "bg-red-500"
              }`}
            >
              <motion.div 
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center text-white"
              >
                <div className="text-4xl font-bold mb-4">
                  {result === "correct" ? "Correct!" : "Incorrect!"}
                </div>
                {apiResponse && (
                  <div className="text-xl">
                    {result !== "correct" && (
                      <div className="mt-2">
                        The correct answer was: <span className="font-bold">{apiResponse.correctAnswer}</span>
                      </div>
                    )}
                    <div className="mt-2">
                      Points earned: <span className="font-bold">${apiResponse.pointsEarned}</span>
                    </div>
                    <div className="mt-2">
                      Your total score: <span className="font-bold">${apiResponse.userScore}</span>
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
          
          {/* Error message */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-600 text-white p-4 rounded-lg mb-4 shadow-md"
            >
              {error}
            </motion.div>
          )}
          
          {/* Submit button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSubmit}
            disabled={selectedOption === null || isSubmitting || showAnswer}
            className={`w-full py-4 rounded-lg font-bold text-lg transition-all duration-300 ${
              selectedOption === null || isSubmitting || showAnswer
                ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-lg'
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </div>
            ) : 'Submit Answer'}
          </motion.button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default QuestionModal;