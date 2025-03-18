"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { motion } from "framer-motion";
import QuestionModal from "./component/QuestionModel";
import { Category, JeopardyQuestion, AnswerResponse } from "@/app/type/types";

// Function to fetch jeopardy data
const getJeopardyTable = async () => {
  const res = await axios.get<Category[]>("/api/user/categories");
  return res.data;
};

const submitAnswer = async (questionId: string, selectedIdx: number) => {
  const res = await axios.post<AnswerResponse>("/api/user/submit-answer", {
    questionId,
    selectedIdx,
  });
  return res.data;
};

export default function JeopardyPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [selectedQuestion, setSelectedQuestion] = useState<JeopardyQuestion | null>(null);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<string>>(new Set());

  const queryClient = useQueryClient();

  // Fetch jeopardy data using React Query
  const { data: categories, error, isPending } = useQuery({
    queryKey: ["jeopardy"],
    queryFn: getJeopardyTable,
    enabled: status === "authenticated",
  });

  const { mutate } = useMutation({
    mutationFn: async ({ questionId, selectedIdx }: { questionId: string; selectedIdx: number }) => {
      return await submitAnswer(questionId, selectedIdx);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to submit answer");
    },
    onSuccess: (data) => {
      if (data.isCorrect) {
        toast.success(`Correct! You earned $${data.pointsEarned}`);
      } else {
        toast.error("Incorrect answer!");
      }
      setAnsweredQuestions(prev => new Set([...prev, selectedQuestion!.id]));
      queryClient.invalidateQueries({ queryKey: ["jeopardy"] });
    },
  });

  // Handle authentication state
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Show loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please Log In</h1>
          <p className="mb-4">You need to be logged in to play Jeopardy</p>
          <button
            onClick={() => router.push("/login")}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Show error if no session
  if (!session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Session Error</h1>
          <p className="mb-4">Please try logging in again</p>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Logout and Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-700 to-pink-600 p-8 bg-opacity-80">
      {/* Navbar */}
      <nav className="flex justify-between items-center bg-gray-800 p-4 shadow-lg rounded-lg">
        <h1 className="text-white text-xl font-semibold">
          {session.user.name}
        </h1>
        <div className="space-x-4">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
          >
            Logout
          </button>
          <button
            onClick={() => router.push("/user-dashboard/leaderboard")}
            className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-all"
          >
            Leaderboard
          </button>
        </div>
      </nav>

      {/* User Info */}
      <div className="mt-8 text-center text-white">
        <h2 className="text-3xl font-bold">Welcome, {session.user.name}!</h2>
        <p className="mt-4 text-lg">Your current score: ${session.user.totalAmount || 0}</p>
      </div>

      {/* Jeopardy Game Board */}
      <div className="mt-10">
        {isPending ? (
          <div className="flex justify-center items-center">
            <p className="text-white">Loading game board...</p>
          </div>
        ) : error ? (
          <div className="text-center text-white">
            <h2 className="text-2xl font-bold">Error loading game board</h2>
            <p className="mt-2">Please try again later</p>
          </div>
        ) : (
          <div className="bg-white bg-opacity-10 rounded-lg p-6 backdrop-blur-lg">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="p-4 text-yellow-400 font-bold text-xl">Categories</th>
                    {[100, 200, 300, 400, 500].map((amount) => (
                      <th key={amount} className="p-4 text-yellow-400 font-bold text-xl">
                        ${amount}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {categories?.map((category) => (
                    <tr key={category.id}>
                      <td className="p-4 text-white font-bold text-lg">{category.name}</td>
                      {[100, 200, 300, 400, 500].map((amount) => {
                        const question = category.questions.find((q) => q.amount === amount);
                        const isAnswered = question && answeredQuestions.has(question.id);

                        return (
                          <td key={amount} className="p-4">
                            {question ? (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setSelectedQuestion(question)}
                                disabled={isAnswered}
                                className={`w-full h-24 rounded-lg font-bold text-lg transition-all duration-300 ${
                                  isAnswered ? "bg-gray-500 text-white" : "bg-blue-800 hover:bg-blue-700 text-white"
                                }`}
                              >
                                {isAnswered ? "✓" : `$${amount}`}
                              </motion.button>
                            ) : (
                              <div className="w-full h-24 rounded-lg bg-gray-700 flex items-center justify-center text-gray-500">
                                -
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Question Modal */}
      {selectedQuestion && (
        <QuestionModal
          question={selectedQuestion}
          onClose={() => setSelectedQuestion(null)}
          onSubmit={async (questionId, selectedIdx) => {
            await mutate({ questionId, selectedIdx });
          }}
        />
      )}
    </div>
  );
}
