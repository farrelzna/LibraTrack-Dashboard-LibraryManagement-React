import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function Template() {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const handleSidebarState = (isOpen) => {
        setSidebarOpen(isOpen);
    };

    return (
        <div className="flex h-screen bg-gray-50 relative">
            <div className="flex-none">
                <Sidebar onStateChange={handleSidebarState} />
            </div>
            
            <div 
                className={`
                    flex-1 
                    transition-all 
                    duration-500 
                    ease-in-out 
                    ${sidebarOpen ? 'ml-0' : 'ml-15'} 
                    overflow-auto
                `}
            >
                <Outlet />
            </div>
        </div>
    );
}