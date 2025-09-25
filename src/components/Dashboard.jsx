import { useState, useEffect } from "react";
import { supabase } from "../supabase";

function Dashboard({ user, userSalary, isLoadingSalary }) {
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalSavings, setTotalSavings] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const formatCurrency = (amount) => {
    if (!amount) return "$0.00";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  // Function to fetch total expenses for the current month
  const fetchTotalExpenses = async () => {
    if (!user) return 0;
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString();

    try {
      const { data, error } = await supabase
        .from("expenses")
        .select("amount")
        .eq("user_id", user.id)
        .gte("created_at", startOfMonth)
        .lte("created_at", endOfMonth);

      if (error) {
        throw error;
      }

      const total = data.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
      setTotalExpenses(total);
    } catch (error) {
      console.error("Error fetching total expenses:", error);
    }
  };

  // Function to fetch total savings for the current month
  const fetchTotalSavings = async () => {
    if (!user) return 0;
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString();

    try {
      const { data, error } = await supabase
        .from("savings")
        .select("current_amount")
        .eq("user_id", user.id)
        .gte("created_at", startOfMonth)
        .lte("created_at", endOfMonth);
        
      if (error) {
        throw error;
      }
      
      const total = data.reduce((sum, savings) => sum + parseFloat(savings.current_amount), 0);
      setTotalSavings(total);
    } catch (error) {
      console.error("Error fetching total savings:", error);
    }
  };

  const fetchRecentExpenses = async () => {
    if (!user) {
      return;
    }

    try {
      const { data, error } = await supabase
        .from("expenses")
        .select("id, description, amount, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (!error) {
        setRecentExpenses(data);
      } else {
        console.error("Error fetching recent expenses:", error);
      }
    } catch (error) {
      console.error("Error fetching recent expenses:", error);
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      if (user) {
        await Promise.all([
          fetchRecentExpenses(),
          fetchTotalExpenses(),
          fetchTotalSavings()
        ]);
      }
      setIsLoading(false);
    };

    fetchAllData();
  }, [user]);

  const savingsRate = userSalary > 0 ? ((totalSavings / userSalary) * 100).toFixed(0) : 0;

  return (
    <div className="bg-white rounded-2xl shadow-md h-[730px] overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-md p-4 mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 md:mb-8">Financial Dashboard</h2>

        {/* Stats Grid - Mobile: 1 column, Tablet+: 3 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-10">
          {/* Income Card */}
          <div className="bg-gradient-to-r from-green-400 to-green-600 text-white p-4 md:p-6 rounded-2xl shadow">
            <h3 className="text-lg md:text-xl font-semibold">Total Income</h3>
            {isLoadingSalary ? (
              <div className="flex justify-center py-3 md:py-4">
                <div className="animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-b-2 border-white"></div>
              </div>
            ) : (
              <>
                <p className="text-2xl md:text-4xl font-bold mt-2 md:mt-3">
                  {userSalary ? formatCurrency(userSalary) : "No salary set"}
                </p>
                <p className="text-sm md:text-lg mt-1 md:mt-2 opacity-90">
                  {userSalary ? "+12% from last month" : "Add your salary in Salary Management"}
                </p>
              </>
            )}
          </div>

          {/* Expenses Card */}
          <div className="bg-gradient-to-r from-blue-400 to-blue-600 text-white p-4 md:p-6 rounded-2xl shadow">
            <h3 className="text-lg md:text-xl font-semibold">Total Expenses</h3>
            {isLoading ? (
              <div className="flex justify-center py-3 md:py-4">
                <div className="animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-b-2 border-white"></div>
              </div>
            ) : (
              <>
                <p className="text-2xl md:text-4xl font-bold mt-2 md:mt-3">
                  {formatCurrency(totalExpenses)}
                </p>
                <p className="text-sm md:text-lg mt-1 md:mt-2 opacity-90">-5% from last month</p>
              </>
            )}
          </div>

          {/* Savings Rate Card */}
          <div className="bg-gradient-to-r from-purple-400 to-purple-600 text-white p-4 md:p-6 rounded-2xl shadow">
            <h3 className="text-lg md:text-xl font-semibold">Savings Rate</h3>
            {isLoading || userSalary === null ? (
              <div className="flex justify-center py-3 md:py-4">
                <div className="animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-b-2 border-white"></div>
              </div>
            ) : (
              <>
                <p className="text-2xl md:text-4xl font-bold mt-2 md:mt-3">
                  {savingsRate}%
                </p>
                <p className="text-sm md:text-lg mt-1 md:mt-2 opacity-90">
                  {userSalary ? "+3% from last month" : "Add your salary to calculate savings"}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Recent Transactions Section */}
        <div className="bg-gray-50 p-4 md:p-6 rounded-2xl mb-6 md:mb-8">
          <h3 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4 md:mb-6">Recent Transactions</h3>
          {isLoading ? (
            <div className="flex justify-center items-center py-6 md:py-10">
              <div className="animate-spin rounded-full h-8 w-8 md:h-10 md:w-10 border-b-2 border-green-600"></div>
            </div>
          ) : recentExpenses.length > 0 ? (
            <div className="space-y-3 md:space-y-4">
              {recentExpenses.map((expense) => (
                <div key={expense.id} className="flex justify-between items-center p-3 md:p-4 bg-white rounded-lg shadow-sm">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-base md:text-xl truncate">{expense.description}</p>
                    <p className="text-sm md:text-lg text-gray-500">{formatDate(expense.created_at)}</p>
                  </div>
                  <span className="text-red-600 font-semibold text-base md:text-xl ml-2 flex-shrink-0">
                    -{formatCurrency(expense.amount)}
                  </span>
                </div>
              ))}
              {/* Salary Deposit */}
              <div className="flex justify-between items-center p-3 md:p-4 bg-white rounded-lg shadow-sm">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-base md:text-xl truncate">Salary Deposit</p>
                  <p className="text-sm md:text-lg text-gray-500">
                    {userSalary ? formatDate(new Date().toISOString()) : "---"}
                  </p>
                </div>
                <span className="text-green-600 font-semibold text-base md:text-xl ml-2 flex-shrink-0">
                  +{userSalary ? formatCurrency(userSalary) : formatCurrency(0)}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 md:py-10 text-gray-500">
              <p className="text-base md:text-lg">No recent expenses found.</p>
              <p className="text-sm md:text-base mt-1">Add some expenses to see them here.</p>
            </div>
          )}
        </div>

        {/* Quick Actions for Mobile */}
        <div className="lg:hidden bg-white p-4 rounded-2xl shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <button className="bg-green-500 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-green-600 transition">
              Add Expense
            </button>
            <button className="bg-blue-500 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-600 transition">
              View Reports
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;