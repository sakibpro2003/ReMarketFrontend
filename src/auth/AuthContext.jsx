import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { validateLogin, validateRegister } from "../utils/authValidation";

const AuthContext = createContext(null);
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const STORAGE_KEY = "remarket_token";

const getToken = () => localStorage.getItem(STORAGE_KEY);

const setToken = (token) => {
  localStorage.setItem(STORAGE_KEY, token);
};

const clearToken = () => {
  localStorage.removeItem(STORAGE_KEY);
};

const requestJson = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const message = data?.error || "Request failed";
    throw new Error(message);
  }

  return response.json();
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error("Session expired");
        }

        const data = await response.json();
        setUser(data.user);
      } catch (error) {
        clearToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const register = async (payload) => {
    const validPayload = validateRegister(payload);
    const data = await requestJson("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(validPayload)
    });

    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const login = async (email, password) => {
    const validPayload = validateLogin({ email, password });
    const data = await requestJson("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(validPayload)
    });

    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    clearToken();
    setUser(null);
  };

  const updateUser = (nextUser) => {
    setUser(nextUser);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      register,
      login,
      logout,
      updateUser
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export { AuthProvider, useAuth };
