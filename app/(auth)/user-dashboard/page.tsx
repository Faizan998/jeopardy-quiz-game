"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import QuestionModal from "./QuestionModal";
import Leaderboard from "./Leaderboard";

// Define Type for Jeopardy Question
interface JeopardyQuestion {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
  points: number;
  categoryId: string;
  categoryName: string;
  isAnswered?: boolean;
  isCorrect?: boolean | null;
}

// Define Type for User
interface UserType {
  id: string;
  name: string;
  email: string;
  role?: string;
  image?: string;
}

// Define Type for Jeopardy Questions by Points
interface JeopardyQuestionsByPoints {
  [key: number]: JeopardyQuestion[];
}

export default function UserDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<UserType>({ id: "", name: "", email: "" });
  const [jeopardyQuestions, setJeopardyQuestions] = useState<JeopardyQuestionsByPoints>({});
  const [selectedQuestion, setSelectedQuestion] = useState<JeopardyQuestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingPage, setLoadingPage] = useState(true);
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userName = localStorage.getItem("userName");
    
    if (!token) {
      router.push("/login");
    } else {
      fetchUserProfile(token);
      fetchJeopardyQuestions(token);
    }
  }, [router]);

  const fetchUserProfile = async (token: string) => {
    try {
      const res = await axios.get("/api/auth/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 200) {
        setUser(res.data);
        // Store user ID in localStorage for leaderboard
        localStorage.setItem("userId", res.data.id);
        setScore(res.data.totalAmount || 0);
      } else {
        throw new Error("Failed to fetch user profile");
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setError("Failed to load user profile. Please try again later.");
    } finally {
      setLoadingPage(false);
    }
  };

  const fetchJeopardyQuestions = async (token: string) => {
    try {
      setLoading(true);
      const res = await axios.get("/api/questions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 200) {
        const questions = res.data;
        const questionsByPoints: JeopardyQuestionsByPoints = {};
        const uniqueCategories = new Set<string>();
        const answeredQuestionsMap: Record<string, boolean> = {};

        questions.forEach((question: JeopardyQuestion) => {
          const points = question.points;
          if (!questionsByPoints[points]) {
            questionsByPoints[points] = [];
          }
          questionsByPoints[points].push(question);
          uniqueCategories.add(question.categoryName);

          // Check if question has been answered
          if (question.isAnswered) {
            answeredQuestionsMap[question.id] = true;
          }
        });

        setJeopardyQuestions(questionsByPoints);
        setCategories(Array.from(uniqueCategories));
        setAnsweredQuestions(answeredQuestionsMap);
      } else {
        throw new Error("Failed to fetch questions");
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
      setError("Failed to load questions. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    router.push("/login");
  };

  const handleQuestionSelect = (question: JeopardyQuestion) => {
    if (!answeredQuestions[question.id]) {
      setSelectedQuestion(question);
    }
  };

  const handleAnswerSubmitted = (questionId: string, isCorrect: boolean) => {
    setSelectedQuestion(null);
    
    // Update answered questions
    setAnsweredQuestions(prev => ({
      ...prev,
      [questionId]: true
    }));
    
    // Update score if answer is correct
    if (isCorrect) {
      const question = Object.values(jeopardyQuestions)
        .flat()
        .find(q => q.id === questionId);
        
      if (question) {
        setScore(prev => prev + question.points);
      }
    }
  };

  const toggleLeaderboard = () => {
    setShowLeaderboard(!showLeaderboard);
  };

  if (loadingPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Jeopardy Quiz Game</h1>
          <p className="text-gray-400">Welcome, {user.name}</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="bg-blue-900 px-4 py-2 rounded-lg">
            <span className="font-bold">Score:</span> {score}
          </div>
          <button
            onClick={toggleLeaderboard}
            className="bg-purple-700 hover:bg-purple-800 px-4 py-2 rounded-lg transition duration-300"
          >
            {showLeaderboard ? "Hide Leaderboard" : "Show Leaderboard"}
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition duration-300"
          >
            Logout
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-900 text-white p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto">
        {showLeaderboard ? (
          <Leaderboard />
        ) : (
          <>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {Object.keys(jeopardyQuestions)
                  .sort((a, b) => Number(a) - Number(b))
                  .map((pointValue) => (
                    <div key={pointValue} className="bg-gray-800 rounded-lg p-4">
                      <h2 className="text-xl font-bold mb-4">{pointValue} Points</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {jeopardyQuestions[Number(pointValue)].map((question) => (
                          <div
                            key={question.id}
                            onClick={() => handleQuestionSelect(question)}
                            className={`p-4 rounded-lg cursor-pointer transition duration-300 ${
                              answeredQuestions[question.id]
                                ? "bg-gray-700 opacity-50 cursor-not-allowed"
                                : "bg-blue-800 hover:bg-blue-700"
                            }`}
                          >
                            <p className="font-bold mb-2">{question.categoryName}</p>
                            <p className="text-sm">{question.text}</p>
                            {answeredQuestions[question.id] && (
                              <span className="text-xs mt-2 inline-block bg-gray-600 px-2 py-1 rounded">
                                Answered
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Question Modal */}
      {selectedQuestion && (
        <QuestionModal
          question={selectedQuestion}
          onClose={() => setSelectedQuestion(null)}
          onAnswerSubmitted={handleAnswerSubmitted}
        />
      )}
    </div>
  );
}
