import React, { createContext, useContext, useState, useEffect } from 'react';
import { websiteAuthAPI, handleWebsiteApiError, handleWebsiteApiSuccess } from '../services/websiteApi';
import { toast } from 'react-toastify';

const WebsiteAuthContext = createContext();

export const useWebsiteAuth = () => {
  const context = useContext(WebsiteAuthContext);
  if (!context) {
    throw new Error('useWebsiteAuth must be used within a WebsiteAuthProvider');
  }
  return context;
};

export const WebsiteAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    try {
      const token = localStorage.getItem('website_token');
      const userData = localStorage.getItem('website_user');
      
      if (token && userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      localStorage.removeItem('website_token');
      localStorage.removeItem('website_user');
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    try {
      const response = await websiteAuthAPI.signup(userData);
      const { token, user: newUser } = response.data.data;

      localStorage.setItem('website_token', token);
      localStorage.setItem('website_user', JSON.stringify(newUser));
      setUser(newUser);

      handleWebsiteApiSuccess(`Welcome to PourUp, ${newUser.first_name}!`);
      return { success: true, user: newUser };
    } catch (error) {
      const message = handleWebsiteApiError(error);
      return { success: false, error: message };
    }
  };

  const login = async (credentials) => {
    try {
      const response = await websiteAuthAPI.login(credentials);
      const { token, user: userData } = response.data.data;

      localStorage.setItem('website_token', token);
      localStorage.setItem('website_user', JSON.stringify(userData));
      setUser(userData);

      handleWebsiteApiSuccess(`Welcome back, ${userData.first_name}!`);
      return { success: true, user: userData };
    } catch (error) {
      const message = handleWebsiteApiError(error);
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await websiteAuthAPI.logout();
      localStorage.removeItem('website_token');
      localStorage.removeItem('website_user');
      setUser(null);
      
      toast.info('You have been logged out');
    } catch (error) {
      console.error('Logout error:', error);
      // Clear local storage anyway
      localStorage.removeItem('website_token');
      localStorage.removeItem('website_user');
      setUser(null);
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('website_user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    loading,
    signup,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user,
  };

  return (
    <WebsiteAuthContext.Provider value={value}>
      {children}
    </WebsiteAuthContext.Provider>
  );
}; 