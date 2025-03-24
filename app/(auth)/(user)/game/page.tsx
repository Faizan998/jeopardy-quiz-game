'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import QuestionModal from '@/components/QuestionModal';
import { Category, Question } from '@prisma/client';
import axios from 'axios'; // Import Axios

interface GameState {
  categories: Category[];
  questions: Question[];
  selectedQuestion: Question | null;
  isModalOpen: boolean;
  userScore: number;
  answeredQuestions: { id: string; isCorrect: boolean }[];
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
        axios.get('/api/user/categories'), // Use axios.get for categories
        axios.get('/api/user/questions'), // Use axios.get for questions
      ]);

      const categories = categoriesRes.data;
      const questions = questionsRes.data;

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
    if (!gameState.answeredQuestions.some(aq => aq.id === question.id)) {
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
      const response = await axios.post('/api/user/answers', {
        questionId: gameState.selectedQuestion.id,
        selectedIdx: selectedAnswer,
      });

      const result = response.data;

      setGameState(prev => ({
        ...prev,
        userScore: prev.userScore + (result.isCorrect ? gameState.selectedQuestion!.amount : 0),
        answeredQuestions: [...prev.answeredQuestions, {
          id: gameState.selectedQuestion!.id,
          isCorrect: result.isCorrect
        }],
        isModalOpen: false,
        selectedQuestion: null,
      }));
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black-900 via-indigo-900 to-blue-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-bold text-white drop-shadow-lg animate-fade-in">
            Jeopardy Game
          </h1>
          <div className="text-2xl font-semibold text-white bg-indigo-700 px-6 py-3 rounded-full shadow-lg animate-bounce">
            Score: ${gameState.userScore}
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 shadow-2xl">
          <div className="w-full overflow-x-auto">
            <div className="w-full">
              {/* Categories Row */}
              <div className="grid grid-cols-3 gap-2 mb-2">
                {gameState.categories.map((category) => (
                  <div 
                    key={category.id} 
                    className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-4 text-center font-bold rounded-t-lg shadow-lg transform hover:scale-105 transition-all duration-300"
                  >
                    <div className="text-base">{category.name}</div>
                  </div>
                ))}
              </div>

              {/* Questions Grid */}
              <div className="grid grid-rows-5 gap-2 mb-2">
                {Array.from({ length: 5 }).map((_, rowIndex) => (
                  <div key={rowIndex} className="grid grid-cols-3 gap-2 mb2">
                    {gameState.questions
                      .filter(q => q.amount === (rowIndex + 1) * 100)
                      .map((question) => {
                        const answeredQuestion = gameState.answeredQuestions.find(aq => aq.id === question.id);
                        const isAnswered = !!answeredQuestion;
                        
                        return (
                          <div
                            key={question.id}
                            onClick={() => handleQuestionClick(question)}
                            className={`
                               h-20 w-90 aspect-square flex items-center justify-center
                              text-white text-center cursor-pointer
                              transition-all duration-300 transform hover:scale-105
                              ${isAnswered 
                                ? answeredQuestion.isCorrect
                                  ? 'bg-green-500 hover:bg-green-600'
                                  : 'bg-red-500 hover:bg-red-600'
                                : 'bg-gradient-to-br from-indigo-500 to-blue-500 hover:from-indigo-400 hover:to-blue-400'
                              }
                              shadow-lg rounded-lg
                              hover:shadow-xl
                              animate-fade-in
                              backdrop-blur-sm
                              ${isAnswered ? 'cursor-not-allowed' : ''}
                            `}
                          >
                            <span className="text-xl font-bold drop-shadow-lg">
                              ${question.amount}
                            </span>
                          </div>
                        );
                      })}
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
