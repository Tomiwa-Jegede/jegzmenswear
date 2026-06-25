import { createContext, useContext, useState, useCallback } from "react";
import api from "../lib/axios";

const TOKEN_KEY = "onfleek_admin_token";
const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));

  const login = useCallback(async (username, password) => {
    const res = await api.post("/admin/login", { username, password });
    localStorage.setItem(TOKEN_KEY, res.data.token);
    setToken(res.data.token);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
  }, []);

  const value = {
    token,
    isAuthenticated: Boolean(token),
    login,
    logout,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return ctx;
}
