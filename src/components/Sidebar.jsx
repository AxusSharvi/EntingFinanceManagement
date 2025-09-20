import {
    HomeIcon,
    CurrencyDollarIcon,
    BanknotesIcon,
    WalletIcon,
    ChartPieIcon,
    Cog6ToothIcon,
    UserCircleIcon,
    ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { supabase } from '../supabase';

function Sidebar({ activeTab, setActiveTab, user }) {
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

    return (
        <div className="lg:w-1/4 flex flex-col">
            <div className="bg-white rounded-2xl h-full shadow-md p-6">
                <h2 className="font-bold text-2xl text-gray-800 mb-6">Navigation</h2>
                <nav className="space-y-3">
                    <button
                        onClick={() => setActiveTab("dashboard")}
                        className={`w-full text-left px-6 py-4 rounded-lg text-xl transition flex items-center space-x-3 ${activeTab === "dashboard" ? "bg-green-100 text-green-700 font-medium" : "text-gray-600 hover:bg-gray-100"}`}
                    >
                        <HomeIcon className="h-6 w-6" />
                        <span>Dashboard</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("salary")}
                        className={`w-full text-left px-6 py-4 rounded-lg text-xl transition flex items-center space-x-3 ${activeTab === "salary" ? "bg-green-100 text-green-700 font-medium" : "text-gray-600 hover:bg-gray-100"}`}
                    >
                        <CurrencyDollarIcon className="h-6 w-6" />
                        <span>Salary Management</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("expenses")}
                        className={`w-full text-left px-6 py-4 rounded-lg text-xl transition flex items-center space-x-3 ${activeTab === "expenses" ? "bg-green-100 text-green-700 font-medium" : "text-gray-600 hover:bg-gray-100"}`}
                    >
                        <BanknotesIcon className="h-6 w-6" />
                        <span>Expenses</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("savings")}
                        className={`w-full text-left px-6 py-4 rounded-lg text-xl transition flex items-center space-x-3 ${activeTab === "savings" ? "bg-green-100 text-green-700 font-medium" : "text-gray-600 hover:bg-gray-100"}`}
                    >
                        <WalletIcon className="h-6 w-6" />
                        <span>Savings</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("reports")}
                        className={`w-full text-left px-6 py-4 rounded-lg text-xl transition flex items-center space-x-3 ${activeTab === "reports" ? "bg-green-100 text-green-700 font-medium" : "text-gray-600 hover:bg-gray-100"}`}
                    >
                        <ChartPieIcon className="h-6 w-6" />
                        <span>Reports</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("settings")}
                        className={`w-full text-left px-6 py-4 rounded-lg text-xl transition flex items-center space-x-3 ${activeTab === "settings" ? "bg-green-100 text-green-700 font-medium" : "text-gray-600 hover:bg-gray-100"}`}
                    >
                        <Cog6ToothIcon className="h-6 w-6" />
                        <span>Settings</span>
                    </button>
                </nav>
            </div>
            
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
    );
}

export default Sidebar;