import axios from 'axios';
import { toast } from 'react-toastify';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://e06228f3ad0d.ngrok-free.app/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true'
  },
  withCredentials: true
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  changePassword: (passwordData) => api.post('/auth/change-password', passwordData),
  refreshToken: () => api.post('/auth/refresh'),
  logout: () => api.post('/auth/logout'),
};

// User API
export const userAPI = {
  getUsers: (params) => api.get('/users', { params }),
  getUserById: (id) => api.get(`/users/${id}`),
  createOutletManager: (managerData) => api.post('/users/outlet-manager', managerData),
  getOutletManagers: (outletId) => api.get(`/users/outlet-managers/${outletId}`),
  removeOutletManager: (outletId, managerId) => api.delete(`/users/outlet-manager/${outletId}/${managerId}`),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  deactivateUser: (id) => api.delete(`/users/${id}`),
};

// Business API
export const businessAPI = {
  getBusinesses: (params) => api.get('/businesses', { params }),
  getBusinessById: (id) => api.get(`/businesses/${id}`),
  createBusiness: (businessData) => api.post('/businesses', businessData),
  updateBusiness: (id, businessData) => api.put(`/businesses/${id}`, businessData),
  approveBusiness: (id) => api.put(`/businesses/${id}/approve`),
  rejectBusiness: (id) => api.put(`/businesses/${id}/reject`),
  getPendingBusinesses: () => api.get('/businesses/pending/approval'),
  getMyBusinesses: (params) => api.get('/businesses/my/businesses', { params }),
  deleteBusiness: (id) => api.delete(`/businesses/${id}`),
};

// Outlet API
export const outletAPI = {
  getOutlets: (params) => api.get('/outlets', { params }),
  getOutletById: (id) => api.get(`/outlets/${id}`),
  createOutlet: (outletData) => api.post('/outlets', outletData),
  updateOutlet: (id, outletData) => api.put(`/outlets/${id}`, outletData),
  getOutletsByBusiness: (businessId) => api.get(`/outlets/business/${businessId}`),
  getMyOutlets: (params) => api.get('/outlets/my/outlets', { params }),
  getAssignedOutlets: () => api.get('/outlets/manager/assigned'),
  deleteOutlet: (id) => api.delete(`/outlets/${id}`),
};

// Experience API
export const experienceAPI = {
  getExperiences: (params) => api.get('/experiences', { params }),
  getExperienceById: (id) => api.get(`/experiences/${id}`),
  createExperience: (experienceData) => api.post('/experiences', experienceData),
  updateExperience: (id, experienceData) => api.put(`/experiences/${id}`, experienceData),
  updateTimeSlots: (id, timeSlotsData) => api.put(`/experiences/${id}/time-slots`, timeSlotsData),
  getExperiencesByOutlet: (outletId, params) => api.get(`/experiences/outlet/${outletId}`, { params }),
  getMyExperiences: (params) => api.get('/experiences/my/experiences', { params }),
  deleteExperience: (id) => api.delete(`/experiences/${id}`),
};

// Booking Management API
export const bookingsAPI = {
  getBookings: (queryParams) => api.get(`/bookings?${queryParams}`),
  getBookingById: (id) => api.get(`/bookings/${id}`),
  updateBookingStatus: (id, data) => api.put(`/bookings/${id}/status`, data),
};

// System API
export const systemAPI = {
  healthCheck: () => api.get('/health'),
};

// Utility functions
export const handleApiError = (error) => {
  const message = error.response?.data?.message || error.message || 'An error occurred';
  toast.error(message);
  return message;
};

export const handleApiSuccess = (message) => {
  toast.success(message);
};

export default api; 