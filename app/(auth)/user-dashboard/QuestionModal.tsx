"use client";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { closeQuestion, selectAnswer } from "../../redux/feature/questionSlice";

export default function QuestionModal() {
  const dispatch = useDispatch();
  const { selectedQuestion, selectedAnswer, isCorrect } = useSelector((state: RootState) => state.question);

  if (!selectedQuestion) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center">
      <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-lg font-bold text-white">{selectedQuestion.question}</h2>
        <div className="mt-4 space-y-2">
          {selectedQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => dispatch(selectAnswer(option))}
              className={`block w-full px-4 py-2 rounded-md transition ${
                selectedAnswer === option
                  ? isCorrect
                    ? "bg-green-500 text-white"
                    : "bg-red-500 text-white"
                  : "bg-gray-700 text-white hover:bg-gray-600"
              }`}
              disabled={!!selectedAnswer}
            >
              {option}
            </button>
          ))}
        </div>
        
        {selectedAnswer && (
          <p className={`mt-4 text-center font-bold ${isCorrect ? "text-green-400" : "text-red-400"}`}>
            {isCorrect ? "✅ Correct Answer!" : "❌ Wrong Answer!"}
          </p>
        )}

        <button
          onClick={() => dispatch(closeQuestion())}
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 w-full"
        >
          Close
        </button>
      </div>
    </div>
  );
}
