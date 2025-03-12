"use client";

import { useState, useEffect } from "react";
import axios from "axios";

interface Question {
  id: string;
  value: string;
  options: string[];
  amount: number;
  CorrectIdx: number;
  categoryId: string;
  category: {
    id: string;
    name: string;
  };
}

interface Category {
  id: string;
  name: string;
}

export default function UpdateQuestionAnswer() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form state for new/edit question
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [formData, setFormData] = useState({
    value: "",
    options: ["", "", "", ""],
    amount: 100,
    CorrectIdx: 0,
    categoryId: ""
  });

  useEffect(() => {
    fetchQuestions();
    fetchCategories();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/questions");
      setQuestions(response.data);
    } catch (error) {
      console.error("Error fetching questions:", error);
      setError("Failed to load questions. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get("/api/categories");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError("Failed to load categories. Please try again later.");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "amount" ? parseInt(value) : value
    });
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({
      ...formData,
      options: newOptions
    });
  };

  const handleCorrectAnswerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({
      ...formData,
      CorrectIdx: parseInt(e.target.value)
    });
  };

  const resetForm = () => {
    setFormData({
      value: "",
      options: ["", "", "", ""],
      amount: 100,
      CorrectIdx: 0,
      categoryId: ""
    });
    setSelectedQuestion(null);
    setFormMode("add");
  };

  const handleEditQuestion = (question: Question) => {
    setSelectedQuestion(question);
    setFormData({
      value: question.value,
      options: question.options,
      amount: question.amount,
      CorrectIdx: question.CorrectIdx,
      categoryId: question.categoryId
    });
    setFormMode("edit");
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm("Are you sure you want to delete this question?")) {
      return;
    }

    try {
      await axios.delete(`/api/questions?id=${id}`);
      setSuccess("Question deleted successfully!");
      fetchQuestions();
    } catch (error) {
      console.error("Error deleting question:", error);
      setError("Failed to delete question. Please try again.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.value.trim()) {
      setError("Question text is required");
      return;
    }
    
    if (!formData.categoryId) {
      setError("Category is required");
      return;
    }
    
    if (formData.options.some(option => !option.trim())) {
      setError("All options must be filled");
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      if (formMode === "add") {
        await axios.post("/api/questions", formData);
        setSuccess("Question added successfully!");
      } else {
        await axios.put("/api/questions", {
          id: selectedQuestion?.id,
          ...formData
        });
        setSuccess("Question updated successfully!");
      }
      
      resetForm();
      fetchQuestions();
    } catch (error) {
      console.error("Error saving question:", error);
      setError("Failed to save question. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-6">Manage Questions</h1>
      
      {error && (
        <div className="bg-red-900 text-white p-4 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-900 text-white p-4 rounded-lg mb-6">
          {success}
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Question Form */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4">
            {formMode === "add" ? "Add New Question" : "Edit Question"}
          </h2>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Category</label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                className="w-full p-3 bg-gray-700 rounded-lg text-white"
                required
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Question Text</label>
              <textarea
                name="value"
                value={formData.value}
                onChange={handleInputChange}
                className="w-full p-3 bg-gray-700 rounded-lg text-white"
                rows={3}
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Point Value</label>
              <select
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                className="w-full p-3 bg-gray-700 rounded-lg text-white"
              >
                <option value={100}>100</option>
                <option value={200}>200</option>
                <option value={300}>300</option>
                <option value={400}>400</option>
                <option value={500}>500</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Options</label>
              {formData.options.map((option, index) => (
                <div key={index} className="mb-2 flex items-center">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    className="flex-1 p-3 bg-gray-700 rounded-lg text-white"
                    placeholder={`Option ${index + 1}`}
                    required
                  />
                </div>
              ))}
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-300 mb-2">Correct Answer</label>
              <select
                value={formData.CorrectIdx}
                onChange={handleCorrectAnswerChange}
                className="w-full p-3 bg-gray-700 rounded-lg text-white"
              >
                {formData.options.map((option, index) => (
                  <option key={index} value={index}>
                    {option || `Option ${index + 1}`}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex gap-4">
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                disabled={loading}
              >
                {loading ? "Saving..." : formMode === "add" ? "Add Question" : "Update Question"}
              </button>
              
              {formMode === "edit" && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
        
        {/* Questions List */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4">Existing Questions</h2>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : questions.length === 0 ? (
            <p className="text-gray-400">No questions found.</p>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {questions.map(question => (
                <div key={question.id} className="bg-gray-700 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="bg-blue-600 text-white px-2 py-1 rounded text-sm mr-2">
                        {question.amount} pts
                      </span>
                      <span className="text-gray-300 text-sm">
                        {question.category?.name || "Unknown Category"}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditQuestion(question)}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(question.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="text-white mb-2">{question.value}</p>
                  <div className="text-sm text-gray-300">
                    <p className="font-semibold">Options:</p>
                    <ul className="list-disc pl-5">
                      {question.options.map((option, index) => (
                        <li key={index} className={index === question.CorrectIdx ? "text-green-400" : ""}>
                          {option} {index === question.CorrectIdx && "(Correct)"}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
