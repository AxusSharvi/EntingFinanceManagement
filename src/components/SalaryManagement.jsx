import { useState } from "react";
import { supabase } from "../supabase";
import SalaryList from "./SalaryList";

function SalaryManagement({ user, onSalaryUpdate }) {
  const [salary, setSalary] = useState("");
  const [message, setMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

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
        onSalaryUpdate();
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
        onSalaryUpdate();
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

  return (
    <div className="bg-white rounded-2xl shadow-md p-4 h-[730px] overflow-y-auto">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 md:mb-8">Salary Management</h2>

      <div className="mb-8 md:mb-10">
        <div className="bg-green-50 rounded-2xl mb-6 md:mb-8">
          <h3 className="text-xl md:text-2xl font-semibold text-green-800 mb-3 md:mb-4">
            {isEditing ? "Edit Monthly Salary" : "Add Monthly Salary"}
          </h3>
          <div className="flex flex-col gap-4">
            <div className="flex-grow">

              <input
                type="number"
                className="w-full px-4 md:px-5 py-3 md:py-4 text-lg md:text-xl border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                id="salary"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="Enter your monthly salary"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleSubmit}
                className="bg-green-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-lg hover:bg-green-700 transition duration-300 font-medium text-lg md:text-xl"
              >
                {isEditing ? "Update" : "Add"} Salary
              </button>
              {isEditing && (
                <button
                  onClick={cancelEdit}
                  className="bg-gray-500 text-white px-6 md:px-8 py-3 md:py-4 rounded-lg hover:bg-gray-600 transition duration-300 font-medium text-lg md:text-xl"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        {message && (
          <div className={`p-4 md:p-5 rounded-lg mb-6 md:mb-8 text-base md:text-xl ${
            message.includes("successful") 
              ? "bg-green-100 text-green-700" 
              : "bg-red-100 text-red-700"
          }`}>
            {message}
          </div>
        )}
      </div>

      <div>
        <SalaryList user={user} onEdit={handleEdit} onSalaryUpdate={onSalaryUpdate} />
      </div>

    
    </div>
  );
}

export default SalaryManagement;