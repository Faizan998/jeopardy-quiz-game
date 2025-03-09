"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../redux/store";
import { logoutUser } from "../../redux/feature/userSlice";
import { fetchQuestions, openQuestion } from "../../redux/feature/questionSlice";
import QuestionModal from "../user-dashboard/QuestionModal";

export default function UserDashboard() {
  const dispatch: AppDispatch = useDispatch();
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user);
  const { questions, selectedQuestion, loading } = useSelector((state: RootState) => state.question);
  const [loadingPage, setLoadingPage] = useState(true);


  const store = useSelector((state: RootState) => state);
  console.log("Store:", store);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login"); // Redirect if not logged in
    } else {
      setLoadingPage(false);
      dispatch(fetchQuestions());
    }
  }, [router, dispatch]);

  useEffect(() => {
    console.log("Questions:", questions);
  }, [questions]);

  const handleLogout = () => {
    dispatch(logoutUser()); // Redux se user hatao
    router.push("/login"); // Redirect to login
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

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-800 via-gray-900 to-black">
      {/* Navbar */}
      <nav className="w-full p-4 bg-gray-800 bg-opacity-80 backdrop-blur-lg border-b border-gray-700 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-pulse">
            Jeopardy Quiz
          </h1>
          <div className="flex items-center gap-4">
            <p className="text-lg text-gray-200 font-semibold">Hello, {user.name}!</p>
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
      <div className="flex-1 flex p-6 max-w-7xl mx-auto w-full gap-6">
        {/* Right Side (Jeopardy Table) */}
        <div className="w-full bg-gray-800 bg-opacity-80 backdrop-blur-lg p-6 rounded-xl shadow-2xl border border-gray-700">
          <h2 className="text-2xl font-bold text-gray-200 mb-4">Jeopardy Levels</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            {/* Level Headers */}
            <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-700 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-white">Level 1</h3>
            </div>
            <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-700 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-white">Level 2</h3>
            </div>
            <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-700 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-white">Level 3</h3>
            </div>

            {/* Monetary Values */}
            {questions.map((q: any, index: number) => (
              <button
                key={q.id}
                onClick={() => dispatch(openQuestion(q))}
                className="p-4 bg-gray-900 rounded-lg shadow-inner text-gray-200 hover:bg-gray-700 transition-all duration-300"
              >
                <p className="text-lg font-medium">${q.points}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
      {selectedQuestion && <QuestionModal />}
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