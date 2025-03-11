"use client";

import { useState } from "react";

interface Question {
  text: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

interface QuestionModalProps {
  selectedQuestion: Question | null;
  onClose: () => void;
}

export default function QuestionModal({ selectedQuestion, onClose }: QuestionModalProps) {
  const [selectedAnswer, setSelectedAnswer] = useState("");

  if (!selectedQuestion) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-xl font-bold text-white">{selectedQuestion?.text}</h2>
        <div className="mt-4 text-white">
          {selectedQuestion?.options?.map((option, index) => (
            <div key={index} className="flex items-center">
              <input
                type="radio"
                id={option}
                name="answer"
                value={option}
                onChange={(e) => setSelectedAnswer(e.target.value)}
                className="mr-2"
              />
              <label htmlFor={option}>{option}</label>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-between">
          <button onClick={onClose} className="px-4 py-2 bg-red-600 text-white rounded-lg">
            Close
          </button>
          <button
            onClick={() => {
              if (selectedAnswer === selectedQuestion.correctAnswer) {
                alert("✅ Correct Answer!");
              } else {
                alert("❌ Wrong Answer!");
              }
              onClose();
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