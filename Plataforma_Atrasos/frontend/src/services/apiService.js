import axios from 'axios';
import API_URL from '../config/api.js';

// Create a base axios instance with configuration
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
  withCredentials: false, // Important for CORS requests to external domains
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle unauthorized errors (401)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    // Log CORS and other errors for debugging
    if (error.message === 'Network Error') {
      console.error('CORS or Network Error:', error);
      // You could add custom handling here
    }
    
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  login: async (rutUsername, contraseña) => {
    const response = await apiClient.post('/auth/login', { rutUsername, contraseña });
    if (response.data && response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },
  
  register: async (userData) => {
    return await apiClient.post('/auth/register', userData);
  },
  
  getUsername: async (rutUsername) => {
    return await apiClient.get(`/auth/username/${rutUsername}`);
  },
  
  logout: () => {
    localStorage.removeItem('token');
  }
};

// Attendance services
export const attendanceService = {
  getAtrasos: async () => {
    return await apiClient.get('/api/atrasos');
  },
  
  createAtraso: async (atrasoData) => {
    return await apiClient.post('/api/atrasos', atrasoData);
  },
  
  updateAtraso: async (id, atrasoData) => {
    return await apiClient.put(`/api/atrasos/${id}`, atrasoData);
  },
  
  deleteAtraso: async (id) => {
    return await apiClient.delete(`/api/atrasos/${id}`);
  },
  
  verifyStudent: async (rut) => {
    return await apiClient.get(`/api/alumnos/verificar/${rut}`);
  },
  
  getStudentInfo: async (rut) => {
    return await apiClient.get(`/api/alumnos/${rut}`);
  },
  
  getAttendanceReportByRange: async (startDate, endDate) => {
    return await apiClient.get('/api/atrasos/rango', {
      params: { startDate, endDate }
    });
  }
};

// Justificativo services
export const justificativoService = {
  getJustificativos: async () => {
    return await apiClient.get('/api/justificativos');
  },
  
  createJustificativo: async (justificativoData) => {
    return await apiClient.post('/api/justificativos', justificativoData);
  }
};

export default {
  authService,
  attendanceService,
  justificativoService
}; 