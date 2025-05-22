import React from "react";

const SettingsPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-gray-800">Settings</h1>
          <p className="text-sm text-gray-500">Manage your account preferences.</p>
        </div>

        {/* Account Information */}
        <section className="bg-white rounded-xl shadow p-6 space-y-6">
          <h2 className="text-xl font-semibold text-gray-800">Account Info</h2>
          <div className="flex items-center gap-4">
            <img
              src="https://i.pravatar.cc/100"
              alt="Avatar"
              className="w-16 h-16 rounded-full object-cover ring-2 ring-blue-500"
            />
            <button className="text-sm text-blue-600 hover:underline">
              Change Avatar
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">Name</label>
              <input
                type="text"
                defaultValue="John Doe"
                className="mt-1 w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Email</label>
              <input
                type="email"
                defaultValue="johndoe@example.com"
                className="mt-1 w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Save Changes
          </button>
        </section>

        {/* Password Section */}
        <section className="bg-white rounded-xl shadow p-6 space-y-6">
          <h2 className="text-xl font-semibold text-gray-800">Change Password</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">Current Password</label>
              <input
                type="password"
                className="mt-1 w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">New Password</label>
              <input
                type="password"
                className="mt-1 w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Update Password
          </button>
        </section>

        {/* Notification Preferences */}
        <section className="bg-white rounded-xl shadow p-6 space-y-6">
          <h2 className="text-xl font-semibold text-gray-800">Notifications</h2>
          <div className="space-y-4 text-sm text-gray-700">
            <div className="flex items-center justify-between">
              <span>Email me when I borrow a book</span>
              <input type="checkbox" className="toggle toggle-sm" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <span>Email me before due date</span>
              <input type="checkbox" className="toggle toggle-sm" />
            </div>
            <div className="flex items-center justify-between">
              <span>Send monthly activity report</span>
              <input type="checkbox" className="toggle toggle-sm" />
            </div>
          </div>
        </section>

        {/* Appearance */}
        <section className="bg-white rounded-xl shadow p-6 space-y-6">
          <h2 className="text-xl font-semibold text-gray-800">Appearance</h2>
          <div className="flex gap-4 text-sm">
            <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">
              Light Mode
            </button>
            <button className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900">
              Dark Mode
            </button>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold text-red-600">Danger Zone</h2>
          <p className="text-sm text-gray-600 mb-4">
            Deleting your account is irreversible. Please proceed with caution.
          </p>
          <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
            Delete My Account
          </button>
        </section>
      </div>
    </div>
  );
};

export default SettingsPage;
