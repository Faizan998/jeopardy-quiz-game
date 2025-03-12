"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import axios, { AxiosError } from "axios";

interface JeopardyQuestion {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
  points: number;
  categoryId: string;
  categoryName: string;
}

interface QuestionModalProps {
  selectedQuestion: JeopardyQuestion | null;
  onClose: () => void;
  onAnswerSubmitted: (questionId: string, isCorrect: boolean) => void;
}

interface SubmissionResult {
  success: boolean;
  data?: {
    answerId: string;
    isCorrect: boolean;
    points: number;
  };
  error?: string;
  details?: string;
}

export default function QuestionModal({
  selectedQuestion,
  onClose,
  onAnswerSubmitted
}: QuestionModalProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const timerInitialized = useRef(false);

  // Initialize timer only once when component mounts
  useEffect(() => {
    if (!selectedQuestion || timerInitialized.current) return;
    
    // Set initial timer
    setTimeLeft(30);
    timerInitialized.current = true;
    
    timerRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          
          // If time runs out and no result yet
          if (!result) {
            if (selectedAnswer) {
              // If an answer is selected, submit it
              handleSubmit();
            } else {
              // If no answer selected, show message
              setResult({
                isCorrect: false,
                message: "Time's up! You didn't select an answer.",
              });
            }
          }
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [selectedQuestion, result, selectedAnswer]);

  // Auto-close after showing result
  useEffect(() => {
    if (result) {
      const closeTimer = setTimeout(() => {
        onClose();
      }, 2500);
      return () => clearTimeout(closeTimer);
    }
  }, [result, onClose]);

  // Handle answer selection
  const selectAnswer = useCallback((option: string) => {
    if (!result) {
      console.log("Selected answer:", option);
      setSelectedAnswer(option);
    }
  }, [result]);

  // Handle answer submission
  const handleSubmit = useCallback(async () => {
    if (!selectedQuestion || isSubmitting || result) return;

    // Allow submission even if no answer is selected
    if (!selectedAnswer) {
      setResult({
        isCorrect: false,
        message: "Please select an answer before submitting.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      console.log("Submitting answer:", {
        questionId: selectedQuestion.id,
        selectedAnswer,
        correctAnswer: selectedQuestion.correctAnswer,
        points: selectedQuestion.points,
      });

      // First, submit to the answer API
      const response = await axios.post<SubmissionResult>(
        "/api/answers/submit",
        {
          questionId: selectedQuestion.id,
          selectedAnswer,
          correctAnswer: selectedQuestion.correctAnswer,
          points: selectedQuestion.points,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        }
      );

      console.log("Response from answer submission:", response.data);

      if (response.data.success && response.data.data) {
        const { isCorrect } = response.data.data;
        
        // Also store the answer in our in-memory storage
        await axios.post(
          "/api/questions/jeopardy",
          {
            questionId: selectedQuestion.id,
            isCorrect
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            },
          }
        );

        setResult({
          isCorrect,
          message: isCorrect
            ? `✅ Correct! You earned ${selectedQuestion.points} points.`
            : `❌ Wrong! The correct answer was: ${selectedQuestion.correctAnswer}`,
        });

        // Notify parent component about the result
        onAnswerSubmitted(selectedQuestion.id, isCorrect);
      } else {
        throw new Error(response.data.error || "Failed to submit answer");
      }
    } catch (error) {
      console.error("Error submitting answer:", error);
      
      // Properly type the error
      const axiosError = error as AxiosError<SubmissionResult>;
      
      setResult({
        isCorrect: false,
        message: axiosError.response?.data?.error || 
                (error as Error).message || 
                "Error submitting your answer. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedQuestion, selectedAnswer, onAnswerSubmitted, isSubmitting, result]);

  // Reset component state when question changes
  useEffect(() => {
    if (selectedQuestion) {
      // Reset state but don't restart timer
      setSelectedAnswer(null);
      setResult(null);
      setIsSubmitting(false);
      
      // Log the question data for debugging
      console.log("Question data:", selectedQuestion);
      console.log("Options:", selectedQuestion.options);
    }
    
    return () => {
      // Clean up when component unmounts
      timerInitialized.current = false;
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [selectedQuestion]);

  if (!selectedQuestion) return null;

  // Use the options directly from the question
  const displayOptions = selectedQuestion.options || [];

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
      <div className="bg-gray-800 p-8 rounded-xl shadow-2xl max-w-2xl w-full border border-gray-700">
        {/* Timer and Points */}
        <div className="mb-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="text-lg font-bold text-gray-200">
              Category: {selectedQuestion.categoryName}
            </div>
            <div className="px-3 py-1 bg-blue-600 rounded-full text-white font-bold">
              ${selectedQuestion.points}
            </div>
          </div>
          <div className={`text-lg font-bold ${timeLeft <= 10 ? "text-red-500 animate-pulse" : "text-gray-200"}`}>
            Time: {timeLeft}s
          </div>
        </div>

        {/* Question */}
        <h2 className="text-2xl font-bold text-white mb-6">{selectedQuestion.text}</h2>

        {/* Result message */}
        {result && (
          <div className={`p-4 mb-6 rounded-lg ${result.isCorrect ? "bg-green-600/20 border border-green-500" : "bg-red-600/20 border border-red-500"}`}>
            <p className="text-lg font-semibold text-white">{result.message}</p>
          </div>
        )}

        {/* Answer options */}
        <div className="grid grid-cols-1 gap-3 mb-6">
          {displayOptions.map((option, index) => (
            <button
              key={index}
              onClick={() => selectAnswer(option)}
              disabled={!!result}
              className={`p-4 rounded-lg text-white text-left transition-all duration-300 ${
                result
                  ? option === selectedQuestion.correctAnswer
                    ? "bg-green-600"
                    : option === selectedAnswer && option !== selectedQuestion.correctAnswer
                      ? "bg-red-600"
                      : "bg-gray-700 opacity-70"
                  : selectedAnswer === option
                    ? "bg-blue-600 shadow-lg"
                    : "bg-gray-700 hover:bg-gray-600"
                }`}
            >
              <span className="font-bold mr-2">{String.fromCharCode(65 + index)}.</span> {option}
            </button>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex justify-between">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all duration-300"
          >
            Close
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !!result}
            className={`px-6 py-3 rounded-lg text-white transition-all duration-300 ${
              isSubmitting || !!result
                ? "bg-gray-600 cursor-not-allowed"
                : selectedAnswer
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
          >
            {isSubmitting ? "Submitting..." : result ? "Submitted" : "Submit Answer"}
          </button>
        </div>
      </div>
    </div>
  );
}