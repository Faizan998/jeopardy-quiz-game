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
  options: string[];
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
  onAnswerSubmitted?: () => void;
}

const JeopardyBoard: React.FC<JeopardyBoardProps> = ({ categories, onAnswerSubmitted }) => {
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [answeredQuestions, setAnsweredQuestions] = useState<Record<string, boolean>>({});

  const dollarAmounts = [100, 200, 300, 400, 500];

  const uniqueCategories = categories.filter(
    (category, index, self) => index === self.findIndex(c => c.id === category.id)
  ).slice(0, 5);

  const handleQuestionClick = (question: Question) => {
    if (!answeredQuestions[question.id]) {
      setSelectedQuestion(question);
    }
  };

  const handleCloseModal = () => {
    setSelectedQuestion(null);
  };

  const handleAnswerSubmit = (questionId: string, isCorrect: boolean) => {
    setAnsweredQuestions(prev => ({
      ...prev,
      [questionId]: isCorrect
    }));
    setSelectedQuestion(null);
    if (onAnswerSubmitted) {
      onAnswerSubmitted();
    }
  };

  const findQuestion = (categoryId: string, amount: number) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.questions.find(q => q.amount === amount);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-blue-900 p-6 rounded-lg shadow-xl overflow-x-auto"
    >
      <table className="w-full border-collapse border border-blue-500">
        <thead>
          <tr>
            <th className="border border-blue-500 p-4 text-white">$</th>
            {uniqueCategories.map(category => (
              <th key={category.id} className="border border-blue-500 p-4 text-white">
                {category.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dollarAmounts.map(amount => (
            <tr key={amount}>
              <td className="border border-blue-500 p-4 text-white text-center">${amount}</td>
              {uniqueCategories.map(category => {
                const question = findQuestion(category.id, amount);
                const isAnswered = question ? answeredQuestions[question.id] === true : false;
                const isIncorrect = question ? answeredQuestions[question.id] === false : false;

                return (
                  <td 
                    key={`${category.id}-${amount}`} 
                    className={`border border-blue-500 p-4 text-center cursor-pointer 
                      ${isAnswered ? 'bg-green-600' : isIncorrect ? 'bg-red-600' : 'bg-blue-700 hover:bg-blue-500'}`}
                    onClick={() => question && handleQuestionClick(question)}
                  >
                    {question ? (isAnswered ? '✅' : isIncorrect ? '❌' : `$${amount}`) : '-'}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

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