import React from "react";

const ProfilePage = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-md p-6">
        <div className="flex items-center gap-6">
          <img
            src="https://i.pravatar.cc/100"
            alt="Profile"
            className="w-20 h-20 rounded-full object-cover ring-2 ring-blue-500"
          />
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">John Doe</h2>
            <p className="text-sm text-gray-500">johndoe@example.com</p>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded mt-2 inline-block">
              Admin
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-5xl mx-auto mt-6">
        <div className="flex gap-4 border-b text-sm text-gray-500">
          {["Overview", "Settings", "Security"].map((tab) => (
            <button
              key={tab}
              className="px-4 py-2 hover:text-blue-600 hover:border-b-2 hover:border-blue-600 transition-all"
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content Sections */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {/* Profile Summary */}
        <div className="col-span-1 bg-white rounded-xl shadow p-5 space-y-4">
          <h3 className="text-lg font-medium text-gray-800">About</h3>
          <p className="text-sm text-gray-600">
            Software engineer with 5+ years experience in web development.
            Passionate about UI/UX and clean code.
          </p>
          <div>
            <p className="text-xs text-gray-500">Location</p>
            <p className="text-sm text-gray-700">Jakarta, Indonesia</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Joined</p>
            <p className="text-sm text-gray-700">Jan 12, 2020</p>
          </div>
        </div>

        {/* Statistics */}
        <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow p-5">
            <h4 className="text-sm text-gray-500 mb-1">Books Borrowed</h4>
            <p className="text-2xl font-bold text-blue-600">124</p>
          </div>
          <div className="bg-white rounded-xl shadow p-5">
            <h4 className="text-sm text-gray-500 mb-1">Books Returned</h4>
            <p className="text-2xl font-bold text-green-600">118</p>
          </div>
          <div className="bg-white rounded-xl shadow p-5">
            <h4 className="text-sm text-gray-500 mb-1">Fines</h4>
            <p className="text-2xl font-bold text-red-500">Rp 35.000</p>
          </div>
          <div className="bg-white rounded-xl shadow p-5">
            <h4 className="text-sm text-gray-500 mb-1">Last Login</h4>
            <p className="text-sm font-medium text-gray-800">2 hours ago</p>
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="max-w-5xl mx-auto mt-6 bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Recent Activity
        </h3>
        <ul className="divide-y text-sm text-gray-600">
          <li className="py-2">Borrowed “Clean Code” - 2 days ago</li>
          <li className="py-2">Returned “Atomic Habits” - 5 days ago</li>
          <li className="py-2">Paid fine - Rp 10.000 - last week</li>
        </ul>
      </div>

      {/* Device Logins */}
      <div className="max-w-5xl mx-auto mt-6 bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Active Sessions
        </h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span>Chrome on Windows</span>
            <span className="text-gray-400">Jakarta • Active now</span>
          </div>
          <div className="flex justify-between">
            <span>Safari on iPhone</span>
            <span className="text-gray-400">Bandung • 2 days ago</span>
          </div>
        </div>
      </div>

      {/* Connected Accounts */}
      <div className="max-w-5xl mx-auto mt-6 bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Connected Accounts
        </h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center">
            <span>Google</span>
            <button className="text-blue-600 hover:underline text-sm">
              Disconnect
            </button>
          </div>
          <div className="flex justify-between items-center">
            <span>GitHub</span>
            <button className="text-blue-600 hover:underline text-sm">
              Connect
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
