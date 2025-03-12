"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import QuestionModal from "./QuestionModal";

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

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userName = localStorage.getItem("userName");
    
    if (!token) {
      router.push("/login"); // Redirect if not logged in
    } else {
      setLoadingPage(false);
      
      // Set basic user info from localStorage while we fetch the full profile
      if (userName) {
        setUser(prev => ({ ...prev, name: userName }));
      }
      
      fetchUserProfile(token);
      fetchJeopardyQuestions(token);
    }
  }, [router]);

  const fetchUserProfile = async (token: string) => {
    try {
      const response = await axios.get("/api/auth/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.data.success) {
        setUser(response.data.data);
      } else {
        setError("Failed to load user profile");
      }
    } catch (error: any) {
      console.error("Error fetching user profile:", error);
      // Use the name from localStorage as fallback
      const userName = localStorage.getItem("userName");
      if (userName) {
        setUser(prev => ({ ...prev, name: userName }));
      }
    }
  };

  const fetchJeopardyQuestions = async (token: string) => {
    try {
      const response = await axios.get("/api/questions/jeopardy", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.data.success) {
        const questions = response.data.data;
        console.log("Fetched questions:", questions);
        setJeopardyQuestions(questions);
        
        // Extract unique categories
        const uniqueCategories = new Set<string>();
        Object.values(questions).forEach((questionArray: any) => {
          questionArray.forEach((q: JeopardyQuestion) => {
            if (q.categoryName) {
              uniqueCategories.add(q.categoryName);
            }
          });
        });
        setCategories(Array.from(uniqueCategories).slice(0, 3));
        
        // Initialize answered questions map
        const answered: Record<string, boolean> = {};
        
        // Iterate through questions
        Object.values(questions).forEach((questionArray: any) => {
          questionArray.forEach((question: JeopardyQuestion) => {
            if (question.isAnswered) {
              answered[question.id] = question.isCorrect || false;
              // Update score for previously answered questions
              if (question.isCorrect) {
                setScore(prev => prev + question.points);
              }
            }
          });
        });
        
        setAnsweredQuestions(answered);
      } else {
        setError("Failed to load questions");
      }
    } catch (error: any) {
      console.error("Error fetching questions:", error);
      setError("Failed to load questions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove token from storage
    localStorage.removeItem("userName"); // Remove user name from storage
    router.push("/login"); // Redirect to login
  };

  const handleQuestionSelect = (question: JeopardyQuestion) => {
    // Only allow selecting unanswered questions
    if (!answeredQuestions[question.id]) {
      console.log("Selected question:", question);
      setSelectedQuestion(question);
    }
  };

  const handleAnswerSubmitted = (questionId: string, isCorrect: boolean) => {
    console.log("Answer submitted:", { questionId, isCorrect });
    
    // Update the answered questions map
    setAnsweredQuestions(prev => ({
      ...prev,
      [questionId]: isCorrect,
    }));

    // Update the score
    if (isCorrect) {
      const question = Object.values(jeopardyQuestions)
        .flat()
        .find(q => q.id === questionId);
      
      if (question) {
        const newScore = score + question.points;
        setScore(newScore);
      }
    }

    // Update the questions state to reflect the answered status
    setJeopardyQuestions(prev => {
      const updated = { ...prev };
      Object.entries(updated).forEach(([points, questions]) => {
        updated[parseInt(points)] = questions.map(q => 
          q.id === questionId 
            ? { ...q, isAnswered: true, isCorrect } 
            : q
        );
      });
      return updated;
    });
  };

  if (loadingPage || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 transition-all duration-500 bg-gradient-to-br from-gray-800 via-gray-900 to-black">
        <div className="relative w-full max-w-md">
          <div className="bg-gray-800 bg-opacity-80 backdrop-blur-lg p-8 rounded-xl shadow-2xl w-full text-center border border-gray-700">
            <div className="relative overflow-hidden inline-block">
              <span className="text-xl text-gray-200 font-semibold relative z-10">Loading...</span>
              <div className="absolute inset-0 h-full bg-blue-400 opacity-50 animate-loading-bar"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 transition-all duration-500 bg-gradient-to-br from-gray-800 via-gray-900 to-black">
        <div className="relative w-full max-w-md">
          <div className="bg-gray-800 bg-opacity-80 backdrop-blur-lg p-8 rounded-xl shadow-2xl w-full text-center border border-gray-700">
            <div className="text-red-500 text-xl font-semibold mb-4">Error</div>
            <p className="text-white mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-800 via-gray-900 to-black">
      {/* Navbar */}
      <nav className="w-full p-4 bg-gray-800 bg-opacity-80 backdrop-blur-lg border-b border-gray-700 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-pulse">
            Jeopardy Quiz
          </h1>
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg shadow-md">
              <span className="font-bold">Score:</span> {score}
            </div>
            <p className="text-lg text-gray-200 font-semibold">Hello, {user.name || "Player"}!</p>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-700 text-white rounded-lg shadow-md hover:shadow-xl hover:from-red-600 hover:to-red-800 transition-all duration-300 hover:scale-105"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex p-6 max-w-7xl mx-auto w-full">
        {/* Jeopardy Table */}
        <div className="w-full bg-gray-800 bg-opacity-80 backdrop-blur-lg p-6 rounded-xl shadow-2xl border border-gray-700">
          <h2 className="text-2xl font-bold text-gray-200 mb-6">Jeopardy Game</h2>
          
          {/* Categories */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            {categories.map((category, index) => (
              <div 
                key={index}
                className={`p-4 rounded-lg shadow-md text-center ${
                  index === 0 
                    ? "bg-gradient-to-r from-blue-600 to-blue-800" 
                    : index === 1 
                    ? "bg-gradient-to-r from-purple-600 to-purple-800" 
                    : "bg-gradient-to-r from-pink-600 to-pink-800"
                }`}
              >
                <h3 className="text-lg font-semibold text-white">{category}</h3>
              </div>
            ))}
          </div>
          
          {/* Questions by points */}
          {[100, 200, 300, 400, 500].map((pointValue) => {
            // Check if we have questions for this point value
            const hasQuestions = jeopardyQuestions[pointValue] && jeopardyQuestions[pointValue].length > 0;
            
            // Skip rendering if no questions for this point value
            if (!hasQuestions) return null;
            
            return (
              <div key={pointValue} className="grid grid-cols-3 gap-4 mb-4">
                {(jeopardyQuestions[pointValue] || []).map((question, index) => {
                  // Only show up to 3 questions per point value
                  if (index >= 3) return null;
                  
                  return (
                    <button
                      key={question.id}
                      onClick={() => handleQuestionSelect(question)}
                      disabled={answeredQuestions[question.id] !== undefined}
                      className={`p-6 rounded-lg shadow-md text-center transition-all duration-300 ${
                        answeredQuestions[question.id] === undefined
                          ? "bg-gray-700 hover:bg-gray-600 cursor-pointer"
                          : answeredQuestions[question.id]
                          ? "bg-green-600 cursor-not-allowed"
                          : "bg-red-600 cursor-not-allowed"
                      }`}
                    >
                      <p className="text-2xl font-bold text-white">${pointValue}</p>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Question Modal */}
      {selectedQuestion && (
        <QuestionModal
          selectedQuestion={selectedQuestion}
          onClose={() => setSelectedQuestion(null)}
          onAnswerSubmitted={handleAnswerSubmitted}
        />
      )}

      <style jsx>{`
        @keyframes loadingBar {
          0% {
            width: 0;
            left: 0;
          }
          50% {
            width: 100%;
            left: 0;
          }
          100% {
            width: 0;
            left: 100%;
          }
        }
        .animate-loading-bar {
          animation: loadingBar 1.5s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}
