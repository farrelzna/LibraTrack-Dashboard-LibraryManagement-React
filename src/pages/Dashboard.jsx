import React, { useEffect, useState } from "react";
import axios from "axios";
import Chart from "react-apexcharts";
import { motion } from "framer-motion";
import { API_URL } from "../../src/constant";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalMembers: 0,
    booksBorrowed: 0,
    dueReturns: 0,
    totalFines: 0,
    totalReturned: 0,
  });
  const [categories, setCategories] = useState([
    "Active Members",
    "Total Books",
    "Books Borrowed",
    "Due Returns",
    "Total Returned",
    "Total Fines",
  ]);
  const [series, setSeries] = useState([
    {
      name: "Total",
      data: [0, 0, 0, 0, 0],
    },
  ]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [isOpen, setIsOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [popularBooks, setPopularBooks] = useState([]);
  const [activeMemberStats, setActiveMemberStats] = useState([]);
  const [borrowingTrends, setBorrowingTrends] = useState({
    labels: [],
    data: [],
  });

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
        const totalLendings = lendings.length;
        const totalReturned = lendings.filter(l => l.status_pengembalian === 1).length; 1
        const totalFines = fines.length;

        // update state dashboard
        const booksBorrowed = lendings.filter(l => l.status_pengembalian === 0).length;
        const dueReturns = lendings.filter(l =>
          l.status_pengembalian === 0 &&
          new Date(l.tgl_pengembalian) < new Date()
        ).length;

        setStats({
          totalMembers,
          totalBooks,
          booksBorrowed,
          dueReturns,
          totalReturned,
          totalFines,
        });

        // Process popular books
        const bookBorrowCounts = lendings.reduce((acc, lending) => {
          acc[lending.id_buku] = (acc[lending.id_buku] || 0) + 1;
          return acc;
        }, {});

        const topBooks = Object.entries(bookBorrowCounts)
          .map(([bookId, count]) => ({
            book: books.find(b => b.id === parseInt(bookId)),
            count
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        setPopularBooks(topBooks);

        // Process active member stats
        const memberBorrowCounts = lendings.reduce((acc, lending) => {
          acc[lending.id_member] = (acc[lending.id_member] || 0) + 1;
          return acc;
        }, {});

        const topMembers = Object.entries(memberBorrowCounts)
          .map(([memberId, count]) => ({
            member: members.find(m => m.id === parseInt(memberId)),
            count
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        setActiveMemberStats(topMembers);

        // Process borrowing trends (last 6 months)
        const last6Months = Array.from({ length: 6 }, (_, i) => {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          return date.toLocaleString('default', { month: 'short' });
        }).reverse();

        const monthlyBorrows = lendings.reduce((acc, lending) => {
          const month = new Date(lending.created_at).toLocaleString('default', { month: 'short' });
          acc[month] = (acc[month] || 0) + 1;
          return acc;
        }, {});

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
          .slice(0, 5);

        setRecentActivities(formattedActivities);

        setSeries([
          {
            name: "Total",
            data: [totalMembers, totalBooks, booksBorrowed, dueReturns, totalReturned, totalFines],
          },
        ]);

        setBorrowingTrends({
          labels: last6Months,
          data: last6Months.map(month => monthlyBorrows[month] || 0)
        });

      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to retrieve dashboard data, try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Mapping stats object ke array agar bisa di-render di UI sesuai kebutuhan
  const statsDisplay = [
    {
      title: "Total Books",
      value: stats.totalBooks.toLocaleString(),
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
      value: stats.totalMembers.toLocaleString(),
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
      value: stats.booksBorrowed.toLocaleString(),
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
      value: stats.dueReturns.toLocaleString(),
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
    // Tambahan card Total Fines (Denda)
    {
      title: "Total Fines",
      value: stats.totalFines?.toLocaleString() || "0",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M12 8c-1.657 0-3 1.567-3 3.5S10.343 15 12 15s3-1.567 3-3.5-1.343-3.5-3-3.5z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M12 3v3m0 12v3m9-9h-3M6 12H3"
          />
        </svg>
      ),
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-600",
      iconColor: "text-yellow-500",
    },
    // Tambahan card Total Returned (Pengembalian)
    {
      title: "Total Returned",
      value: stats.totalReturned?.toLocaleString() || "0",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M9 12l2 2 4-4m2 2v6a2 2 0 01-2 2H7a2 2 0 01-2-2v-6a2 2 0 012-2h7z"
          />
        </svg>
      ),
      bgColor: "bg-teal-50",
      textColor: "text-teal-600",
      iconColor: "text-teal-500",
    },
  ];


  const chartOptions = {
    chart: {
      type: "bar",
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "50%",
      },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: categories,
    },
    yaxis: {
      title: { text: "Amount" },
      min: 0,
    },
    tooltip: {
      y: { formatter: (val) => `${val} data` },
    },
    colors: ["#4f46e5"],
    legend: {
      show: false,
    },
  };


  if (loading) return <p className="p-10">Loading...</p>;
  if (error) return <p className="p-10 text-red-600">{error}</p>;

  return (
    <div className="container min-h-screen p-10">
      <div className=" bg-white rounded-xl shadow-xs p-10">
        <motion.header
          className={`transition-all duration-300`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl text-gray-800">Dashboard Overview</h1>
            <p className="text-xs text-gray-500">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7 }}
          >
            <div className="mb-8 w-140 text-justify">
              <p className="text-xs text-gray-800">This dashboard presents a real-time summary of important data to help users monitor system activity quickly and efficiently. All key information is displayed in the form of graphs, statistics and up-to-date lists for easy management.</p>
            </div>
          </motion.div>
        </motion.header>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {statsDisplay.map((stat, index) => (
              <motion.div
                whileHover={{ y: -10 }}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: `0.3` }}
                key={index}
                className={`${stat.bgColor} rounded-lg p-6`}
              >
                <div className="flex items-center justify-between">
                  <div className={`${stat.iconColor} rounded-full p-2`}>{stat.icon}</div>
                  <span
                    className={`${stat.textColor} text-xs font-medium px-2 py-1 rounded bg-white`}
                  >
                    Last 30 days
                  </span>
                </div>
                <h3 className={`text-2xl font-bold ${stat.textColor} mt-4`}>{stat.value}</h3>
                <p className="text-gray-600 text-xs mt-1">{stat.title}</p>
              </motion.div>
            ))}
          </div>

          {/* Chart */}
          <div className="py-10">
            <h2 className="text-xl text-gray-800 hover:text-blue-400 transition duration-300">Library Stats</h2>
            <Chart options={chartOptions} series={series} type="area" height={350} />
          </div>

          {/* Recent Activities */}
          <div className="mb-4">
            <div
              className="flex items-center justify-between cursor-pointer select-none"
              onClick={() => setIsOpen(!isOpen)}
            >
              <h2 className="text-xl text-gray-800 hover:text-blue-400 transition duration-300">Recent Activities</h2>
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
                  <motion.div
                    whileHover={{ y: -3 }}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: `0.3` }}
                    key={index}
                    className="py-3 ps-6 flex items-center justify-between hover:bg-gray-50"
                  >
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
                  </motion.div>
                ))
              )}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-10">
                {/* Popular Books Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className=""
                >
                  <h2 className="text-xl text-gray-800 hover:text-blue-400 transition duration-300 mb-4">Most Borrowed Books</h2>
                  <div className="space-y-4">
                    {popularBooks.map((item, index) => (
                      <motion.div
                        whileHover={{ y: -5 }}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: `0.3` }}
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-semibold text-gray-500">{index + 1}</span>
                          <div>
                            <h3 className="text-xs">{item.book?.judul || 'Unknown Book'}</h3>
                            <p className="text-xs text-gray-500">Borrowed {item.count} times</p>
                          </div>
                        </div>
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(item.count / popularBooks[0].count) * 100}%` }}
                            transition={{ duration: 0.8, delay: index * 0.1 }}
                            className="h-full bg-indigo-500"
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Active Members Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className=""
                >
                  <h2 className="text-xl text-gray-800 hover:text-blue-400 transition duration-300 mb-4">Most Active Members</h2>
                  <div className="space-y-4">
                    {activeMemberStats.map((item, index) => (
                      <motion.divma
                        whileHover={{ y: -5 }}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: `0.3` }}
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-lg font-semibold text-gray-500">{index + 1}</span>
                          <div>
                            <h3 className="text-xs">{item.member?.nama || 'Unknown Member'}</h3>
                            <p className="text-xs text-gray-500">{item.count} books borrowed</p>
                          </div>
                        </div>
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(item.count / activeMemberStats[0].count) * 100}%` }}
                            transition={{ duration: 0.8, delay: index * 0.1 }}
                            className="h-full bg-rose-500"
                          />
                        </div>
                      </motion.divma>
                    ))}
                  </div>
                </motion.div>

                {/* Borrowing Trends Chart */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="lg:col-span-2"
                >
                  <h2 className="text-xl text-gray-800 hover:text-blue-400 transition duration-300 mb-4">Borrowing Trends</h2>
                  <Chart
                    options={{
                      chart: { type: 'area' },
                      xaxis: { categories: borrowingTrends.labels },
                      stroke: { curve: 'smooth' },
                      fill: { type: 'gradient' },
                      colors: ['#4F46E5'],
                      tooltip: { theme: 'light' }
                    }}
                    series={[{ name: 'Books Borrowed', data: borrowingTrends.data }]}
                    type="area"
                    height={320}
                  />
                </motion.div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Disini */}

      </div >
    </div >
  );
};

export default Dashboard;
