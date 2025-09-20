import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, BarChart, XAxis, YAxis, CartesianGrid, Bar } from 'recharts';

function Reports({ user, userSalary }) {
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalSavings, setTotalSavings] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [expensePeriod, setExpensePeriod] = useState("monthly"); // Default to monthly
  const [expenseData, setExpenseData] = useState([]);
  const [isLoadingBar, setIsLoadingBar] = useState(false);

  const formatCurrency = (amount) => {
    if (isNaN(amount) || amount === null) return "$0.00";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Function to fetch total expenses for the current month (for Pie Chart)
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
      return total;
    } catch (error) {
      console.error("Error fetching total expenses:", error);
      return 0;
    }
  };

  // Function to fetch total savings for the current month (for Pie Chart)
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
      return total;
    } catch (error) {
      console.error("Error fetching total savings:", error);
      return 0;
    }
  };
  
  // New function to fetch expenses by period (for Bar Chart)
  const fetchExpensesByPeriod = async (period) => {
    if (!user) {
      setExpenseData([]);
      return;
    }
    setIsLoadingBar(true);

    let startDate, endDate;
    const today = new Date();

    switch (period) {
      case "daily":
        startDate = new Date(today.setHours(0, 0, 0, 0));
        endDate = new Date(today.setHours(23, 59, 59, 999));
        break;
      case "weekly":
        const day = today.getDay();
        const diff = today.getDate() - day + (day === 0 ? -6 : 1); 
        startDate = new Date(today.setDate(diff));
        endDate = new Date(today.setDate(diff + 6));
        break;
      case "monthly":
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case "yearly":
        startDate = new Date(today.getFullYear(), 0, 1);
        endDate = new Date(today.getFullYear(), 11, 31);
        break;
      default:
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    }
    
    try {
      const { data, error } = await supabase
        .from("expenses")
        .select("description, amount, date")
        .eq("user_id", user.id)
        .gte("date", startDate.toISOString().split('T')[0])
        .lte("date", endDate.toISOString().split('T')[0])
        .order("date", { ascending: true });
        
      if (error) {
        throw error;
      }

      setExpenseData(data);
    } catch (error) {
      console.error("Error fetching expenses by period:", error);
      setExpenseData([]);
    } finally {
        setIsLoadingBar(false);
    }
  };

  // UseEffect for initial data (Pie Chart) - runs once
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      await Promise.all([fetchTotalExpenses(), fetchTotalSavings()]);
      setIsLoading(false);
    };

    fetchInitialData();
  }, [user]);

  // UseEffect for dynamic data (Bar Chart) - runs on period change
  useEffect(() => {
    if (user) {
      fetchExpensesByPeriod(expensePeriod);
    }
  }, [user, expensePeriod]);

  const remainingBalance = userSalary - totalExpenses - totalSavings;
  const pieChartData = [
    { name: 'Expenses', value: totalExpenses, color: '#ef4444' },
    { name: 'Savings', value: totalSavings, color: '#3b82f6' },
    { name: 'Remaining', value: remainingBalance > 0 ? remainingBalance : 0, color: '#22c55e' },
  ];

  const filteredPieData = pieChartData.filter(data => data.value > 0);

  return (
    <div className="bg-white rounded-2xl shadow-md p-8 h-[700px] overflow-y-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-8">Financial Reports</h2>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
        </div>
      ) : userSalary ? (
        <div className="space-y-12">
          {/* Salary Distribution Pie Chart */}
          <div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-6">Salary Distribution</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="w-full h-80">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={filteredPieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      label={(entry) => `${entry.name}: ${formatCurrency(entry.value)}`}
                    >
                      {filteredPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-4">
                <p className="text-lg text-gray-700">Monthly Salary: <span className="font-semibold">{formatCurrency(userSalary)}</span></p>
                <div className="flex items-center space-x-2">
                  <span className="inline-block w-4 h-4 rounded-full bg-red-500"></span>
                  <p className="text-lg text-gray-700">Total Expenses: <span className="font-semibold">{formatCurrency(totalExpenses)}</span></p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="inline-block w-4 h-4 rounded-full bg-blue-500"></span>
                  <p className="text-lg text-gray-700">Total Savings: <span className="font-semibold">{formatCurrency(totalSavings)}</span></p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="inline-block w-4 h-4 rounded-full bg-green-600"></span>
                  <p className="text-lg text-gray-700">Remaining Balance: <span className="font-semibold">{formatCurrency(remainingBalance)}</span></p>
                </div>
              </div>
            </div>
          </div>

          <hr className="my-8" />

          {/* Expenses Bar Chart */}
          <div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Expenses Over Time</h3>
            <div className="flex justify-center space-x-4 mb-8">
              <button
                onClick={() => setExpensePeriod("daily")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${expensePeriod === "daily" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
              >
                Daily
              </button>
              <button
                onClick={() => setExpensePeriod("weekly")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${expensePeriod === "weekly" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
              >
                Weekly
              </button>
              <button
                onClick={() => setExpensePeriod("monthly")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${expensePeriod === "monthly" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setExpensePeriod("yearly")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${expensePeriod === "yearly" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
              >
                Yearly
              </button>
            </div>
            
            {isLoadingBar ? (
                <div className="flex justify-center items-center py-10">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
                </div>
            ) : (
                <div className="w-full h-96">
                    <ResponsiveContainer>
                        <BarChart data={expenseData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="description" />
                            <YAxis formatter={(value) => formatCurrency(value)} />
                            <Tooltip formatter={(value) => formatCurrency(value)} labelFormatter={(label) => `Expense: ${label}`} />
                            <Legend />
                            <Bar dataKey="amount" fill="#ef4444" name="Amount" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-16 text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto text-gray-300 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-2xl mt-4">Please set your monthly salary to view reports.</p>
        </div>
      )}
    </div>
  );
}

export default Reports;