"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalQuestions: 0,
    totalBlogs: 0,
    totalCategories: 0
  });

  useEffect(() => {
    // Simulate loading stats
    const timer = setTimeout(() => {
      setStats({
        totalUsers: 25,
        totalQuestions: 48,
        totalBlogs: 12,
        totalCategories: 6
      });
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const dashboardCards = [
    {
      title: "Manage Questions",
      description: "Add, edit, or delete quiz questions and answers",
      icon: "📝",
      link: "/admin-dashboard/update-question-answer",
      color: "from-blue-600 to-blue-800"
    },
    {
      title: "Manage Blogs",
      description: "Create and publish blog posts",
      icon: "📰",
      link: "/admin-dashboard/update-blog",
      color: "from-purple-600 to-purple-800"
    },
    {
      title: "User Management",
      description: "View and manage user accounts",
      icon: "👥",
      link: "/admin-dashboard/users",
      color: "from-green-600 to-green-800"
    },
    {
      title: "User Scores",
      description: "Check user performance and scores",
      icon: "🏆",
      link: "/admin-dashboard/check-user-score",
      color: "from-yellow-600 to-yellow-800"
    }
  ];

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <div className="text-blue-400 text-4xl mb-2">👤</div>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <div className="text-gray-400">Total Users</div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <div className="text-purple-400 text-4xl mb-2">❓</div>
            <div className="text-2xl font-bold">{stats.totalQuestions}</div>
            <div className="text-gray-400">Total Questions</div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <div className="text-green-400 text-4xl mb-2">📚</div>
            <div className="text-2xl font-bold">{stats.totalBlogs}</div>
            <div className="text-gray-400">Total Blogs</div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <div className="text-yellow-400 text-4xl mb-2">🏷️</div>
            <div className="text-2xl font-bold">{stats.totalCategories}</div>
            <div className="text-gray-400">Categories</div>
          </div>
        </div>
        
        {/* Quick Access Cards */}
        <h2 className="text-2xl font-bold mb-4">Quick Access</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dashboardCards.map((card, index) => (
            <Link 
              key={index} 
              href={card.link}
              className={`bg-gradient-to-br ${card.color} rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}
            >
              <div className="text-4xl mb-4">{card.icon}</div>
              <h3 className="text-xl font-bold mb-2">{card.title}</h3>
              <p className="text-gray-200 text-sm">{card.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
