"use client";

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
}

interface ModalProps {
  question: Question;
  onClose: () => void;
}

export default function QuestionModal({ question, onClose }: ModalProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">{question.text}</h2>
        <ul className="space-y-2">
          {question.options.map((option, index) => (
            <li key={index} className="p-2 bg-gray-200 rounded-lg">
              {option}
            </li>
          ))}
        </ul>
        <button onClick={onClose} className="mt-4 bg-red-500 text-white px-4 py-2 rounded">
          Close
        </button>
      </div>
    </div>
  );
}
