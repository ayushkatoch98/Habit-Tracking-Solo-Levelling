import "./App.css";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";

import BottomNav from "./components/BottomNav/BottomNav";

import Dashboard from "./pages/Dashboard/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import PublicRoute from "./components/PublicRoute/PublicRoute";
import Compare from "./pages/Compare/Compare";
import Login from "./pages/Login/Login";
import Admin from "./pages/Admin/Admin";
import OtherQuests from "./pages/OtherQuests/OtherQuests";

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const bottomNavItems = [
    { key: "dashboard", label: "Dashboard", path: "/" },
    { key: "otherQuests", label: "Other Quests", path: "/otherQuests" },
    { key: "compare", label: "Compare", path: "/compare" },
    { key: "admin", label: "Admin", path: "/admin" },
  ];

  const activeTab =
    bottomNavItems.find(item => item.path === location.pathname)?.key
    || "dashboard";
  const isAuthPage = location.pathname === "/login";

  return (
    <>
      <div className="solo-overlay" />
      <div className="solo-fog" />
      <div className="rune-corners" />

      <div className="app-shell">
        <main className="app-main">
          <Routes>
            <Route path="/" element={ <ProtectedRoute><Dashboard /></ProtectedRoute> } />
            <Route path="/otherQuests" element={ <ProtectedRoute><OtherQuests/></ProtectedRoute> } />
            <Route path="/compare" element={ <ProtectedRoute><Compare /></ProtectedRoute> } />
            <Route path="/login" element={ <PublicRoute><Login /></PublicRoute> } />
            <Route path="/admin" element={ <ProtectedRoute><Admin /></ProtectedRoute> } />
          </Routes>
        </main>

        {!isAuthPage && (
          <BottomNav
            items={bottomNavItems}
            active={activeTab}
            onClick={(key) => {
              const item = bottomNavItems.find(i => i.key === key);
              if (item) navigate(item.path);
            }}
          />
        )}
      </div>
    </>
  );
}

export default App;
