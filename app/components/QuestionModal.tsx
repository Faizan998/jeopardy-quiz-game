import { Question } from '@prisma/client';
import { useState, useEffect } from 'react';

interface QuestionModalProps {
  question: Question;
  onSubmit: (isCorrect: boolean) => void;
  onClose: () => void;
}

export default function QuestionModal({ question, onSubmit, onClose }: QuestionModalProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Reset state when a new question is opened
  useEffect(() => {
    setSelectedAnswer(null);
    setIsSubmitted(false);
  }, [question.id]);

  const handleAnswerSelect = (index: number) => {
    if (!isSubmitted) {
      setSelectedAnswer(index);
    }
  };

  const handleSubmit = () => {
    if (selectedAnswer !== null) {
      setIsSubmitted(true);
      const isCorrect = selectedAnswer === question.CorrectIdx;
      onSubmit(isCorrect);
    }
  };

  const options = question.options as string[];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Question for ${question.amount}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <p className="text-xl mb-6">{question.value}</p>

        <div className="space-y-4">
          {options.map((option: string, index: number) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              className={`w-full p-4 text-left rounded-lg transition-colors
                ${selectedAnswer === index 
                  ? isSubmitted 
                    ? index === question.CorrectIdx 
                      ? 'bg-green-500 text-white' 
                      : 'bg-red-500 text-white'
                    : 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'}`}
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
            className={`mt-6 w-full py-3 rounded-lg text-white font-semibold
              ${selectedAnswer === null 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            Submit Answer
          </button>
        )}
      </div>
    </div>
  );
} 