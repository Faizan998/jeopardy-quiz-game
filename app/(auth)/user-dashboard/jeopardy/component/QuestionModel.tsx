"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { JeopardyQuestion } from "@/app/type/types";

interface QuestionModalProps {
  question: JeopardyQuestion;
  onClose: () => void;
  onSubmit: (questionId: string, selectedIdx: number) => Promise<void>;
}

export default function QuestionModal({ question, onClose, onSubmit }: QuestionModalProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (selectedOption === null) {
      setError("Please select an answer");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(question.id, selectedOption);
      onClose();
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to submit answer");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gradient-to-br from-blue-900 to-blue-950 p-8 rounded-lg shadow-2xl max-w-2xl w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-white">Question for ${question.amount}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          <p className="text-xl text-white mb-8">{question.value}</p>

          <div className="space-y-4">
            {question.options.map((option, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedOption(index)}
                className={`w-full p-4 rounded-lg text-left transition-all duration-300 ${
                  selectedOption === index
                    ? "bg-yellow-500 text-blue-900"
                    : "bg-blue-800 text-white hover:bg-blue-700"
                }`}
              >
                {option}
              </motion.button>
            ))}
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 mt-4"
            >
              {error}
            </motion.p>
          )}

          <div className="mt-8 flex justify-end space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmit}
              disabled={isSubmitting || selectedOption === null}
              className={`px-6 py-2 rounded-lg transition-colors ${
                isSubmitting || selectedOption === null
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-yellow-500 text-blue-900 hover:bg-yellow-400"
              }`}
            >
              {isSubmitting ? "Submitting..." : "Submit Answer"}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
