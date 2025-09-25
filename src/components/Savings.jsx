import { useState, useEffect } from "react";
import { supabase } from "../supabase";

function Savings({ user, userSalary }) {
  const [goals, setGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    goalName: "",
    goalAmount: "",
  });
  const [message, setMessage] = useState("");

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return "$0.00";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const fetchGoals = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("savings")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setGoals(data);
      }
    } catch (error) {
      console.error("Error fetching savings goals:", error);
      setMessage("Error loading savings goals");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.goalName || !formData.goalAmount) {
      setMessage("Please fill in all required fields");
      return;
    }

    if (parseFloat(formData.goalAmount) <= 0) {
      setMessage("Goal amount must be greater than 0");
      return;
    }

    try {
      const { error } = await supabase
        .from("savings")
        .insert([
          {
            user_id: user.id,
            goal_name: formData.goalName,
            goal_amount: parseFloat(formData.goalAmount),
            current_amount: 0, // Starts at 0
          }
        ]);

      if (error) {
        setMessage(error.message);
      } else {
        setMessage("Savings goal added successfully!");
        setFormData({ goalName: "", goalAmount: "" });
        fetchGoals(); // Refresh the list
      }
    } catch (error) {
      setMessage("An error occurred while adding the goal");
      console.error("Error adding savings goal:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this savings goal?")) {
      try {
        const { error } = await supabase
          .from("savings")
          .delete()
          .eq("id", id);

        if (error) {
          setMessage(error.message);
        } else {
          setMessage("Savings goal deleted successfully!");
          fetchGoals(); // Refresh the list
        }
      } catch (error) {
        setMessage("An error occurred while deleting the goal");
        console.error("Error deleting goal:", error);
      }
    }
  };
  
  const handleUpdate = async (id, newAmount) => {
    if (newAmount === "") {
        setMessage("Please enter an amount to update.");
        return;
    }

    const currentGoal = goals.find(goal => goal.id === id);
    if (!currentGoal) return;

    const updatedAmount = currentGoal.current_amount + parseFloat(newAmount);

    if (updatedAmount < 0) {
        setMessage("Current amount cannot be negative.");
        return;
    }

    try {
        const { error } = await supabase
            .from("savings")
            .update({ current_amount: updatedAmount })
            .eq("id", id);

        if (error) {
            setMessage(error.message);
        } else {
            setMessage("Savings goal updated successfully!");
            fetchGoals();
        }
    } catch (error) {
        setMessage("An error occurred while updating the goal.");
        console.error("Error updating goal:", error);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-8 h-[700px] overflow-y-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-8">Savings Management</h2>

      {/* Monthly Salary Display */}
      <div className="bg-blue-50 p-6 rounded-2xl border border-blue-200 mb-8">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Your Monthly Salary</h3>
        <p className="text-3xl font-bold text-blue-600">
          {userSalary ? formatCurrency(userSalary) : "No salary set"}
        </p>
      </div>

      {/* Add Savings Goal Form */}
      <div className="bg-gray-50 p-6 rounded-2xl mb-8">
        <h3 className="text-2xl font-semibold text-gray-800 mb-6">Set a New Savings Goal</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="goalName" className="block text-sm font-medium text-gray-700 mb-1">
              Goal Name *
            </label>
            <input
              type="text"
              id="goalName"
              name="goalName"
              value={formData.goalName}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
              placeholder="e.g., New Car Fund"
              required
            />
          </div>
          <div>
            <label htmlFor="goalAmount" className="block text-sm font-medium text-gray-700 mb-1">
              Goal Amount ($) *
            </label>
            <input
              type="number"
              id="goalAmount"
              name="goalAmount"
              value={formData.goalAmount}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
              placeholder="0.00"
              min="0.01"
              step="0.01"
              required
            />
          </div>

          {message && (
            <div className={`p-3 rounded-lg text-sm ${
              message.includes("successful") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition duration-300 font-medium"
          >
            Set Goal
          </button>
        </form>
      </div>

      {/* Savings Goals List */}
      <div>
        <h3 className="text-2xl font-semibold text-gray-800 mb-6">My Savings Goals</h3>

        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
          </div>
        ) : goals.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <p className="text-lg">No savings goals set yet</p>
          </div>
        ) : (
          <div className="space-y-6">
            {goals.map((goal) => (
              <div key={goal.id} className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                <div className="flex sm:flex-row justify-between sm:items-start mb-4">
                  <div className="mb-2 sm:mb-0">
                    <h4 className="text-xl font-semibold text-gray-800">{goal.goal_name}</h4>
                    <p className="text-sm text-gray-500">Goal: {formatCurrency(goal.goal_amount)}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(goal.id)}
                    className="text-red-600 hover:text-red-900 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                
                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-green-600 h-2.5 rounded-full"
                      style={{ width: `${Math.min((goal.current_amount / goal.goal_amount) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-green-600 font-medium">{formatCurrency(goal.current_amount)}</span>
                    <span className="text-gray-500">{Math.min(Math.round((goal.current_amount / goal.goal_amount) * 100), 100)}%</span>
                  </div>
                </div>

                {/* Update Amount Form */}
                <div className="mt-4 flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
                    <input
                      type="number"
                      id={`update-amount-${goal.id}`}
                      name="updateAmount"
                      placeholder="Add/Subtract amount"
                      className="flex-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <button
                      onClick={() => handleUpdate(goal.id, document.getElementById(`update-amount-${goal.id}`).value)}
                      className="w-full sm:w-auto bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600 transition"
                    >
                      Update
                    </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Savings;