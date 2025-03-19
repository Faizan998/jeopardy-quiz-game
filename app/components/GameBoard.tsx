import { useState } from 'react';
import { Question } from '@prisma/client';
import QuestionModal from '@/components/QuestionModal';

interface GameBoardProps {
  categories: string[];
  questions: Question[];
  onScoreUpdate: (newScore: number) => void;
}

interface AnsweredQuestion {
  id: string;
  isCorrect: boolean;
}

export default function GameBoard({ categories, questions, onScoreUpdate }: GameBoardProps) {
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [answeredQuestions, setAnsweredQuestions] = useState<AnsweredQuestion[]>([]);

  const handleQuestionClick = (question: Question) => {
    if (!answeredQuestions.some(aq => aq.id === question.id)) {
      setSelectedQuestion(question);
    }
  };

  const handleAnswerSubmit = (isCorrect: boolean) => {
    if (selectedQuestion) {
      if (isCorrect) {
        onScoreUpdate(selectedQuestion.amount);
      }
      setAnsweredQuestions([...answeredQuestions, { id: selectedQuestion.id, isCorrect }]);
      setSelectedQuestion(null);
    }
  };

  const questionValues = [100, 200, 300, 400, 500];

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="grid grid-cols-6 gap-2">
        {/* Categories Header */}
        {categories.map((category) => (
          <div
            key={category}
            className="bg-blue-600 text-white p-4 text-center font-bold rounded-t-lg shadow-md"
          >
            {category}
          </div>
        ))}

        {/* Question Cells */}
        {questionValues.map((value) => (
          <div key={value} className="grid grid-cols-6 gap-2">
            {categories.map((category) => {
              const question = questions.find(
                (q) => q.categoryId === category && q.amount === value
              );
              const answeredQuestion = question ? answeredQuestions.find(aq => aq.id === question.id) : null;

              return (
                <div
                  key={`${category}-${value}`}
                  className={`aspect-square flex items-center justify-center cursor-pointer
                    ${answeredQuestion 
                      ? answeredQuestion.isCorrect 
                        ? 'bg-green-500' 
                        : 'bg-red-500'
                      : 'bg-blue-400 hover:bg-blue-500 active:bg-blue-600'}
                    text-white font-bold text-xl rounded-lg shadow-md transition-all
                    transform hover:scale-105 active:scale-95`}
                  onClick={() => question && !answeredQuestion && handleQuestionClick(question)}
                >
                  {answeredQuestion ? '✓' : `$${value}`}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Question Modal */}
      {selectedQuestion && (
        <QuestionModal
          question={selectedQuestion}
          onSubmit={handleAnswerSubmit}
          onClose={() => setSelectedQuestion(null)}
        />
      )}
    </div>
  );
} 