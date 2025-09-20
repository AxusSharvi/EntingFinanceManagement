import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import SalaryList from "./SalaryList";

function Home({ user }) {
    const [salary, setSalary] = useState("");
    const [message, setMessage] = useState("");
    const [activeTab, setActiveTab] = useState("dashboard");
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [userSalary, setUserSalary] = useState(null);
    const [isLoadingSalary, setIsLoadingSalary] = useState(true);
    const [userProfile, setUserProfile] = useState(null);

    // Fetch user profile data
    useEffect(() => {
        const fetchUserProfile = async () => {
            if (!user) return;

            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('name')
                    .eq('id', user.id)
                    .single();

                if (!error && data) {
                    setUserProfile(data);
                }
            } catch (error) {
                console.error("Error fetching user profile:", error);
            }
        };

        fetchUserProfile();
    }, [user]);

    // Fetch user's latest salary - ADD THIS USEEFFECT
    useEffect(() => {
        const fetchInitialSalary = async () => {
            if (!user) return;
            
            setIsLoadingSalary(true);
            try {
                const { data, error } = await supabase
                    .from("salaries")
                    .select("monthly_salary")
                    .eq("user_id", user.id)
                    .order("created_at", { ascending: false })
                    .limit(1)
                    .single();

                if (!error && data) {
                    setUserSalary(data.monthly_salary);
                }
            } catch (error) {
                console.error("Error fetching user salary:", error);
            } finally {
                setIsLoadingSalary(false);
            }
        };

        fetchInitialSalary();
    }, [user]);

    const handleSubmit = async () => {
        if (!salary) {
            setMessage("Please enter a salary amount.");
            return;
        }

        if (isEditing) {
            // Update existing salary record
            const { data, error } = await supabase
                .from("salaries")
                .update({ monthly_salary: salary })
                .eq("id", editingId);

            if (error) setMessage(error.message);
            else {
                setMessage("Salary updated successfully!");
                setIsEditing(false);
                setEditingId(null);
                setUserSalary(salary); // Update the displayed salary
            }
        } else {
            // Insert new salary record
            const { data, error } = await supabase.from("salaries").insert([
                {
                    user_id: user.id,
                    monthly_salary: salary,
                },
            ]);

            if (error) setMessage(error.message);
            else {
                setMessage("Salary saved successfully!");
                setUserSalary(salary); // Update the displayed salary
            }
        }

        setSalary(""); // clear input
    };

    const handleEdit = (salaryData) => {
        setSalary(salaryData.monthly_salary);
        setIsEditing(true);
        setEditingId(salaryData.id);
        setMessage("Editing salary entry...");
    };

    const cancelEdit = () => {
        setIsEditing(false);
        setEditingId(null);
        setSalary("");
        setMessage("");
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.reload();
    };

    // Format currency function
    const formatCurrency = (amount) => {
        if (!amount) return "$0.00";
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const fetchLatestSalary = async () => {
        setIsLoadingSalary(true); // ADD THIS LINE
        try {
            const { data } = await supabase
                .from("salaries")
                .select("monthly_salary")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false })
                .limit(1)
                .single();

            if (data) setUserSalary(data.monthly_salary);
        } catch (error) {
            console.error("Error fetching latest salary:", error);
        } finally {
            setIsLoadingSalary(false); // ADD THIS LINE
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-cyan-50 p-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <header className="bg-white rounded-2xl shadow-md p-8 mb-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-4xl font-bold text-green-600">
                                FinanceTracker
                            </h1>
                            <p className="text-xl text-gray-600 mt-2">Welcome back, {userProfile?.name || user.user_metadata?.name}</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition duration-300 flex items-center text-lg"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Logout
                        </button>
                    </div>
                </header>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Navigation */}
                    <div className="lg:w-1/4">
                        <div className="bg-white rounded-2xl shadow-md p-6">
                            <h2 className="font-bold text-2xl text-gray-800 mb-6">Navigation</h2>
                            <nav className="space-y-3">
                                <button
                                    onClick={() => setActiveTab("dashboard")}
                                    className={`w-full text-left px-6 py-4 rounded-lg text-xl transition ${activeTab === "dashboard" ? "bg-green-100 text-green-700 font-medium" : "text-gray-600 hover:bg-gray-100"}`}
                                >
                                    Dashboard
                                </button>
                                <button
                                    onClick={() => setActiveTab("salary")}
                                    className={`w-full text-left px-6 py-4 rounded-lg text-xl transition ${activeTab === "salary" ? "bg-green-100 text-green-700 font-medium" : "text-gray-600 hover:bg-gray-100"}`}
                                >
                                    Salary Management
                                </button>
                                <button
                                    onClick={() => setActiveTab("reports")}
                                    className={`w-full text-left px-6 py-4 rounded-lg text-xl transition ${activeTab === "reports" ? "bg-green-100 text-green-700 font-medium" : "text-gray-600 hover:bg-gray-100"}`}
                                >
                                    Reports
                                </button>
                                <button
                                    onClick={() => setActiveTab("settings")}
                                    className={`w-full text-left px-6 py-4 rounded-lg text-xl transition ${activeTab === "settings" ? "bg-green-100 text-green-700 font-medium" : "text-gray-600 hover:bg-gray-100"}`}
                                >
                                    Settings
                                </button>
                            </nav>
                        </div>

                        {/* Quick Stats Card */}
                        <div className="bg-white rounded-2xl shadow-md p-6 mt-8">
                            <h2 className="font-bold text-2xl text-gray-800 mb-6">Quick Stats</h2>
                            <div className="space-y-6">
                                <div>
                                    <p className="text-lg text-gray-600">Monthly Budget</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {userSalary ? formatCurrency(userSalary * 0.7) : formatCurrency(0)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-lg text-gray-600">Expenses This Month</p>
                                    <p className="text-2xl font-bold text-red-600">
                                        {userSalary ? formatCurrency(userSalary * 0.4) : formatCurrency(0)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-lg text-gray-600">Remaining Balance</p>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {userSalary ? formatCurrency(userSalary * 0.3) : formatCurrency(0)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:w-3/4">
                        {activeTab === "dashboard" && (
                            <div className="bg-white rounded-2xl shadow-md p-8">
                                <h2 className="text-3xl font-bold text-gray-800 mb-8">Financial Dashboard</h2>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                                    <div className="bg-gradient-to-r from-green-400 to-green-600 text-white p-6 rounded-2xl shadow">
                                        <h3 className="text-xl font-semibold">Total Income</h3>
                                        {isLoadingSalary ? (
                                            <div className="flex justify-center py-4">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                                            </div>
                                        ) : (
                                            <>
                                                <p className="text-4xl font-bold mt-3">
                                                    {userSalary ? formatCurrency(userSalary) : "No salary set"}
                                                </p>
                                                <p className="text-lg mt-2">
                                                    {userSalary ? "+12% from last month" : "Add your salary in Salary Management"}
                                                </p>
                                            </>
                                        )}
                                    </div>
                                    <div className="bg-gradient-to-r from-blue-400 to-blue-600 text-white p-6 rounded-2xl shadow">
                                        <h3 className="text-xl font-semibold">Total Expenses</h3>
                                        <p className="text-4xl font-bold mt-3">
                                            {userSalary ? formatCurrency(userSalary * 0.4) : formatCurrency(0)}
                                        </p>
                                        <p className="text-lg mt-2">-5% from last month</p>
                                    </div>
                                    <div className="bg-gradient-to-r from-purple-400 to-purple-600 text-white p-6 rounded-2xl shadow">
                                        <h3 className="text-xl font-semibold">Savings Rate</h3>
                                        <p className="text-4xl font-bold mt-3">
                                            {userSalary ? "28%" : "0%"}
                                        </p>
                                        <p className="text-lg mt-2">
                                            {userSalary ? "+3% from last month" : "Add your salary to calculate savings"}
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-6 rounded-2xl mb-8">
                                    <h3 className="text-2xl font-semibold text-gray-800 mb-6">Recent Transactions</h3>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center p-4 bg-white rounded-lg shadow-sm">
                                            <div>
                                                <p className="font-medium text-xl">Grocery Shopping</p>
                                                <p className="text-lg text-gray-500">May 15, 2023</p>
                                            </div>
                                            <span className="text-red-600 font-semibold text-xl">-{formatCurrency(125.50)}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-4 bg-white rounded-lg shadow-sm">
                                            <div>
                                                <p className="font-medium text-xl">Salary Deposit</p>
                                                <p className="text-lg text-gray-500">May 10, 2023</p>
                                            </div>
                                            <span className="text-green-600 font-semibold text-xl">+{userSalary ? formatCurrency(userSalary) : formatCurrency(0)}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-4 bg-white rounded-lg shadow-sm">
                                            <div>
                                                <p className="font-medium text-xl">Utility Bill</p>
                                                <p className="text-lg text-gray-500">May 8, 2023</p>
                                            </div>
                                            <span className="text-red-600 font-semibold text-xl">-{formatCurrency(230.75)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "salary" && (
                            <div className="bg-white rounded-2xl shadow-md p-8">
                                <h2 className="text-3xl font-bold text-gray-800 mb-8">Salary Management</h2>

                                <div className="mb-10">
                                    <div className="bg-green-50 p-6 rounded-2xl mb-8">
                                        <h3 className="text-2xl font-semibold text-green-800 mb-4">
                                            {isEditing ? "Edit Monthly Salary" : "Add Monthly Salary"}
                                        </h3>
                                        <div className="flex flex-col md:flex-row gap-5">
                                            <div className="flex-grow">
                                                <label htmlFor="salary" className="block text-xl font-medium text-gray-700 mb-2">
                                                    Monthly Salary ($)
                                                </label>
                                                <input
                                                    type="number"
                                                    className="w-full px-5 py-4 text-xl border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                                                    id="salary"
                                                    value={salary}
                                                    onChange={(e) => setSalary(e.target.value)}
                                                    placeholder="Enter your monthly salary"
                                                />
                                            </div>
                                            <div className="flex items-end gap-3">
                                                <button
                                                    onClick={handleSubmit}
                                                    className="bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 transition duration-300 font-medium text-xl"
                                                >
                                                    {isEditing ? "Update" : "Add"} Salary
                                                </button>
                                                {isEditing && (
                                                    <button
                                                        onClick={cancelEdit}
                                                        className="bg-gray-500 text-white px-8 py-4 rounded-lg hover:bg-gray-600 transition duration-300 font-medium text-xl"
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {message && (
                                        <div className={`p-5 rounded-lg mb-8 text-xl ${message.includes("successful")
                                                ? "bg-green-100 text-green-700"
                                                : "bg-red-100 text-red-700"
                                            }`}>
                                            {message}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <h3 className="text-2xl font-semibold text-gray-800 mb-6">Salary History</h3>
                                    <SalaryList user={user} onEdit={handleEdit} onSalaryUpdate={fetchLatestSalary} />

                                </div>
                            </div>
                        )}

                        {/* Other tabs remain the same */}
                        {activeTab === "reports" && (
                            <div className="bg-white rounded-2xl shadow-md p-8">
                                <h2 className="text-3xl font-bold text-gray-800 mb-8">Financial Reports</h2>
                                <div className="text-center py-16 text-gray-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto text-gray-300 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                    <p className="text-2xl mt-4">Financial reports will be available soon.</p>
                                </div>
                            </div>
                        )}

                        {activeTab === "settings" && (
                            <div className="bg-white rounded-2xl shadow-md p-8">
                                <h2 className="text-3xl font-bold text-gray-800 mb-8">Account Settings</h2>
                                <div className="text-center py-16 text-gray-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto text-gray-300 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <p className="text-2xl mt-4">Account settings will be available soon.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;