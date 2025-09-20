import { supabase } from "../supabase";

function Header({ user, userProfile }) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <header className="bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl shadow-lg p-8 mb-8 text-white">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-10 w-10 text-white" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
          </div>
          
          <div>
            <h1 className="text-4xl font-bold text-white drop-shadow-md">
              FinanceTracker
            </h1>
            <div className="flex items-center space-x-2 mt-2">
              <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
              <p className="text-lg text-green-100 font-medium">
                {getGreeting()}, {userProfile?.name || user.user_metadata?.name}
              </p>
            </div>
          </div>
        </div>

        <div className="hidden md:flex flex-col items-end">
          <p className="text-green-100 text-sm">Welcome to</p>
          <p className="text-white font-medium">Your Financial Hub</p>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-0 right-0 -mt-2 -mr-2">
        <div className="w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
      </div>
      <div className="absolute bottom-0 left-0 -mb-2 -ml-2">
        <div className="w-16 h-16 bg-teal-400/20 rounded-full blur-xl"></div>
      </div>
    </header>
  );
}

export default Header;