import React, { useState } from "react";
import { GiHamburgerMenu } from "react-icons/gi";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import SideBar from "./../layout/SideBar";
import AdminDashboard from "./../components/AdminDashboard";
import UserDashboard from "./../components/UserDashboard";
import BookManagement from "./../components/BookManagement";
import Catalog from "./../components/Catalog";
import Users from "../components/Users";
import MyBorrowedBooks from "./../components/MyBorrowedBooks";

const Home = () => {
  const [isSideBarOpen, setIsSideBarOpen] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState("");

  const { user, isAuthenticated } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to={"/login"} />;
  }
  return (
    <>
      <div className="relative md:pl-64 flex min-h-screen bg-gray-100">
        <div className="md:hidden z-10 absolute right-6 top-4 sm:top-6 flex justify-center items-center bg-black rounded-md h-9 w-9 text-white">
          <GiHamburgerMenu
            className="text-2xl"
            onClick={() => setIsSideBarOpen(!isSideBarOpen)}
          />
        </div>
        <SideBar
          isSideBarOpen={isSideBarOpen}
          setIsSideBarOpen={setIsSideBarOpen}
          setSelectedComponent={setSelectedComponent}
        />

        {/* Switch case statment is used here as an IIFE (Imediatly Invoked Function Expression) */}
        {(() => {
          const role = user?.role?.toLowerCase();

          switch (selectedComponent) {
            case "Dashboard":
              return role === "user" ? <UserDashboard /> : <AdminDashboard />;
            case "Books":
              return <BookManagement />;
            case "Catalog":
              return role === "admin" ? <Catalog /> : <UserDashboard />;
            case "Users":
              return role === "admin" ? <Users /> : <UserDashboard />;
            case "MyBorrowedBooks":
              return <MyBorrowedBooks />;
            default:
              return role === "user" ? <UserDashboard /> : <AdminDashboard />;
          }
        })()}
      </div>
    </>
  );
};

export default Home;
