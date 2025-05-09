import { createBrowserRouter, Routes } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import MembersIndex from "../pages/members/MembersIndex";
import BooksIndex from "../pages/books/BooksIndex";
import Lendings from "../pages/lendings/index";
import Restoratiosn from "../pages/restorations/index";

import Layouts from "../template/MainLayouts";
import GuestPage from "../pages/middleware/GuestPage";
import PrivatePage from "../pages/middleware/PrivatePage";
// import AdminRoute from "../pages/middleware/AdminRoute";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Layouts />,
        children: [
            {
                path: "",
                element: <GuestPage />,
                children: [
                    { path: "", element: <Login /> },
                ]
            },
            {
                path: "/register",
                element: <GuestPage />,
                children: [
                    { path: "", element: <Register /> },
                ]
            },
            {
                path: "",
                element: <PrivatePage />,
                // route pada childern, route ynag bisa di batasi aksesnya
                children: [
                    { path: "dashboard", element: <Dashboard /> },
                    // { path: "profile", element: <Profile /> },
                    { path: "members", element: <MembersIndex /> },
                    { path: "books", element: <BooksIndex /> },
                    { path: "books/lendings", element: <Lendings /> },
                    { path: "books/restorations", element: <Restoratiosn /> },
                    // {
                    //     path: 'admin',
                    //     element: <AdminRoute />,
                    //     children: [
                    //         { path: "stuffs", element: <StuffIndex /> },
                    //         { path: "inbound", element: <InboundIndex /> },
                    //     ]
                    // }
                ]
            },
        ]
    }
])