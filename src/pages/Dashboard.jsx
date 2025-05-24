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
  const [activeTab, setActiveTab] = useState('about');

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
    <div className="min-h-screen bg-white rounded-xl shadow-xs p-10">
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
      <div className="mb-8 w-140 text-justify">
        <p className="text-xs text-gray-800">This dashboard presents a real-time summary of important data to help users monitor system activity quickly and efficiently. All key information is displayed in the form of graphs, statistics and up-to-date lists for easy management.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statsDisplay.map((stat, index) => (
          <div key={index} className={`${stat.bgColor} rounded-lg p-6`}>
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
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="py-10">
        <h2 className="text-xl text-gray-800 hover:text-blue-400 transition duration-300">Library Stats</h2>
        <Chart options={chartOptions} series={series} type="area" height={350} />
      </div>

      {/* Recent Activities */}
      <div>
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

      <div className="w-full bg-white rounded-lg mt-10 shadow-xs">
        {/* Tabs */}
        <div className="flex flex-wrap text-sm font-medium text-center text-gray-500 border-b border-gray-200 rounded-t-lg bg-gray-50">
          {['about', 'services', 'statistics'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`inline-block p-4 rounded-t-lg ${activeTab === tab
                ? 'text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:to-blue-600 transition-colors duration-300'
                : 'hover:text-gray-600 hover:bg-gray-100'
                }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="p-4 md:p-8 bg-white rounded-lg">
          {activeTab === 'about' && (
            <div>
              <h2 className="mb-3 text-3xl font-semibold tracking-tight text-gray-900">
                Improving Literacy in Thousands of Schools & Communities
              </h2>
              <p className="mb-3 text-gray-500">
                Our library provides quick access to thousands of books and digital reference collections, helping students, faculty and the general public to continue to grow and learn for life.
              </p>
              <a
                href="#"
                className="inline-flex items-center font-medium text-blue-600 hover:text-blue-800"
              >
                Learn more
                <svg
                  className="w-2.5 h-2.5 ml-2 rtl:rotate-180"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 6 10"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 9 4-4-4-4"
                  />
                </svg>
              </a>
            </div>
          )}

          {activeTab === 'services' && (
            <div>
              <h2 className="mb-5 text-2xl font-semibold tracking-tight text-gray-900">
                Our Library Services
              </h2>
              <ul className="space-y-4 text-gray-500">
                {[
                  'Borrowing and returning digital and physical books',
                  'Collection search with smart catalog system',
                  'Online book reservation and booking service',
                  'Borrowing history and automatic fine report',
                ].map((item, i) => (
                  <li key={i} className="flex items-center space-x-2 rtl:space-x-reverse">
                    <svg
                      className="shrink-0 w-3.5 h-3.5 text-blue-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
                    </svg>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === 'statistics' && (
            <dl className="grid grid-cols-2 gap-8 text-gray-900 sm:grid-cols-3 xl:grid-cols-6">
              {[
                { title: '50K+', desc: 'Book available' },
                { title: '10K+', desc: 'Active member' },
                { title: '1.2K+', desc: 'Borrowing per month' },
                { title: '500+', desc: 'E-Book collection' },
                { title: '95%', desc: 'On-time return rate' },
                { title: '24/7', desc: 'Online catalog access' },
              ].map(({ title, desc }, i) => (
                <div key={i} className="flex flex-col">
                  <dt className="mb-2 text-3xl font-smeibold">{title}</dt>
                  <dd className="text-gray-500">{desc}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
