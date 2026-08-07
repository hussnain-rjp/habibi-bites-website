import React, { createContext, useContext, useState, useEffect } from 'react';
import { useDb } from './DbContext.jsx';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const db = useDb();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const loggedIn = await db.isAdminLoggedIn();
      setIsAdmin(loggedIn);
    } catch (e) {
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    const success = await db.loginAdmin(username, password);
    if (success) setIsAdmin(true);
    return success;
  };

  const logout = async () => {
    await db.logoutAdmin();
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ isAdmin, loading, login, logout, checkStatus }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
