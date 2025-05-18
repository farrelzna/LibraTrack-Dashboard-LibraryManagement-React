import React, { useState } from "react";

export default function Dashboard() {
  // Dummy data untuk demo
  const stats = [
    {
      title: "Total Books",
      value: "2,521",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      ),
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      iconColor: "text-blue-500",
    },
    {
      title: "Active Members",
      value: "847",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
      bgColor: "bg-green-50",
      textColor: "text-green-600",
      iconColor: "text-green-500",
    },
    {
      title: "Books Borrowed",
      value: "156",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
          />
        </svg>
      ),
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
      iconColor: "text-purple-500",
    },
    {
      title: "Due Returns",
      value: "23",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      bgColor: "bg-red-50",
      textColor: "text-red-600",
      iconColor: "text-red-500",
    },
  ];

  const recentActivities = [
    {
      id: 1,
      user: "John Doe",
      action: "borrowed",
      book: "The Design of Everyday Things",
      time: "2 hours ago",
    },
    {
      id: 2,
      user: "Jane Smith",
      action: "returned",
      book: "Clean Code",
      time: "5 hours ago",
    },
    {
      id: 3,
      user: "Mike Johnson",
      action: "borrowed",
      book: "Learning Python",
      time: "1 day ago",
    },
    {
      id: 4,
      user: "Sarah Wilson",
      action: "returned",
      book: "JavaScript: The Good Parts",
      time: "1 day ago",
    },
  ];

  return (
    <div className="min-h-screen bg-white rounded-xl shadow-sm p-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-gray-800">
          Dashboard Overview
        </h1>
        <p className="text-sm text-gray-500">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className={`${stat.bgColor} rounded-lg p-6`}>
            <div className="flex items-center justify-between">
              <div className={`${stat.iconColor} rounded-full p-2`}>
                {stat.icon}
              </div>
              <span
                className={`${stat.textColor} text-xs font-medium px-2 py-1 rounded-full bg-white`}
              >
                Last 30 days
              </span>
            </div>
            <h3 className={`text-2xl font-bold ${stat.textColor} mt-4`}>
              {stat.value}
            </h3>
            <p className="text-gray-600 text-sm mt-1">{stat.title}</p>
          </div>
        ))}
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Recent Activities
          </h2>
          <button className="text-sm text-blue-600 hover:text-blue-700">
            View all
          </button>
        </div>
        <div className="divide-y divide-gray-200">
          {recentActivities.map((activity) => (
            <div
              key={activity.id}
              className="py-3 flex items-center justify-between"
            >
              <div className="flex items-center">
                <div
                  className={`w-2 h-2 rounded-full ${activity.action === "borrowed"
                      ? "bg-purple-500"
                      : "bg-green-500"
                    } mr-3`}
                ></div>
                <div>
                  <p className="text-sm text-gray-800">
                    <span className="font-medium">{activity.user}</span>
                    {" "}
                    {activity.action}
                    {" "}
                    <span className="font-medium">"{activity.book}"</span>
                  </p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
              <button className="text-sm text-gray-600 hover:text-blue-600">
                View details
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}