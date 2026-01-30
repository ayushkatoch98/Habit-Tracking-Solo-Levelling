import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";

export default function PublicRoute({ children }) {
    const { isAuthenticated, loading, logout, loginDate } = useAuth();


    if (loading) return null;

    const currentDate = new Date();
    const storedDate = new Date(loginDate); // loginDate is "2026-01-30" format
    const daysDifference = Math.floor((currentDate - storedDate) / (1000 * 60 * 60 * 24));

    if (daysDifference > 5) {
        logout();
    }


    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return children;
}
