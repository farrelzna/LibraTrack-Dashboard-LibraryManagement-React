import React, { useState, useEffect } from "react";
import { Home, Users, Bell, Settings } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";


export default function Sidebar({onStateChange}) {
  const [activeItem, setActiveItem] = useState('');
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      id: 'dashboard',
      label: "Dashboard",
      path: "/dashboard",
      icon: <Home className="w-5 h-5" />,
      showInSidebar: false,
      showInFloating: true
    },
    {
      id: 'members',
      label: 'Manage Members',
      path: '/members',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      showInSidebar: true,
      showInFloating: false
    },
    {
      id: 'books',
      label: 'Manage Books',
      path: '/books',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      showInSidebar: true,
      showInFloating: false
    },
    {
      id: 'notification',
      label: "Notifications",
      path: "/notifications",
      icon: <Bell className="w-5 h-5" />,
      showInSidebar: false,
      showInFloating: true
    },
    {
      id: 'borrow',
      label: 'Borrow Books',
      path: '/books/lendings',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
      showInSidebar: true,
      showInFloating: false
    },
    {
      id: 'history',
      label: 'Lending History',
      path: '/books/lendings/history',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      showInSidebar: true,
      showInFloating: false
    },
    {
      id: 'profile',
      label: "Profile",
      path: "/profile",
      icon: <Users className="w-5 h-5" />,
      showInSidebar: false,
      showInFloating: true
    },
    {
      id: 'fines',
      label: 'Fines Data',
      path: '/books/restorations',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      showInSidebar: true,
      showInFloating: false
    },
    {
      id: 'setting',
      label: "Settings",
      path: "/settings",
      icon: <Settings className="w-5 h-5" />,
      showInSidebar: false,
      showInFloating: true
    }
  ];

  useEffect(() => {
    const path = location.pathname;
    const activeMenu = menuItems.find(item => item.path === path);
    if (activeMenu) {
      setActiveItem(activeMenu.id);
    }
  }, [location]);

  useEffect(() => {
    onStateChange?.(isOpen);
}, [isOpen, onStateChange]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const toggleSidebar = () => setIsOpen(!isOpen);


  return (

    <div className="relative flex">
      {/* Sidebar */}
      <div className={`transition-all duration-300 flex flex-col ${isOpen ? 'w-50 px-4 bg-white min-h-screen' : 'fixed top-1/2 -translate-y-1/2 left-0 w-15 px-2 h-100 bg-white rounded-r-2xl shadow-lg'}`}>
        <div className="py-6 flex justify-center">
          <div className="text-xl font-semibold text-gray-800 h-10 flex items-center justify-center">
            {isOpen ? (
              <div className="flex gap-2 text-center align-center justify-center transition">
                <svg className="w-6 h-6 mt-0.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <p>LibraTrack</p>
              </div>
            ) : (
              <div className="flex gap-2 text-center align-center justify-center transition mt-10">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            )}
          </div>
        </div>

        <div className="absolute top-4 transition-all duration-300 cursor-pointer" style={{ left: isOpen ? '10.7rem' : '1rem', top: isOpen ? '2rem' : '1rem' }}>
          <button
            onClick={toggleSidebar}
            className=" text-gray-600 hover:scale-105 transition-transform"
          >
            {isOpen ? (
              <svg className="w-5 h-5 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}

          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-2 flex-grow">
          <ul className="space-y-1">
            {menuItems.filter(item => item.showInSidebar).map((item) => (
              <li key={item.id}>
                <a
                  href={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200
                    ${activeItem === item.id
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveItem(item.id);
                    navigate(item.path);
                  }}
                >
                  <div className="mr-3">{item.icon}</div>
                  {isOpen && <span className="font-medium text-xs">{item.label}</span>}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="py-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className={`text-xs font-medium transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
              Logout
            </span>
          </button>
        </div>
      </div>

      {/* floating bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <div className="flex items-center gap-4 bg-white/20 backdrop-blur-md shadow-lg px-6 py-2 rounded-full border border-white/30">
          {menuItems.filter(item => item.showInFloating).map((item) => (
            <button
              key={item.id}
              type="button"
              className={`relative group flex flex-col items-center justify-center transition-colors duration-300 ease-in-out
                ${activeItem === item.id
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
                }`}
              onClick={() => {
                setActiveItem(item.id);
                navigate(item.path);
              }}
            >
              <div className="transition-transform duration-200 group-hover:scale-125">
                {item.icon}
              </div>

              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 px-2 py-1 rounded-md bg-gray-800 text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                {item.label}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
