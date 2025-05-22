import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../../src/constant";

const AlertPage = () => {
  const [recentActivities, setRecentActivities] = useState([]);
  const [isOpen, setIsOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const [membersRes, booksRes, lendingRes, finesRes] = await Promise.all([
          axios.get(`${API_URL}member`, { headers }),
          axios.get(`${API_URL}buku`, { headers }),
          axios.get(`${API_URL}peminjaman`, { headers }),
          axios.get(`${API_URL}denda`, { headers }),
        ]);

        const members = membersRes.data || [];
        const books = booksRes.data || [];
        const lendings = lendingRes.data?.data || [];
        const fines = finesRes.data?.data || [];

        // Build recent activities (sama seperti yang sudah kamu buat)
        const activityList = [
          ...lendings.map(l => ({
            type: "borrow",
            time: l.created_at,
            userId: l.id_member,
            bookId: l.id_buku,
          })),
          ...lendings
            .filter(l => l.status_pengembalian === 1)
            .map(l => ({
              type: "return",
              time: l.updated_at,
              userId: l.id_member,
              bookId: l.id_buku,
            })),
          ...fines.map(f => ({
            type: "fine",
            time: f.created_at,
            userId: f.id_member,
            bookId: null,
          })),
          ...books.map(b => ({
            type: "add-book",
            time: b.created_at,
            bookId: b.id,
            userId: null,
          })),
          ...members.map(m => ({
            type: "new-member",
            time: m.created_at,
            userId: m.id,
            bookId: null,
          })),
        ];

        // Tambahkan info nama dan judul buku
        const formattedActivities = activityList
          .map(act => {
            const member = members.find(m => m.id === act.userId);
            const book = books.find(b => b.id === act.bookId);
            return {
              ...act,
              user: member?.nama || "Unknown Member",
              book: book?.judul || (act.bookId ? "Unknown Book" : null),
            };
          })
          .sort((a, b) => new Date(b.time) - new Date(a.time)) // sort descending by time
          .slice(0, 20); // ambil 10 aktivitas terbaru

        setRecentActivities(formattedActivities);

      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to retrieve dashboard data, try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);


  if (loading) return <p className="p-10">Loading...</p>;
  if (error) return <p className="p-10 text-red-600">{error}</p>;

  return (
    <div className="min-h-screen bg-white rounded-xl shadow-xs p-10">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl text-gray-800">Notifications Overview</h1>
        <p className="text-xs text-gray-500">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>
      <div className="mb-8 w-140 text-justify">
        <p className="text-xs text-gray-800">This dashboard presents a real-time summary of important data to help users monitor system activity quickly and efficiently. All key information is displayed in the form of graphs, statistics and up-to-date lists for easy management.</p>
      </div>

      {/* Recent Activities */}
      <div className="mt-6">
        <div
          className="flex items-center justify-between cursor-pointer select-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          <h2 className="text-xl text-gray-800  hover:text-blue-400 transition duration-300">Recent Activities</h2>
          <button
            aria-label={isOpen ? "Collapse recent activities" : "Expand recent activities"}
            className="text-gray-500 focus:outline-none"
          >
            {/* Icon panah bawah/atas */}
            {isOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 transform rotate-180"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="divide-y divide-gray-200">
          {recentActivities.length === 0 ? (
            <p className="text-xs text-gray-500">No recent activity.</p>
          ) : (
            recentActivities.map((activity, index) => (
              <div key={index} className="py-3 ps-6 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center">
                  <div
                    className={`w-2 h-2 rounded-full mr-3 ${activity.type === "borrow"
                      ? "bg-purple-500"
                      : activity.type === "return"
                        ? "bg-green-500"
                        : activity.type === "fine"
                          ? "bg-red-500"
                          : activity.type === "add-book"
                            ? "bg-blue-500"
                            : activity.type === "new-member"
                              ? "bg-yellow-500"
                              : "bg-gray-400"
                      }`}
                  ></div>
                  <div>
                    <p className="text-xs text-gray-800">
                      {activity.type === "borrow" && (
                        <>
                          <span className="font-medium">{activity.user}</span> borrowed{" "}
                          <span className="font-medium">"{activity.book}"</span>
                        </>
                      )}
                      {activity.type === "return" && (
                        <>
                          <span className="font-medium">{activity.user}</span> returned{" "}
                          <span className="font-medium">"{activity.book}"</span>
                        </>
                      )}
                      {activity.type === "fine" && (
                        <>
                          <span className="font-medium">{activity.user}</span> got fined
                        </>
                      )}
                      {activity.type === "add-book" && (
                        <>
                          New book added: <span className="font-medium">"{activity.book}"</span>
                        </>
                      )}
                      {activity.type === "new-member" && (
                        <>
                          New member registered: <span className="font-medium">{activity.user}</span>
                        </>
                      )}
                    </p>
                    <p className="text-xs text-gray-500">{new Date(activity.time).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AlertPage;
