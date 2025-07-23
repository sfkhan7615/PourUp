import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';

import { useAuth } from './contexts/AuthContext';
import { WebsiteAuthProvider } from './contexts/WebsiteAuthContext';
import Layout from './components/Layout/Layout';
import Login from './pages/auth/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import BusinessManagement from './pages/Business/BusinessManagement';
import OutletManagement from './pages/Outlet/OutletManagement';
import ExperienceManagement from './pages/Experience/ExperienceManagement';
import UserManagement from './pages/User/UserManagement';
import PublicBusinesses from './pages/Public/PublicBusinesses';
import PublicOutlets from './pages/Public/PublicOutlets';
import PublicExperiences from './pages/Public/PublicExperiences';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoadingSpinner from './components/common/LoadingSpinner';

// Website components
import WebsiteLayout from './components/Website/WebsiteLayout';
import WebsiteHome from './pages/Website/WebsiteHome';
import WebsiteLogin from './pages/Website/WebsiteLogin';
import WebsiteSignup from './pages/Website/WebsiteSignup';
import WebsiteOutlets from './pages/Website/WebsiteOutlets';
import WebsiteOutletDetails from './pages/Website/WebsiteOutletDetails';
import WebsiteExperienceDetails from './pages/Website/WebsiteExperienceDetails';
import WebsiteBookings from './pages/Website/WebsiteBookings';
import WebsiteSettings from './pages/Website/WebsiteSettings';
import WebsiteProtectedRoute from './components/Website/WebsiteProtectedRoute';

import BookingManagement from './pages/Booking/BookingManagement';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Routes>
        {/* Website Routes - No admin header/sidebar */}
        <Route path="/website/*" element={
          <WebsiteAuthProvider>
            <Routes>
              <Route path="/" element={<WebsiteLayout />}>
                <Route index element={<WebsiteHome />} />
                <Route path="login" element={<WebsiteLogin />} />
                <Route path="signup" element={<WebsiteSignup />} />
                <Route path="outlets" element={<WebsiteOutlets />} />
                <Route path="outlets/:id" element={<WebsiteOutletDetails />} />
                <Route path="experiences/:id" element={<WebsiteExperienceDetails />} />
                <Route path="bookings" element={
                  <WebsiteProtectedRoute>
                    <WebsiteBookings />
                  </WebsiteProtectedRoute>
                } />
                <Route path="settings" element={
                  <WebsiteProtectedRoute>
                    <WebsiteSettings />
                  </WebsiteProtectedRoute>
                } />
              </Route>
            </Routes>
          </WebsiteAuthProvider>
        } />

        {/* Admin Routes - Original functionality */}
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/public/businesses" element={<PublicBusinesses />} />
        <Route path="/public/outlets" element={<PublicOutlets />} />
        <Route path="/public/experiences" element={<PublicExperiences />} />
        
        {/* Protected Admin Routes */}
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          
          {/* Super Admin Routes */}
          <Route 
            path="users" 
            element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <UserManagement />
              </ProtectedRoute>
            } 
          />
          
          {/* Super Admin + Winery Admin Routes */}
          <Route 
            path="businesses" 
            element={
              <ProtectedRoute allowedRoles={['super_admin', 'winery_admin']}>
                <BusinessManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="outlets" 
            element={
              <ProtectedRoute allowedRoles={['super_admin', 'winery_admin', 'outlet_manager']}>
                <OutletManagement />
              </ProtectedRoute>
            } 
          />
          
          {/* Outlet Manager Routes */}
          <Route 
            path="experiences" 
            element={
              <ProtectedRoute allowedRoles={['super_admin', 'winery_admin', 'outlet_manager']}>
                <ExperienceManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="bookings" 
            element={
              <ProtectedRoute allowedRoles={['outlet_manager']}>
                <BookingManagement />
              </ProtectedRoute>
            } 
          />
        </Route>
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/website"} replace />} />
      </Routes>
    </Box>
  );
}

export default App; 