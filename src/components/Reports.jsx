import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, BarChart, XAxis, YAxis, CartesianGrid, Bar } from 'recharts';

function Reports({ user, userSalary }) {
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalSavings, setTotalSavings] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [expensePeriod, setExpensePeriod] = useState("monthly");
  const [expenseData, setExpenseData] = useState([]);
  const [isLoadingBar, setIsLoadingBar] = useState(false);
  const [activeChart, setActiveChart] = useState("pie"); // For mobile tab navigation

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
      // Use 'created_at' for the query to ensure accurate filtering
      const { data, error } = await supabase
        .from("expenses")
        .select("amount, created_at, description")
        .eq("user_id", user.id)
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString())
        .order("created_at", { ascending: true });
        
      if (error) {
        throw error;
      }

      // Aggregate data based on the selected period
      const processedData = processExpenseData(data, period);
      setExpenseData(processedData);
    } catch (error) {
      console.error("Error fetching expenses by period:", error);
      setExpenseData([]);
    } finally {
        setIsLoadingBar(false);
    }
  };

  // Helper function to aggregate expenses for the bar chart
  const processExpenseData = (data, period) => {
    // For daily and weekly, show each individual expense
    if (period === "daily" || period === "weekly") {
      return data.map(item => ({
        name: `${item.description} (${new Date(item.created_at).toLocaleDateString()})`,
        amount: parseFloat(item.amount)
      }));
    }

    // For monthly and yearly, group and sum expenses
    const aggregatedData = {};
    const dateFormatter = (date) => {
      const d = new Date(date);
      if (period === "monthly") {
        return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      } else { // yearly
        return d.getFullYear().toString();
      }
    };
  
    data.forEach(expense => {
      const key = dateFormatter(expense.created_at);
      if (aggregatedData[key]) {
        aggregatedData[key] += parseFloat(expense.amount);
      } else {
        aggregatedData[key] = parseFloat(expense.amount);
      }
    });

    return Object.keys(aggregatedData).map(key => ({
      name: key,
      amount: aggregatedData[key]
    }));
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

  // Mobile-friendly chart dimensions
  const mobileChartHeight = 250;
  const mobilePieChartOuterRadius = 80;

  return (
    <div className="bg-white rounded-2xl shadow-md p-4 md:p-8 h-[730px] overflow-y-auto">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 md:mb-8">Financial Reports</h2>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
        </div>
      ) : userSalary ? (
        <div className="space-y-8 md:space-y-12">
          {/* Mobile Chart Navigation Tabs */}
          <div className="md:hidden flex border-b border-gray-200 mb-4">
            <button
              onClick={() => setActiveChart("pie")}
              className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition ${
                activeChart === "pie" 
                  ? "border-green-600 text-green-600" 
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Distribution
            </button>
            <button
              onClick={() => setActiveChart("bar")}
              className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition ${
                activeChart === "bar" 
                  ? "border-green-600 text-green-600" 
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Expenses
            </button>
          </div>

          {/* Salary Distribution Pie Chart - Mobile Responsive */}
          <div className={`${activeChart === "pie" ? "block" : "hidden"} md:block`}>
            <h3 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4 md:mb-6">Salary Distribution</h3>
            <div className="flex flex-col md:grid md:grid-cols-2 gap-6 md:gap-8 items-center">
              <div className="w-full h-64 md:h-120">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={filteredPieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={mobilePieChartOuterRadius}
                      fill="#8884d8"
                      label={(entry) => `${entry.name}: ${formatCurrency(entry.value)}`}
                    >
                      {filteredPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-3 md:space-y-4 w-full">
                <p className="text-base md:text-lg text-gray-700">Monthly Salary: <span className="font-semibold">{formatCurrency(userSalary)}</span></p>
                <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                  <span className="inline-block w-3 h-3 md:w-4 md:h-4 rounded-full bg-red-500"></span>
                  <p className="text-base md:text-lg text-gray-700">Expenses: <span className="font-semibold">{formatCurrency(totalExpenses)}</span></p>
                </div>
                <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                  <span className="inline-block w-3 h-3 md:w-4 md:h-4 rounded-full bg-blue-500"></span>
                  <p className="text-base md:text-lg text-gray-700">Savings: <span className="font-semibold">{formatCurrency(totalSavings)}</span></p>
                </div>
                <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                  <span className="inline-block w-3 h-3 md:w-4 md:h-4 rounded-full bg-green-600"></span>
                  <p className="text-base md:text-lg text-gray-700">Remaining: <span className="font-semibold">{formatCurrency(remainingBalance)}</span></p>
                </div>
              </div>
            </div>
          </div>

          <hr className="my-6 md:my-8 hidden md:block" />

          {/* Expenses Bar Chart - Mobile Responsive */}
          <div className={`${activeChart === "bar" ? "block" : "hidden"} md:block`}>
            <h3 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4">Expenses Over Time</h3>
            
            {/* Period Selector - Mobile Optimized */}
            <div className="flex flex-wrap justify-center gap-2 mb-6 md:mb-8">
              {["daily", "weekly", "monthly", "yearly"].map((period) => (
                <button
                  key={period}
                  onClick={() => setExpensePeriod(period)}
                  className={`px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition flex-1 min-w-[60px] md:min-w-0 ${
                    expensePeriod === period 
                      ? "bg-green-600 text-white" 
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>
            
            {isLoadingBar ? (
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 md:h-10 md:w-10 border-b-2 border-green-600"></div>
              </div>
            ) : ( 
              <div className="w-full h-[500px] sm:h-[600px] md:h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={expenseData} 
                    margin={{ top: 20, right: 10, left: 10, bottom: 30 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      interval={0}
                      fontSize={10}
                    />
                    <YAxis 
                      formatter={(value) => formatCurrency(value)}
                      fontSize={10}
                    />
                    <Tooltip 
                      formatter={(value) => formatCurrency(value)} 
                      labelFormatter={(label) => `Expense: ${label}`}
                      contentStyle={{ fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar 
                      dataKey="amount" 
                      fill="#ef4444" 
                      name="Amount" 
                      radius={[2, 2, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 md:py-16 text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 md:h-20 md:w-20 mx-auto text-gray-300 mb-4 md:mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-lg md:text-2xl mt-4 px-4">Please set your monthly salary to view reports.</p>
        </div>
      )}
    </div>
  );
}

export default Reports;