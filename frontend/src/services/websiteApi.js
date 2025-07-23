import axios from 'axios';
import { toast } from 'react-toastify';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Create axios instance for website API
const websiteApi = axios.create({
  baseURL: `${API_BASE_URL}/website`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token for website users
websiteApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('website_token');
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
websiteApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('website_token');
      localStorage.removeItem('website_user');
      window.location.href = '/website/login';
    }
    return Promise.reject(error);
  }
);

// Website Auth API
export const websiteAuthAPI = {
  signup: (userData) => websiteApi.post('/auth/signup', userData),
  login: (credentials) => websiteApi.post('/auth/login', credentials),
  logout: () => {
    localStorage.removeItem('website_token');
    localStorage.removeItem('website_user');
    return Promise.resolve();
  },
};

// Website User API
export const websiteUserAPI = {
  updateLocation: (locationData) => websiteApi.put('/user/location', locationData),
};

// Website Outlets API
export const websiteOutletsAPI = {
  getOutlets: (params) => websiteApi.get('/outlets', { params }),
  getOutletById: (id) => websiteApi.get(`/outlets/${id}`),
};

// Website Experiences API
export const websiteExperiencesAPI = {
  getExperienceById: (id) => websiteApi.get(`/experiences/${id}`),
};

// Website Bookings API
export const websiteBookingsAPI = {
  createBooking: (bookingData) => websiteApi.post('/bookings', bookingData),
  getBookings: (params) => websiteApi.get('/bookings', { params }),
  cancelBooking: (id) => websiteApi.put(`/bookings/${id}/cancel`),
};

// Utility functions
export const handleWebsiteApiError = (error) => {
  const message = error.response?.data?.message || error.message || 'An error occurred';
  toast.error(message);
  return message;
};

export const handleWebsiteApiSuccess = (message) => {
  toast.success(message);
};

export default websiteApi; 