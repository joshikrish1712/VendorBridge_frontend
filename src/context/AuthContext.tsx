import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/api";

interface User {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "PROCUREMENT" | "VENDOR" | "MANAGER";
  vendorProfileId: string | null;
  vendorStatus?: "PENDING" | "APPROVED" | "REJECTED";
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      
      const res = await api.get("/auth/me");
      const userData = res.data.data;
      if (userData && (userData.role as string) === "PROCUREMENT_OFFICER") {
        userData.role = "PROCUREMENT";
      }
      setUser(userData);
    } catch (error) {
      setUser(null);
      localStorage.removeItem("accessToken");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      const { token, user: userData } = res.data.data;
      localStorage.setItem("accessToken", token);
      if (userData && (userData.role as string) === "PROCUREMENT_OFFICER") {
        userData.role = "PROCUREMENT";
      }
      setUser(userData);
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await api.post("/auth/logout", {});
    } catch (error) {
      console.error("Logout error on server:", error);
    } finally {
      localStorage.removeItem("accessToken");
      setUser(null);
      setLoading(false);
      window.location.href = "/login";
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
