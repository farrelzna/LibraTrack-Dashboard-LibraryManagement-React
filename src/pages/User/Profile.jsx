import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import { API_URL } from "../../constant";

const tabs = ["Overview", "Activity", "Security"];

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState("Overview");
  const [isScrolled, setIsScrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    booksBorrowed: 0,
    dueReturns: 0,
    totalFines: 0,
    totalReturned: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  // Jika mau bisa pakai untuk grafik tapi saya sesuaikan hanya untuk tampilkan data
  // const [categories, setCategories] = useState([...]);
  // const [series, setSeries] = useState([...]);

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

        const totalMembers = members.length;
        const totalBooks = books.length;
        const booksBorrowed = lendings.filter(l => l.status_pengembalian === 0).length;
        const dueReturns = lendings.filter(l =>
          l.status_pengembalian === 0 &&
          new Date(l.tgl_pengembalian) < new Date()
        ).length;
        const totalReturned = lendings.filter(l => l.status_pengembalian === 1).length;
        const totalFines = fines.length;

        setStats({
          totalMembers,
          totalBooks,
          booksBorrowed,
          dueReturns,
          totalReturned,
          totalFines,
        });

        // Build recent activities
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
          .sort((a, b) => new Date(b.time) - new Date(a.time))
          .slice(0, 5);

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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const userData = {
    sessions: [
      {
        device: "Chrome on Windows",
        location: "Bogor, Indonesia",
        status: "Active now",
      },
      {
        device: "Safari on iPhone",
        location: "Jakarta, Indonesia",
        status: "Last seen 2 days ago",
      },
    ],
    accounts: [
      {
        name: "Google",
        connected: true,
      },
      {
        name: "Facebook",
        connected: false,
      },
      {
        name: "GitHub",
        connected: true,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#121212]">
      {/* Header */}
      <motion.header
        className={`sticky top-0 z-10 backdrop-blur-md ${isScrolled ? 'bg-white/80 shadow-sm' : 'bg-transparent'} transition-all duration-300`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-800 to-blue-600 flex items-center justify-center text-white font-medium">
                {/* Tidak ada data user nama, jadi kosong saja */}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h2 className="text-sm font-medium">Name</h2>
              <p className="text-xs text-neutral-500">Staff</p>
            </div>
          </div>
          <nav>
            <ul className="flex space-x-6 text-xs font-medium">
              {tabs.map((tab) => (
                <li key={tab}>
                  <button
                    onClick={() => setActiveTab(tab)}
                    className={`relative py-1 ${activeTab === tab ? 'text-black' : 'text-neutral-400 hover:text-neutral-600'}`}
                  >
                    {tab}
                    {activeTab === tab && (
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"
                        layoutId="activeTab"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </motion.header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Overview Tab */}
        {activeTab === "Overview" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            {/* Profile Card */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="col-span-1">
                <div className="aspect-square w-full bg-white rounded-2xl p-6 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-800 to-blue-600 flex items-center justify-center text-white text-2xl font-medium">
                      {/* Karena data user tidak ada, kosong saja */}
                    </div>
                    <div>
                      <h2 className="text-xl font-medium">Name</h2>
                      <p className="text-sm text-neutral-500">Email</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Location</span>
                      <span>Indonesia</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Joined</span>
                      <span>Joined Date</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="col-span-2 grid grid-cols-2 gap-4 auto-rows-fr">
                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-2xl p-6 flex flex-col justify-between hover:bg"
                >
                  <h3 className="text-xs uppercase tracking-wider text-neutral-500">Books Borrowed</h3>
                  <p className="text-3xl font-light">{stats.booksBorrowed}</p>
                </motion.div>

                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-2xl p-6 flex flex-col justify-between"
                >
                  <h3 className="text-xs uppercase tracking-wider text-neutral-500">Books Returned</h3>
                  <p className="text-3xl font-light">{stats.totalReturned}</p>
                </motion.div>

                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-2xl p-6 flex flex-col justify-between"
                >
                  <h3 className="text-xs uppercase tracking-wider text-neutral-500">Fines</h3>
                  <p className="text-3xl font-light">{stats.totalFines}</p>
                </motion.div>

                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-2xl p-6 flex flex-col justify-between"
                >
                  <h3 className="text-xs uppercase tracking-wider text-neutral-500">Due Returns</h3>
                  <p className="text-3xl font-light">{stats.dueReturns}</p>
                </motion.div>
              </div>
            </section>

            {/* Recent Activity */}
            <section className="bg-white rounded-2xl p-6">
              <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
              <ul className="space-y-3 text-sm">
                {recentActivities.length === 0 && (
                  <li className="text-neutral-500">No recent activities</li>
                )}
                {recentActivities.map((act, idx) => (
                  <li key={idx} className="flex items-center space-x-4">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                      {act.type.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p>
                        {act.type === "borrow" && `Borrowed book "${act.book}"`}
                        {act.type === "return" && `Returned book "${act.book}"`}
                        {act.type === "fine" && `Fined`}
                        {act.type === "add-book" && `Added new book "${act.book}"`}
                        {act.type === "new-member" && `New member joined`}
                      </p>
                      <p className="text-xs text-neutral-400">{new Date(act.time).toLocaleString()}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </motion.div>
        )}

        {/* Activity Tab */}
        {activeTab === "Activity" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <section className="bg-white rounded-2xl p-6">
              <h3 className="text-sm font-medium mb-6">Active Sessions</h3>
              <div className="space-y-6">
                {userData.sessions.map((session, index) => (
                  <div key={index} className="flex items-start justify-between pb-4 border-b border-neutral-100 last:border-0 last:pb-0">
                    <div>
                      <p className="text-sm font-medium">{session.device}</p>
                      <p className="text-xs text-neutral-500 mt-1">{session.location}</p>
                    </div>
                    <div className="flex items-center">
                      <span className="text-xs text-neutral-500">{session.status}</span>
                      <button className="ml-4 text-xs text-red-500 hover:underline">Logout</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </motion.div>
        )}

        {/* Security Tab */}
        {activeTab === "Security" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <section className="bg-white rounded-2xl p-6">
              <h3 className="text-sm font-medium mb-6">Connected Accounts</h3>
              <div className="space-y-6">
                {userData.accounts.map((account, index) => (
                  <div key={index} className="flex items-center justify-between pb-4 border-b border-neutral-100 last:border-0 last:pb-0">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center mr-3">
                        {account.name.charAt(0)}
                      </div>
                      <p className="text-sm font-medium">{account.name}</p>
                    </div>
                    <button
                      className={`text-xs ${account.connected ? 'text-red-500' : 'text-blue-500'} hover:underline`}
                    >
                      {account.connected ? 'Disconnect' : 'Connect'}
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-white rounded-2xl p-6">
              <h3 className="text-sm font-medium mb-6">Password</h3>
              <button className="px-4 py-2 border border-neutral-200 rounded-lg text-xs font-medium hover:bg-neutral-50 transition-colors">
                Change Password
              </button>
            </section>

            <section className="bg-white rounded-2xl p-6">
              <h3 className="text-sm font-medium mb-6">Logout</h3>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600 transition-colors"
              >
                Logout from all devices
              </button>
            </section>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default ProfilePage;