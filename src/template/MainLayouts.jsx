import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function Template() {
    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar - Fixed position */}
            <div className="flex-none">
                <Sidebar />
            </div>
            
            {/* Main Content - Takes remaining space */}
            <div className="flex-1 p-8 overflow-auto">
                <Outlet />
            </div>
        </div>
    );
}