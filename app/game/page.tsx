'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import QuestionModal from '@/components/QuestionModal';
import { Category, Question } from '@prisma/client';

interface GameState {
  categories: Category[];
  questions: Question[];
  selectedQuestion: Question | null;
  isModalOpen: boolean;
  userScore: number;
  answeredQuestions: string[];
}

export default function GamePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [gameState, setGameState] = useState<GameState>({
    categories: [],
    questions: [],
    selectedQuestion: null,
    isModalOpen: false,
    userScore: 0,
    answeredQuestions: [],
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      fetchGameData();
    }
  }, [session]);

  const fetchGameData = async () => {
    try {
      const [categoriesRes, questionsRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/questions'),
      ]);

      const categories = await categoriesRes.json();
      const questions = await questionsRes.json();

      setGameState(prev => ({
        ...prev,
        categories,
        questions,
      }));
    } catch (error) {
      console.error('Error fetching game data:', error);
    }
  };

  const handleQuestionClick = (question: Question) => {
    if (!gameState.answeredQuestions.includes(question.id)) {
      setGameState(prev => ({
        ...prev,
        selectedQuestion: question,
        isModalOpen: true,
      }));
    }
  };

  const handleAnswerSubmit = async (selectedAnswer: number) => {
    if (!gameState.selectedQuestion || !session?.user) return;

    try {
      const response = await fetch('/api/answers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId: gameState.selectedQuestion.id,
          selectedIdx: selectedAnswer,
        }),
      });

      const result = await response.json();
      
      setGameState(prev => ({
        ...prev,
        userScore: prev.userScore + (result.isCorrect ? gameState.selectedQuestion!.amount : 0),
        answeredQuestions: [...prev.answeredQuestions, gameState.selectedQuestion!.id],
        isModalOpen: false,
        selectedQuestion: null,
      }));
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  };

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black-900 via-indigo-900 to-blue-900 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-bold text-white drop-shadow-lg animate-fade-in">
            Jeopardy Game
          </h1>
          <div className="text-2xl font-semibold text-white bg-indigo-700 px-6 py-3 rounded-full shadow-lg animate-bounce">
            Score: ${gameState.userScore}
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 shadow-2xl">
          <div className="w-full overflow-x-auto">
            <div className="min-w-full">
              {/* Categories Row */}
              <div className="grid grid-cols-6 gap-1.5 mb-1.5">
                {gameState.categories.map((category) => (
                  <div 
                    key={category.id} 
                    className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-3 text-center font-bold rounded-t-lg shadow-lg transform hover:scale-105 transition-all duration-300"
                  >
                    <div className="text-base">{category.name}</div>
                  </div>
                ))}
              </div>

              {/* Questions Grid */}
              <div className="grid grid-rows-8 gap-1.5">
                {Array.from({ length: 5 }).map((_, rowIndex) => (
                  <div key={rowIndex} className="grid grid-cols-8 gap-1.5">
                    {gameState.questions
                      .filter(q => q.amount === (rowIndex + 1) * 100)
                      .map((question) => (
                        <div
                          key={question.id}
                          onClick={() => handleQuestionClick(question)}
                          className={`
                            aspect-square flex items-center justify-center
                            text-white text-center cursor-pointer
                            transition-all duration-300 transform hover:scale-105
                            ${gameState.answeredQuestions.includes(question.id) 
                              ? 'bg-gray-700 opacity-50 cursor-not-allowed' 
                              : 'bg-gradient-to-br from-indigo-500 to-black-500 hover:from-indigo-400 hover:to-purple-400'
                            }
                            shadow-lg rounded-lg
                            hover:shadow-xl
                            animate-fade-in
                            backdrop-blur-sm
                          `}
                        >
                          <span className="text-xl font-bold drop-shadow-lg">
                            ${question.amount}
                          </span>
                        </div>
                      ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <QuestionModal
        isOpen={gameState.isModalOpen}
        onClose={() => setGameState(prev => ({ ...prev, isModalOpen: false }))}
        question={gameState.selectedQuestion}
        onSubmitAnswer={handleAnswerSubmit}
      />
    </div>
  );
} 