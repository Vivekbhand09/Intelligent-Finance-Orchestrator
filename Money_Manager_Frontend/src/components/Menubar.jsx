import { useState, useRef, useEffect, useContext } from "react";
import {User, LogOut, X, Menu} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {assets} from "../assets/assets.js";
import {AppContext} from "../context/AppContext.jsx";
import Sidebar from "./Sidebar.jsx";

const Menubar = ({ activeMenu }) => {
    const [openSideMenu, setOpenSideMenu] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const { clearUser, user } = useContext(AppContext);
    const navigate = useNavigate();

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        // Add event listener when dropdown is open
        if (showDropdown) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        // Cleanup event listener
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showDropdown]);

    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
    };

    const handleLogout = () => {
        localStorage.clear();
        clearUser();
        setShowDropdown(false);
        navigate("/login");
    };

    return (
        <div className="flex items-center justify-between gap-5 bg-white border border-b border-gray-200/50 backdrop-blur-[2px] py-4 px-4 sm:px-7 sticky top-0 z-30">
            {/* Left side - Menu button and title */}
            <div className="flex items-center gap-5">
                <button
                    className="block lg:hidden text-black hover:bg-gray-100 p-1 rounded transition-colors"
                    onClick={() => {
                        setOpenSideMenu(!openSideMenu);
                    }}
                >
                    {openSideMenu ? (
                        <X className="text-2xl" />
                    ) : (
                        <Menu className="text-2xl" />
                    )}
                </button>

                <div className="flex items-center gap-2">
                    <img src={assets.logo} alt="logo" className="h-10 w-10" />
                    <span className="text-lg font-medium text-black truncate">Money Manager</span>
                </div>
            </div>

            {/* Right side - Avatar dropdown */}
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={toggleDropdown}
                    className="flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200
                    rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-800
                    focus:ring-offset-2"
                >
                    <img src={user?.profileImageUrl} alt="profile" className="w-10 h-10 rounded-full cursor-pointer"/>
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                        {/* User info section (optional) */}
                        <div className="px-4 py-3 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full">
                                    {user? (
                                        <>
                                            <img src={user.profileImageUrl} alt="profile" />
                                        </>
                                    ): (
                                        <>
                                            <User className="w-4 h-4 text-purple-600"/>
                                        </>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {user.fullName}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                </div>
                            </div>
                        </div>

                        {/* Dropdown options */}
                        <div className="py-1">
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700
                                 hover:bg-gray-50 transition-colors duration-150"
                            >
                                <LogOut className="w-4 h-4 text-gray-500" />
                                <span class="cursor-pointer">Logout</span>

                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Mobile side menu */}
            {openSideMenu && (
                <div className="fixed top-[73px] left-0 right-0 bg-white border-b border-gray-200 lg:hidden z-20">
                    <Sidebar activeMenu={activeMenu} />
                </div>
            )}
        </div>
    );
};

export default Menubar;
