import "./App.css";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";

import BottomNav from "./components/BottomNav/BottomNav";

import Dashboard from "./pages/Dashboard/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import PublicRoute from "./components/PublicRoute/PublicRoute";
import Compare from "./pages/Compare/Compare";
import Login from "./pages/Login/Login";
import Admin from "./pages/Admin/Admin";
import Failed from "./pages/Failed/Failed";

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const bottomNavItems = [
    { key: "dashboard", label: "Dashboard", path: "/" },
    { key: "failed", label: "Failed", path: "/failed" },
    { key: "compare", label: "Compare", path: "/compare" },
    { key: "admin", label: "Admin", path: "/admin" },
  ];

  const activeTab =
    bottomNavItems.find(item => item.path === location.pathname)?.key
    || "dashboard";

  return (
    <>
      <Routes>
        <Route path="/" element={ <ProtectedRoute><Dashboard /></ProtectedRoute> } />
        <Route path="/failed" element={ <ProtectedRoute><Failed/></ProtectedRoute> } />
        <Route path="/compare" element={ <ProtectedRoute><Compare /></ProtectedRoute> } />
        <Route path="/login" element={ <PublicRoute><Login /></PublicRoute> } />
        <Route path="/admin" element={ <ProtectedRoute><Admin /></ProtectedRoute> } />
      </Routes>

      <BottomNav
        items={bottomNavItems}
        active={activeTab}
        onClick={(key) => {
          const item = bottomNavItems.find(i => i.key === key);
          if (item) navigate(item.path);
        }}
      />
    </>
  );
}

export default App;
