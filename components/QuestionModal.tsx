'use client';

import { useState, useEffect } from 'react';
import { Question } from '@prisma/client';

interface QuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: Question | null;
  onSubmitAnswer: (selectedAnswer: number) => void;
}

export default function QuestionModal({
  isOpen,
  onClose,
  question,
  onSubmitAnswer,
}: QuestionModalProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Reset states when question changes
  useEffect(() => {
    setSelectedAnswer(null);
    setIsSubmitted(false);
  }, [question]);

  if (!isOpen || !question) return null;

  const options = question.options as string[];
  const isCorrect = selectedAnswer === question.CorrectIdx;

  const handleSubmit = () => {
    if (selectedAnswer !== null) {
      setIsSubmitted(true);
      setTimeout(() => {
        onSubmitAnswer(selectedAnswer);
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl p-6 max-w-2xl w-full shadow-2xl transform transition-all duration-300 animate-scale-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-white drop-shadow-lg">
            ${question.amount}
          </h2>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-xl text-white mb-8 leading-relaxed">{question.value}</p>

        <div className="space-y-3">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => !isSubmitted && setSelectedAnswer(index)}
              className={`w-full p-4 text-left rounded-xl transition-all duration-300 transform hover:scale-102
                ${selectedAnswer === index
                  ? isSubmitted
                    ? isCorrect
                      ? 'bg-green-500 text-white shadow-lg'
                      : 'bg-red-500 text-white shadow-lg'
                    : 'bg-indigo-500 text-white shadow-lg'
                  : 'bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm'
                }`}
              disabled={isSubmitted}
            >
              {option}
            </button>
          ))}
        </div>

        {!isSubmitted && (
          <button
            onClick={handleSubmit}
            disabled={selectedAnswer === null}
            className="mt-6 w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3 px-4 rounded-xl hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-102 transition-all duration-300 shadow-lg"
          >
            Submit Answer
          </button>
        )}

        {isSubmitted && (
          <div className={`mt-6 p-4 rounded-xl text-center transform transition-all duration-300 animate-fade-in
            ${isCorrect ? 'bg-green-500/20 text-green-200' : 'bg-red-500/20 text-red-200'}`}
          >
            <span className="text-xl font-semibold">
              {isCorrect ? 'Correct!' : 'Incorrect!'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
} 