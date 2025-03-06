"use client";

import { useDispatch } from "react-redux";
import { openQuestion } from "../../redux/feature/questionSlice";
import QuestionModal from "./QuestionModal";

const questions = [
  { id: 1, question: "Capital of France?", options: ["Paris", "London", "Berlin", "Madrid"], correctAnswer: "Paris" },
  { id: 2, question: "5 + 3 = ?", options: ["5", "8", "12", "10"], correctAnswer: "8" },
  { id: 3, question: "Largest planet?", options: ["Mars", "Earth", "Jupiter", "Venus"], correctAnswer: "Jupiter" },
];

export default function UserDashboard() {
  const dispatch = useDispatch();

  return (
    <div className="min-h-screen flex flex-col bg-gray-800 p-6">
      <h2 className="text-2xl font-bold text-white mb-4">Jeopardy Levels</h2>
      <div className="grid grid-cols-3 gap-4 text-center">
        {questions.map((q) => (
          <button
            key={q.id}
            onClick={() => dispatch(openQuestion(q))}
            className="p-4 bg-gray-900 rounded-lg text-gray-200 hover:bg-gray-700 transition"
          >
            ${q.id * 100}
          </button>
        ))}
      </div>
      <QuestionModal />
    </div>
  );
}
