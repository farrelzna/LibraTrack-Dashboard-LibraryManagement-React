import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Sidebar() {
    const [activeItem, setActiveItem] = useState('');
    const navigate = useNavigate();

    const handleLogout = () => {
        // Clear localStorage
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        // Redirect to login page
        navigate('/');
    };

    const menuItems = [
        { id: 'login', label: 'Login', icon: '👤', path: '/' },
        { id: 'register', label: 'Register', icon: '✨', path: '/register' },
        { id: 'members', label: 'Manage Members', icon: '👥', path: '/members' },
        { id: 'books', label: 'Manage Books', icon: '📚', path: '/books' },
        { id: 'borrow', label: 'Borrow Books', icon: '🔄', path: '/books/lendings' },
        { id: 'purchase', label: 'Purchase Books', icon: '🛒', path: '/books/restorations' },
        { id: 'history', label: 'Purchase History', icon: '📋', path: '/history' },
    ];

    return (
        <div className="min-h-screen w-72 bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100 px-4 flex flex-col">
            {/* Logo Section */}
            <div className="py-8 border-b border-gray-700">
                <h1 className="text-2xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                    Library System
                </h1>
            </div>

            {/* Navigation */}
            <nav className="mt-8 flex-grow">
                <ul className="space-y-2">
                    {menuItems.map((item) => (
                        <li key={item.id}>
                            <a
                                href={item.path}
                                className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 
                                    ${activeItem === item.id 
                                        ? 'bg-blue-600 text-white shadow-lg' 
                                        : 'hover:bg-gray-700 hover:translate-x-1'
                                    }`}
                                onClick={() => setActiveItem(item.id)}
                            >
                                <span className="text-xl mr-3">{item.icon}</span>
                                <span className="font-medium">{item.label}</span>
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Logout Button */}
            <div className="py-4 border-t border-gray-700 mt-auto">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 hover:bg-red-600 text-white"
                >
                    <span className="text-xl mr-3">🚪</span>
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </div>
    );
}