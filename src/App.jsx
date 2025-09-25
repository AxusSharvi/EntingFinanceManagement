import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import Auth from "./components/Auth";
import Home from "./components/Home";

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-cyan-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-green-50 to-cyan-50 ">
      <div className=" mx-auto h-screen flex items-center justify-center ">
        <div className="w-full h-screen">
          {!user ? (
            <div className="flex items-center justify-center w-full h-full">
              <Auth onAuth={setUser} />
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-xl h-full w-full">
              <Home user={user} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;