// import { useState } from 'react'
import './App.css'
import AdminTableCard from './components/AdminTableCard/AdminTableCard';
import BottomNav from './components/BottomNav/BottomNav';
import PlanChecklist from './components/PlanChecklist/PlanChecklist';
import Admin from './pages/Admin/Admin';
// import QuestTableCard from './components/QuestList/QuestList'
import Dashboard from './pages/Dashboard/Dashboard';
import Compare from './pages/Compare/Compare';
import Login from './pages/Login/Login'
import { useState } from 'react';
function App() {

    const rows = [
        {
            name: "10K Steps",
            status: "Pending",
            xp: 50,
            onComplete: (row) => console.log("DONE", row),
            onDelete: (row) => console.log("FAILED", row),
        },
        {
            name: "Meditation",
            status: "Done",
            xp: 30,
            onComplete: () => { },
            onDelete: () => { },
        },
    ];


    const changeActiveTab = (newTab) => {
        setActiveTab(newTab);
    }
    const [activeTab, setActiveTab] = useState("dashboard");

    const bottomNavItems = [{
        key: "dashboard",
        label: "Dashboard",
    },
    {
        key: "compare",
        label: "Compare",
    },
    {
        key: "login",
        label: "Login",
    },
    {
        key: "admin",
        label: "Admin",
    }
    ]

    return (
        <>

            { activeTab == "dashboard" && <Dashboard/> }
            { activeTab == "compare" && <Compare/>}
            { activeTab == "login" && <Login/> }
            { activeTab == "admin" && <Admin/> }

            {/* <Login/> */}
            {/* <Dashboard /> */}
            {/* <Admin/> */}
            <BottomNav
                items={bottomNavItems}
                active={activeTab}
                onClick={setActiveTab}
            />

        </>
    )
}

export default App
