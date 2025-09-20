import { useState, useEffect } from "react";
import { supabase } from "../supabase";

function Expenses({ user, userSalary }) {
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "food",
    date: new Date().toISOString().split('T')[0]
  });
  const [message, setMessage] = useState("");
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [remainingBalance, setRemainingBalance] = useState(0);

  // Expense categories
  const categories = [
    { value: "food", label: "Food & Dining" },
    { value: "transport", label: "Transportation" },
    { value: "housing", label: "Housing" },
    { value: "utilities", label: "Utilities" },
    { value: "entertainment", label: "Entertainment" },
    { value: "health", label: "Health & Fitness" },
    { value: "shopping", label: "Shopping" },
    { value: "tuition", label: "tuition" },
    { value: "other", label: "Other" }
  ];

  // Fetch expenses and calculate totals
  const fetchExpenses = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (!error && data) {
        setExpenses(data);
        
        // Calculate total expenses
        const total = data.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
        setTotalExpenses(total);
        
        // Calculate remaining balance
        if (userSalary) {
          setRemainingBalance(userSalary - total);
        }
      }
    } catch (error) {
      console.error("Error fetching expenses:", error);
      setMessage("Error loading expenses");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [user]);

  useEffect(() => {
    if (userSalary) {
      setRemainingBalance(userSalary - totalExpenses);
    }
  }, [userSalary, totalExpenses]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.description || !formData.amount) {
      setMessage("Please fill in all required fields");
      return;
    }

    if (parseFloat(formData.amount) <= 0) {
      setMessage("Amount must be greater than 0");
      return;
    }

    try {
      const { error } = await supabase
        .from("expenses")
        .insert([
          {
            user_id: user.id,
            description: formData.description,
            amount: parseFloat(formData.amount),
            category: formData.category,
            date: formData.date
          }
        ]);

      if (error) {
        setMessage(error.message);
      } else {
        setMessage("Expense added successfully!");
        setFormData({
          description: "",
          amount: "",
          category: "food",
          date: new Date().toISOString().split('T')[0]
        });
        fetchExpenses(); // Refresh the list
      }
    } catch (error) {
      setMessage("An error occurred while adding the expense");
      console.error("Error adding expense:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      try {
        const { error } = await supabase
          .from("expenses")
          .delete()
          .eq("id", id);

        if (error) {
          setMessage(error.message);
        } else {
          setMessage("Expense deleted successfully!");
          fetchExpenses(); // Refresh the list
        }
      } catch (error) {
        setMessage("An error occurred while deleting the expense");
        console.error("Error deleting expense:", error);
      }
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return "$0.00";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      food: "bg-yellow-100 text-yellow-800",
      transport: "bg-blue-100 text-blue-800",
      housing: "bg-purple-100 text-purple-800",
      utilities: "bg-gray-100 text-gray-800",
      entertainment: "bg-pink-100 text-pink-800",
      health: "bg-green-100 text-green-800",
      shopping: "bg-indigo-100 text-indigo-800",
      other: "bg-gray-100 text-gray-800"
    };
    return colors[category] || colors.other;
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-8 h-[700px] overflow-y-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-8">Expense Management</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-green-50 p-6 rounded-2xl border border-green-200">
          <h3 className="text-lg font-semibold text-green-800 mb-2">Monthly Salary</h3>
          <p className="text-3xl font-bold text-green-600">
            {userSalary ? formatCurrency(userSalary) : "No salary set"}
          </p>
        </div>
        
        <div className="bg-red-50 p-6 rounded-2xl border border-red-200">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Total Expenses</h3>
          <p className="text-3xl font-bold text-red-600">
            {formatCurrency(totalExpenses)}
          </p>
        </div>
        
        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Remaining Balance</h3>
          <p className="text-3xl font-bold text-blue-600">
            {formatCurrency(remainingBalance)}
          </p>
        </div>
      </div>

      {/* Add Expense Form */}
      <div className="bg-gray-50 p-6 rounded-2xl mb-8">
        <h3 className="text-2xl font-semibold text-gray-800 mb-6">Add New Expense</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <input
                type="text"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                placeholder="Enter expense description"
                required
              />
            </div>
            
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                Amount ($) *
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                placeholder="0.00"
                min="0.01"
                step="0.01"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
              />
            </div>
          </div>

          {message && (
            <div className={`p-3 rounded-lg text-sm ${
              message.includes("successful") 
                ? "bg-green-100 text-green-700" 
                : "bg-red-100 text-red-700"
            }`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition duration-300 font-medium"
          >
            Add Expense
          </button>
        </form>
      </div>

      {/* Expenses List */}
      <div>
        <h3 className="text-2xl font-semibold text-gray-800 mb-6">Recent Expenses</h3>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
          </div>
        ) : expenses.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-lg">No expenses recorded yet</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{formatDate(expense.date)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{expense.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(expense.category)}`}>
                        {categories.find(c => c.value === expense.category)?.label || 'Other'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-red-600">-{formatCurrency(expense.amount)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                        title="Delete expense"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Expenses;