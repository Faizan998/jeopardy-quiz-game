'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";  // Import Toastify
import "react-toastify/dist/ReactToastify.css";          // Import CSS

interface Category {
    id: string;
    name: string;
}

export default function CreateQuestion() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [formData, setFormData] = useState({
        value: "",
        options: ["", "", "", ""],
        amount: 100,
        correctAnswer: "",
        categoryId: "",
    });

    // Fetch categories on component mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get("/api/admin/categories");
                setCategories(response.data);
            } catch (err) {
                console.error("Error fetching categories:", err);
                toast.error("Failed to load categories"); // Error toast
            }
        };
        fetchCategories();
    }, []);

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...formData.options];
        newOptions[index] = value;
        setFormData({ ...formData, options: newOptions });
    };

    const handleCorrectAnswerChange = (value: string) => {
        setFormData({ ...formData, correctAnswer: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (!session || session.user.role !== "ADMIN") {
                throw new Error("You are not authorized to create questions.");
            }

            // Find the index of the correct answer
            const correctIndex = formData.options.findIndex(option => option === formData.correctAnswer);
            if (correctIndex === -1) {
                throw new Error("Correct answer must match one of the options");
            }

            // Create a copy of options to shuffle
            const shuffledOptions = [...formData.options];
            for (let i = shuffledOptions.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
            }

            // Find the new index of the correct answer after shuffling
            const newCorrectIndex = shuffledOptions.findIndex(option => option === formData.correctAnswer);

            const questionData = {
                ...formData,
                options: shuffledOptions,
                CorrectIdx: newCorrectIndex,
            };

            const response = await axios.post("/api/admin/questions", questionData);
            if (response.data) {
                toast.success("Question created successfully!"); // Success toast
                router.push("/admin-dashboard/question-answer-update");
            }
        } catch (err) {
            console.error("Error creating question:", err);
            toast.error(err instanceof Error ? err.message : "Failed to create question. Please try again."); // Error toast
        } finally {
            setLoading(false);
        }
    };

    if (status === "loading") {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!session || session.user.role !== "ADMIN") {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-red-500 text-xl">You are not authorized to access this page.</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-r from-blue-900 to-blue-600 p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl mx-auto bg-white rounded-lg shadow-xl p-6"
            >
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Create New Question</h1>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Question</label>
                        <textarea
                            value={formData.value}
                            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={3}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Options</label>
                        {formData.options.map((option, index) => (
                            <div key={index} className="flex items-center mb-2">
                                <input
                                    type="text"
                                    value={option}
                                    onChange={(e) => handleOptionChange(index, e.target.value)}
                                    className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder={`Option ${index + 1}`}
                                    required
                                />
                            </div>
                        ))}
                    </div>

                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Correct Answer</label>
                        <select
                            value={formData.correctAnswer}
                            onChange={(e) => handleCorrectAnswerChange(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            <option value="">Select the correct answer</option>
                            {formData.options.map((option, index) => (
                                <option key={index} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Points</label>
                        <input
                            type="number"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) })}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="100"
                            step="100"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Category</label>
                        <select
                            value={formData.categoryId}
                            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            <option value="">Select a category</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={() => router.push("/admin-dashboard/question-answer-update")}
                            className="cursor-pointer px-4 py-2 text-gray-600 hover:text-gray-800"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {loading ? "Creating..." : "Create Question"}
                        </button>
                    </div>
                </form>
            </motion.div>

            {/* Toast Container */}
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop />
        </div>
    );
}
