import { useState } from 'react';
import {
    HomeIcon,
    CurrencyDollarIcon,
    BanknotesIcon,
    WalletIcon,
    ChartPieIcon,
    Cog6ToothIcon,
    UserCircleIcon,
    ArrowRightOnRectangleIcon,
    Bars3Icon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { supabase } from '../supabase';

function Sidebar({ activeTab, setActiveTab, user }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleLogout = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error("Error logging out:", error);
                alert("An error occurred during logout. Please try again.");
            }
        } catch (error) {
            console.error("An unexpected error occurred:", error);
        }
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const handleNavClick = (tab) => {
        setActiveTab(tab);
        // Close sidebar on mobile after clicking a link
        if (window.innerWidth < 1024) {
            setIsSidebarOpen(false);
        }
    };

    // Navigation items array for cleaner code
    const navItems = [
        { id: "dashboard", label: "Dashboard", icon: HomeIcon },
        { id: "salary", label: "Salary Management", icon: CurrencyDollarIcon },
        { id: "expenses", label: "Expenses", icon: BanknotesIcon },
        { id: "savings", label: "Savings", icon: WalletIcon },
        { id: "reports", label: "Reports", icon: ChartPieIcon },
        { id: "settings", label: "Settings", icon: Cog6ToothIcon }
    ];

    return (
        <>
            {/* Burger Menu Button - Mobile Only */}
            {!isSidebarOpen && (
            <button
                onClick={toggleSidebar}
                className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-teal-600 text-white rounded-lg shadow-md hover:bg-green-600 transition"
            >
                <Bars3Icon className="h-6 w-6" />
            </button>
            )}

            {/* Overlay for mobile when sidebar is open */}
            {isSidebarOpen && (
                <div 
                    className="lg:hidden fixed inset-0 bg-black/50 bg-opacity-50 z-40"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed lg:static top-0 left-0 h-full w-80 lg:w-1/4 flex flex-col z-40
                transform transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="bg-white rounded-r-2xl lg:rounded-2xl h-full shadow-xl lg:shadow-md p-6 flex flex-col">
                    <div className="lg:hidden flex justify-end mb-4">
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="p-2 text-gray-500 hover:text-gray-700"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>

                    <h2 className="font-bold text-2xl mt-3 text-gray-800 mb-6">Navigation</h2>
                    
                    <nav className="space-y-3 flex-1">
                        {navItems.map((item) => {
                            const IconComponent = item.icon;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => handleNavClick(item.id)}
                                    className={`w-full text-left px-6 py-4 rounded-lg text-xl transition flex items-center space-x-3 ${
                                        activeTab === item.id 
                                            ? "bg-green-100 text-green-700 font-medium" 
                                            : "text-gray-600 hover:bg-gray-100"
                                    }`}
                                >
                                    <IconComponent className="h-6 w-6" />
                                    <span>{item.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                    
                    {/* User Info and Logout */}
                    <div className="bg-gray-100 rounded-2xl shadow-md p-6 mt-8">
                        <div className="flex items-center space-x-4 mb-4">
                            <UserCircleIcon className="h-12 w-12 text-gray-500" />
                            <div className="overflow-hidden">
                                <p className="font-semibold text-lg text-gray-800 truncate">{user?.email}</p>
                                <p className="text-sm text-gray-500">Logged in</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition"
                        >
                            <ArrowRightOnRectangleIcon className="h-5 w-5" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Sidebar;