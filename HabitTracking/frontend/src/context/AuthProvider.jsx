import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loginDate, setLoginDate] = useState('');

  // Load from localStorage on app start
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("jwt");
    const loginDate = localStorage.getItem("loginDate");

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
      setLoginDate(loginDate);
    }

    setLoading(false);
  }, []);

  const login = (userData, jwt) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("jwt", jwt);
    localStorage.setItem("loginDate", new Date().toISOString().split("T")[0])

    setUser(userData);
    setToken(jwt);
    setLoginDate(loginDate)
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("jwt");
    localStorage.removeItem("loginDate")

    setUser(null);
    setToken(null);
    setLoginDate('')
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        login,
        logout,
        loading,
        loginDate
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook (IMPORTANT)
export function useAuth() {
  return useContext(AuthContext);
}