import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Dashboard from "./Dashboard";
import SalaryManagement from "./SalaryManagement";
import Reports from "./Reports";
import Settings from "./Settings";
import Expenses from "./Expenses";
import Savings from "./Savings";

function Home({ user }) {
    const [activeTab, setActiveTab] = useState("dashboard");
    const [userSalary, setUserSalary] = useState(null);
    const [isLoadingSalary, setIsLoadingSalary] = useState(true);
    const [userProfile, setUserProfile] = useState(null);

    // Fetch user profile data
    useEffect(() => {
        const fetchUserProfile = async () => {
            if (!user) return;

            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('name')
                    .eq('id', user.id)
                    .single();

                if (!error && data) {
                    setUserProfile(data);
                }
            } catch (error) {
                console.error("Error fetching user profile:", error);
            }
        };

        fetchUserProfile();
    }, [user]);

    // Fetch user's latest salary
    useEffect(() => {
        const fetchInitialSalary = async () => {
            if (!user) return;

            setIsLoadingSalary(true);
            try {
                const { data, error } = await supabase
                    .from("salaries")
                    .select("monthly_salary")
                    .eq("user_id", user.id)
                    .order("created_at", { ascending: false })
                    .limit(1)
                    .single();

                if (!error && data) {
                    setUserSalary(data.monthly_salary);
                }
            } catch (error) {
                console.error("Error fetching user salary:", error);
            } finally {
                setIsLoadingSalary(false);
            }
        };

        fetchInitialSalary();
    }, [user]);

    const fetchLatestSalary = async () => {
        setIsLoadingSalary(true);
        try {
            const { data } = await supabase
                .from("salaries")
                .select("monthly_salary")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false })
                .limit(1)
                .single();

            if (data) setUserSalary(data.monthly_salary);
        } catch (error) {
            console.error("Error fetching latest salary:", error);
        } finally {
            setIsLoadingSalary(false);
        }
    };

    const renderActiveTab = () => {
        switch (activeTab) {
            case "dashboard":
                return (
                    <Dashboard
                        user={user} 
                        userSalary={userSalary}
                        isLoadingSalary={isLoadingSalary}
                    />
                );
            case "salary":
                return (
                    <SalaryManagement
                        user={user}
                        onSalaryUpdate={fetchLatestSalary}
                    />
                );
            case "expenses":
                return (
                    <Expenses user={user} userSalary={userSalary} />
                );
            case "savings":
                return (
                    <Savings user={user} userSalary={userSalary} />
                );
            case "reports":
                 return (
                     <Reports user={user} userSalary={userSalary} />
                );
            case "settings":
                return <Settings />;
            default:
                return (
                    <Dashboard
                        userSalary={userSalary}
                        isLoadingSalary={isLoadingSalary}
                    />
                );
        }
    };

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-green-50 to-cyan-50 p-4">
            <div className="w-full">
                <Header
                    user={user}
                    userProfile={userProfile}
                />

                <div className="flex flex-col lg:flex-row gap-8 h-full">
                    <Sidebar
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        userSalary={userSalary}
                        user={user}
                    />

                    <div className="lg:w-3/4">
                        {renderActiveTab()}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;