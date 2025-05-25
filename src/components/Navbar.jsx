import React from "react";
import { Home, Book, Users, Bell, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FloatingPillNavbar = () => {
  const navigate = useNavigate();

  const menuItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: <Home size={20} />,
    },
    {
      label: "Notifi",
      path: "/notifications",
      icon: <Bell size={20} />,
    },
    {
      label: "Profile",
      path: "/profile",
      icon: <Users size={20} />,
    },
    {
      label: "Settings",
      path: "/settings",
      icon: <Settings size={20} />,
    },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-4 bg-white/20 backdrop-blur-md shadow-lg px-6 py-2 rounded-full border border-white/30">
        {menuItems.map((item, index) => (
          <button
            key={index}
            type="button"
            onClick={() => navigate(item.path)}
            className="relative group flex flex-col items-center justify-center text-gray-600 hover:text-blue-600 transition-colors duration-300 ease-in-out"
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
  );
};

export default FloatingPillNavbar;
