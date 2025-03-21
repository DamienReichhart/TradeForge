import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import { authApi } from '../services/api';
import axios from 'axios';

// Define types
interface User {
  id: number;
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  telegram_username?: string;
  subscription_id?: number;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, username: string, password: string, firstName?: string, lastName?: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is authenticated on component mount
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      
      const token = localStorage.getItem('accessToken');
      
      if (token) {
        try {
          // Set default auth header for axios
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Decode token to get expiration
          const decoded: any = jwtDecode(token);
          const currentTime = Date.now() / 1000;
          
          if (decoded.exp < currentTime) {
            // Token expired
            handleLogout();
          } else {
            // Token valid, get user info
            const response = await authApi.me();
            setUser(response.data);
            setIsAuthenticated(true);
          }
        } catch (err) {
          console.error('Auth check error:', err);
          handleLogout();
        }
      }
      
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogin = async (username: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await authApi.login(username, password);
      
      const { access_token } = response.data;
      
      // Store token in localStorage
      localStorage.setItem('accessToken', access_token);
      
      // Set default auth header for axios
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      // Get user info
      const userResponse = await authApi.me();
      setUser(userResponse.data);
      setIsAuthenticated(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // Remove token from localStorage
    localStorage.removeItem('accessToken');
    
    // Remove auth header
    delete axios.defaults.headers.common['Authorization'];
    
    // Reset state
    setUser(null);
    setIsAuthenticated(false);
  };

  const handleRegister = async (
    email: string, 
    username: string, 
    password: string, 
    firstName?: string, 
    lastName?: string
  ) => {
    try {
      setError(null);
      setLoading(true);
      
      await authApi.register({
        email,
        username,
        password,
        first_name: firstName,
        last_name: lastName
      });
      
      // Login after successful registration
      await handleLogin(username, password);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshUserData = async () => {
    try {
      const response = await authApi.me();
      setUser(response.data);
      return response.data;
    } catch (err) {
      console.error('Error refreshing user data:', err);
    }
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    error,
    login: handleLogin,
    logout: handleLogout,
    register: handleRegister,
    refreshUser: refreshUserData
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 