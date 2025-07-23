import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useWebsiteAuth } from '../../contexts/WebsiteAuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

const WebsiteProtectedRoute = ({ children }) => {
  const { user, loading } = useWebsiteAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    // Redirect to login with the current location
    return <Navigate to="/website/login" state={{ from: location }} replace />;
  }

  return children;
};

export default WebsiteProtectedRoute; 