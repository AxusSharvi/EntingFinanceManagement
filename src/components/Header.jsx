import { supabase } from "../supabase";

function Header({ user, userProfile }) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const getShortGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Morning";
    if (hour < 18) return "Afternoon";
    return "Evening";
  };

  // Get first name for mobile display
  const getDisplayName = () => {
    const fullName = userProfile?.name || user.user_metadata?.name;
    if (!fullName) return "User";
    
    // Return first name only for mobile
    return fullName.split(' ')[0];
  };

  return (
    <header className="bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl shadow-lg p-4 md:p-8 mb-6 md:mb-8 text-white relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        {/* Left Section - Logo and Greeting */}
        <div className="flex items-center space-x-3 md:space-x-4">
          {/* Icon */}
          <div className="bg-white/20 p-2 md:p-3 rounded-2xl backdrop-blur-sm flex-shrink-0">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6 md:h-10 md:w-10 text-white" 
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
          
          {/* Title and Greeting */}
          <div className="min-w-0">
            {/* App Title - Hidden on very small screens, shown on sm+ */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white drop-shadow-md truncate">
              FinanceTracker
            </h1>
            
            {/* Greeting Section */}
            <div className="flex items-center space-x-2 mt-1 md:mt-2">
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-300 rounded-full animate-pulse flex-shrink-0"></div>
              
              {/* Desktop Greeting */}
              <p className="text-sm md:text-lg text-green-100 font-medium hidden sm:block">
                {getGreeting()}, {userProfile?.name || user.user_metadata?.name}
              </p>
              
              {/* Mobile Greeting */}
              <p className="text-sm text-green-100 font-medium sm:hidden">
                {getShortGreeting()}, {getDisplayName()}
              </p>
            </div>
          </div>
        </div>

        {/* Right Section - Welcome Message */}
        <div className="hidden md:flex flex-col items-end ml-4">
          <p className="text-green-100 text-sm">Welcome to</p>
          <p className="text-white font-medium">Your Financial Hub</p>
        </div>

        {/* Mobile Welcome Badge */}
        <div className="md:hidden bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
          <p className="text-xs text-white font-medium">Financial Hub</p>
        </div>
      </div>

      {/* Status Bar for Mobile */}
      <div className="flex items-center justify-between mt-4 md:hidden">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span className="text-xs text-green-100">Live</span>
        </div>
        <div className="text-xs text-green-100">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Decorative elements - Adjusted for mobile */}
      <div className="absolute top-0 right-0 -mt-1 -mr-1 md:-mt-2 md:-mr-2">
        <div className="w-12 h-12 md:w-20 md:h-20 bg-white/10 rounded-full blur-lg md:blur-xl"></div>
      </div>
      <div className="absolute bottom-0 left-0 -mb-1 -ml-1 md:-mb-2 md:-ml-2">
        <div className="w-10 h-10 md:w-16 md:h-16 bg-teal-400/20 rounded-full blur-lg md:blur-xl"></div>
      </div>
      
      {/* Additional mobile-only decorative element */}
      <div className="absolute top-1/2 right-4 transform -translate-y-1/2 md:hidden">
        <div className="w-8 h-8 bg-white/5 rounded-full blur-sm"></div>
      </div>
    </header>
  );
}

export default Header;