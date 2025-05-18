import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function Template() {
    return (
        <div className="flex h-screen bg-gray-50">
            <div className="flex-none">
                <Sidebar />
            </div>
            
            <div className="flex-1 p-8 overflow-auto">
                <Outlet />
            </div>
        </div>
    );
}