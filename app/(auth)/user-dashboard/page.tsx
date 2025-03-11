"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import QuestionModal from "../user-dashboard/QuestionModal";
import axios from "axios";

export default function UserDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    
    const userData = JSON.parse(localStorage.getItem("user") || "null");
    setUser(userData);
    
    axios.get("/api/questions", { headers: { Authorization: `Bearer ${token}` } })
      .then(response => {
        setQuestions(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching questions:", error);
        setLoading(false);
      });
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      {/* Navbar */}
      <nav className="w-full p-4 bg-gray-800 border-b border-gray-700 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold">Jeopardy Quiz</h1>
          <div className="flex items-center gap-4">
            <p className="text-lg">Hello, {user?.name}!</p>
            <button onClick={handleLogout} className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700">
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex p-6 max-w-7xl mx-auto w-full gap-6">
        <div className="w-full bg-gray-800 p-6 rounded-xl shadow-xl border border-gray-700">
          <h2 className="text-2xl font-bold mb-4">Jeopardy Levels</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            {questions.map((q, index) => (
              <button
                key={q.id}
                onClick={() => setSelectedQuestion(q)}
                className="p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-all"
              >
                <p className="text-lg font-medium">${q.points}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {selectedQuestion && <QuestionModal selectedQuestion={selectedQuestion} onClose={function (): void {
        throw new Error("Function not implemented.");
      } } />}
    </div>
  );
}