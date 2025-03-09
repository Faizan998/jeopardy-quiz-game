"use client";

import { useDispatch, useSelector } from "react-redux";
import { closeQuestion } from "../../redux/feature/questionSlice";
import { useState } from "react";
import { RootState } from "../../redux/store";

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
}

export default function QuestionModal() {
  const dispatch = useDispatch();
  const { selectedQuestion } = useSelector((state: RootState) => state.question) as { selectedQuestion: Question | null };
  const [selectedAnswer, setSelectedAnswer] = useState("");

  if (!selectedQuestion) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-xl font-bold text-white">{selectedQuestion.question}</h2>
        <div className="mt-4">
          {selectedQuestion.options.map((option: string, index: number) => (
            <button
              key={index}
              onClick={() => setSelectedAnswer(option)}
              className={`block w-full p-2 mt-2 rounded-lg text-white ${
                selectedAnswer === option ? "bg-blue-600" : "bg-gray-700"
              } hover:bg-blue-500 transition`}
            >
              {option}
            </button>
          ))}
        </div>
        <div className="mt-4 flex justify-between">
          <button
            onClick={() => dispatch(closeQuestion())}
            className="px-4 py-2 bg-red-600 text-white rounded-lg"
          >
            Close
          </button>
          <button
            onClick={() => {
              if (selectedAnswer === selectedQuestion.correctAnswer) {
                alert("✅ Correct Answer!");
              } else {
                alert("❌ Wrong Answer!");
              }
              dispatch(closeQuestion());
            }}
            disabled={!selectedAnswer}
            className="px-4 py-2 bg-green-600 text-white rounded-lg"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
