import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [authToken, setAuthToken] = useState(() => {
      return localStorage.getItem("authToken") ? JSON.parse(localStorage.getItem("authToken")) : null;
    });

    const login = (token) => {
      localStorage.setItem("authToken", JSON.stringify(token));
      setAuthToken(token);
    };
  
    const logout = () => {
      localStorage.removeItem("authToken");
      setAuthToken(null);
    };
    return (
        <AuthContext.Provider value={{ authToken, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext);