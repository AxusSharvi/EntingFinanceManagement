import { useState } from "react";
import { supabase } from "../supabase";

function Auth({ onAuth }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");

  const handleSignUp = async () => {
    setIsLoading(true);
    setMessage("");
    
    try {
      // First, sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({ 
        email, 
        password 
      });
      
      if (authError) {
        setMessage(authError.message);
        setIsLoading(false);
        return;
      }
      
      // Then, store the user's name in the profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          { 
            id: authData.user.id, 
            name: name,
            email: email
          }
        ]);
      
      if (profileError) {
        // If profile creation fails, we still show the auth success message
        // but log the error for debugging
        console.error("Profile creation error:", profileError);
        setMessage("Account created successfully, but there was an issue saving your profile details.");
      } else {
        setMessage("Signup successful! Check your email for confirmation.");
      }
    } catch (error) {
      setMessage("An unexpected error occurred during signup.");
      console.error("Signup error:", error);
    }
    
    setIsLoading(false);
  };

  const handleLogin = async () => {
    setIsLoading(true);
    setMessage("");
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        setMessage(error.message);
        setIsLoading(false);
        return;
      }
      
      setMessage("Login successful!");
      
      // Try to fetch user profile to get the name
      try {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', data.user.id)
          .single();
        
        // Pass both user auth data and profile data
        onAuth({
          ...data.user,
          user_metadata: {
            ...data.user.user_metadata,
            name: profileData?.name || data.user.email.split('@')[0]
          }
        });
      } catch (profileError) {
        console.error("Profile fetch error:", profileError);
        // Continue with login even if profile fetch fails
        onAuth({
          ...data.user,
          user_metadata: {
            ...data.user.user_metadata,
            name: data.user.email.split('@')[0] // Fallback to email prefix
          }
        });
      }
    } catch (error) {
      setMessage("An unexpected error occurred during login.");
      console.error("Login error:", error);
    }
    
    setIsLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setMessage("Please enter your email address first.");
      return;
    }
    
    setIsLoading(true);
    setMessage("");
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) {
        setMessage(error.message);
      } else {
        setMessage("Password reset instructions sent to your email!");
      }
    } catch (error) {
      setMessage("An unexpected error occurred.");
      console.error("Password reset error:", error);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-cyan-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-teal-600 p-6 text-center">
          <h1 className="text-3xl font-bold text-white">FinanceTracker</h1>
          <p className="text-green-100 mt-2">Manage your finances with confidence</p>
        </div>
        
        <div className="p-6">
          <div className="flex border-b border-gray-200 mb-6">
            <button
              className={`flex-1 py-2 font-medium text-center ${
                activeTab === "login" 
                  ? "text-green-600 border-b-2 border-green-600" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("login")}
            >
              Login
            </button>
            <button
              className={`flex-1 py-2 font-medium text-center ${
                activeTab === "signup" 
                  ? "text-green-600 border-b-2 border-green-600" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("signup")}
            >
              Sign Up
            </button>
          </div>
          
          <div className="space-y-4">
            {/* Name field - only shown during signup */}
            {activeTab === "signup" && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            {activeTab === "login" && (
              <div className="text-right">
                <button 
                  onClick={handleForgotPassword}
                  className="text-sm text-green-600 hover:text-green-800 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}
            
            {message && (
              <div className={`p-3 rounded-lg text-sm ${
                message.includes("successful") || message.includes("sent")
                  ? "bg-green-100 text-green-700" 
                  : "bg-red-100 text-red-700"
              }`}>
                {message}
              </div>
            )}
            
            <button
              onClick={activeTab === "login" ? handleLogin : handleSignUp}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-green-500 to-teal-600 text-white py-3 px-4 rounded-lg font-medium hover:from-green-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition disabled:opacity-70"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {activeTab === "login" ? "Logging in..." : "Creating account..."}
                </span>
              ) : (
                activeTab === "login" ? "Login to your account" : "Create new account"
              )}
            </button>
            
            <div className="relative flex items-center justify-center my-6">
              
              <span className="bg-white px-3 text-sm text-gray-500">or continue with</span>
         
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-lg py-2 px-4 font-medium text-gray-700 hover:bg-gray-50 transition">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"/>
                </svg>
                Facebook
              </button>
              <button className="flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-lg py-2 px-4 font-medium text-gray-700 hover:bg-gray-50 transition">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5.46 8.26l-7.09 3.11c-.2.08-.36.27-.36.48s.16.41.36.48l7.09 3.11c.35.14.7-.19.58-.54l-1.31-3.76 1.31-3.76c.12-.35-.23-.68-.58-.54z"/>
                </svg>
                Google
              </button>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 text-center border-t border-gray-200">
          <p className="text-sm text-gray-600">
            {activeTab === "login" 
              ? "Don't have an account? " 
              : "Already have an account? "}
            <button 
              onClick={() => setActiveTab(activeTab === "login" ? "signup" : "login")}
              className="text-green-600 font-medium hover:text-green-800 hover:underline"
            >
              {activeTab === "login" ? "Sign up now" : "Log in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Auth;