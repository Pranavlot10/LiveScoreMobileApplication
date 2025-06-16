import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for existing user on app start
  useEffect(() => {
    const checkUser = async () => {
      try {
        const userData = await AsyncStorage.getItem("user");
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (err) {
        console.error("Error checking user:", err);
        setError("Failed to load user data");
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setError(null);
      // Replace with your actual API endpoint
      const response = await fetch("your-login-endpoint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      const userData = {
        id: data.id,
        email: data.email,
        name: data.name,
        token: data.token,
      };

      await AsyncStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  // Register function
  const register = async (name, email, password) => {
    try {
      setError(null);
      // Replace with your actual API endpoint
      const response = await fetch("your-register-endpoint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      // Automatically log in after successful registration
      const userData = {
        id: data.id,
        email: data.email,
        name: data.name,
        token: data.token,
      };

      await AsyncStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setError(null);
      await AsyncStorage.removeItem("user");
      setUser(null);
      return true;
    } catch (err) {
      setError("Failed to logout");
      return false;
    }
  };

  // Update user profile
  const updateUser = async (userData) => {
    try {
      setError(null);
      const updatedUser = { ...user, ...userData };
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      return true;
    } catch (err) {
      setError("Failed to update user");
      return false;
    }
  };

  const value = {
    user,
    loading,
    error,
    setError, // Expose setError for components to clear or set custom errors
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
