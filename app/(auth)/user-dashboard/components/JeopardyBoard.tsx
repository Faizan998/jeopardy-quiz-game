"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

// Dynamically import QuestionModal with no SSR to avoid hydration issues
const QuestionModal = dynamic(() => import('./QuestionModal'), { ssr: false });

interface Question {
  id: string;
  value: string;
  amount: number;
  options: string;
  CorrectIdx: number;
  categoryId: string;
}

interface Category {
  id: string;
  name: string;
  questions: Question[];
}

interface JeopardyBoardProps {
  categories: Category[];
  onAnswerSubmitted?: () => void; // Optional callback for when an answer is submitted
}

const JeopardyBoard: React.FC<JeopardyBoardProps> = ({ categories, onAnswerSubmitted }) => {
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [answeredQuestions, setAnsweredQuestions] = useState<Record<string, boolean>>({});
  
  // Define the dollar amounts for each row
  const dollarAmounts = [100, 200, 300, 400, 500];

  // Filter out duplicate categories based on id
  const uniqueCategories = categories.filter(
    (category, index, self) => 
      index === self.findIndex(c => c.id === category.id)
  ).slice(0, 5); // Limit to 5 categories to fit the grid

  const handleQuestionClick = (question: Question) => {
    // Only allow clicking if the question hasn't been answered yet
    if (!answeredQuestions[question.id]) {
      setSelectedQuestion(question);
    }
  };

  const handleCloseModal = () => {
    setSelectedQuestion(null);
  };

  const handleAnswerSubmit = (questionId: string, isCorrect: boolean) => {
    // Mark the question as answered
    setAnsweredQuestions(prev => ({
      ...prev,
      [questionId]: isCorrect
    }));
    
    // Close the modal
    setSelectedQuestion(null);
    
    // Call the callback if provided
    if (onAnswerSubmitted) {
      onAnswerSubmitted();
    }
  };

  // Find a question for a specific category and amount
  const findQuestion = (categoryId: string, amount: number) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.questions.find(q => q.amount === amount);
  };

  if (uniqueCategories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-white text-xl mb-4"
        >
          No categories available. Please check back later.
        </motion.div>
        <motion.div
          animate={{ 
            rotate: [0, 10, -10, 10, -10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatDelay: 1
          }}
          className="text-yellow-400 text-6xl"
        >
          🎮
        </motion.div>
      </div>
    );
  }

  // Calculate number of columns based on unique categories (plus one for dollar amounts)
  const numColumns = uniqueCategories.length + 1;
  const gridColsClass = `grid-cols-${numColumns > 6 ? 6 : numColumns}`;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-blue-800 to-blue-900 rounded-lg p-6 shadow-xl border border-blue-700"
    >
      <div className={`grid ${gridColsClass} gap-4`}>
        {/* Category Headers */}
        <div className="col-span-1"></div> {/* Empty cell for dollar amounts column */}
        {uniqueCategories.map((category, index) => (
          <motion.div 
            key={category.id} 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gradient-to-br from-blue-700 to-blue-800 text-white text-center p-4 font-bold rounded-t-lg shadow-md border-b-2 border-blue-500"
          >
            <span className="text-lg tracking-wide uppercase">{category.name}</span>
          </motion.div>
        ))}

        {/* Question Grid */}
        {dollarAmounts.map((amount, rowIndex) => (
          <React.Fragment key={amount}>
            {/* Dollar amount column */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: rowIndex * 0.1 }}
              className="bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold text-center p-4 rounded-lg shadow-md flex items-center justify-center"
            >
              <span className="text-xl">${amount}</span>
            </motion.div>
            
            {/* Questions for each category */}
            {uniqueCategories.map((category, colIndex) => {
              const question = findQuestion(category.id, amount);
              const isAnswered = question ? answeredQuestions[question.id] === true : false;
              const isAnsweredIncorrectly = question ? (answeredQuestions[question.id] === false) : false;
              
              // If there's no question for this category and amount, render an empty cell
              if (!question) {
                return (
                  <motion.div 
                    key={`${category.id}-${amount}`} 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ 
                      delay: 0.2 + (rowIndex * 0.05) + (colIndex * 0.05),
                      type: "spring",
                      stiffness: 200,
                      damping: 15
                    }}
                    className="bg-blue-800/50 text-center p-5 rounded-lg opacity-50 cursor-not-allowed"
                  >
                    <div className="flex flex-col items-center justify-center h-full">
                      <span className="text-gray-400">Not Available</span>
                    </div>
                  </motion.div>
                );
              }
              
              return (
                <motion.div 
                  key={`${category.id}-${amount}`} 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ 
                    delay: 0.2 + (rowIndex * 0.05) + (colIndex * 0.05),
                    type: "spring",
                    stiffness: 200,
                    damping: 15
                  }}
                  whileHover={!isAnswered && !isAnsweredIncorrectly ? { 
                    scale: 1.05,
                    boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.5)"
                  } : {}}
                  whileTap={!isAnswered && !isAnsweredIncorrectly ? { scale: 0.95 } : {}}
                  className={`
                    text-center p-5 rounded-lg cursor-pointer transition-all duration-300 shadow-lg
                    ${isAnswered ? 'bg-gradient-to-br from-green-600 to-green-700 text-white border-2 border-green-400' : 
                      isAnsweredIncorrectly ? 'bg-gradient-to-br from-red-600 to-red-700 text-white border-2 border-red-400' : 
                      'bg-gradient-to-br from-blue-600 to-blue-700 text-white hover:from-blue-500 hover:to-blue-600 border border-blue-500'}
                  `}
                  onClick={() => handleQuestionClick(question)}
                >
                  {isAnswered || isAnsweredIncorrectly ? (
                    <div className="flex flex-col items-center justify-center h-full">
                      <span className="text-lg font-bold">{isAnswered ? 'Correct' : 'Incorrect'}</span>
                      <span className="text-sm opacity-80">${amount}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                      <span className="text-2xl font-bold">${amount}</span>
                      <span className="text-xs mt-1 opacity-80">Click to play</span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {/* Question Modal */}
      {selectedQuestion && (
        <QuestionModal
          question={selectedQuestion}
          onClose={handleCloseModal}
          onSubmit={handleAnswerSubmit}
        />
      )}
    </motion.div>
  );
};

export default JeopardyBoard;