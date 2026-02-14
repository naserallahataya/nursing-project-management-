import axios from 'axios';
import { API_ENDPOINTS, API_BASE_URL } from '../constants/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor (for adding auth tokens, etc.)
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
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

// Response interceptor (for handling errors globally)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API Service Functions
export const userService = {
  getAll: () => api.get(API_ENDPOINTS.USERS),
  getById: (id) => api.get(API_ENDPOINTS.USER_BY_ID(id)),
  getWithoutRoom: () => api.get(API_ENDPOINTS.USERS_WITHOUT_ROOM),
  create: (data) => api.post(API_ENDPOINTS.USERS, data),
  update: (id, data) => api.put(API_ENDPOINTS.USER_BY_ID(id), data),
  delete: (id) => api.delete(API_ENDPOINTS.USER_BY_ID(id)),
};

export const buildingService = {
  getAll: () => api.get(API_ENDPOINTS.BUILDINGS),
  getAvailable: () => api.get(API_ENDPOINTS.BUILDINGS_AVAILABLE),
  create: (data) => api.post(`${API_BASE_URL}/api/v1/builds`, data),
};

export const floorService = {
  getAvailable: () => api.get(API_ENDPOINTS.FLOORS_AVAILABLE),
  create: (data) => api.post(`${API_BASE_URL}/api/v1/floors`, data),
};

export const roomService = {
  getAll: () => api.get(API_ENDPOINTS.ROOMS),
  getAvailable: () => api.get(API_ENDPOINTS.ROOMS_AVAILABLE),
  getById: (id) => api.get(API_ENDPOINTS.ROOM_BY_ID(id)),
  create: (data) => api.post(API_ENDPOINTS.ROOMS, data),
  update: (id, data) => api.put(API_ENDPOINTS.ROOM_BY_ID(id), data),
  addStudent: (id, studentId) => api.post(API_ENDPOINTS.ROOM_STUDENTS(id), { studentId }),
  removeStudent: (id, studentId) => api.delete(API_ENDPOINTS.ROOM_STUDENTS(id), { data: { studentId } }),
};

export const hospitalService = {
  getAll: () => api.get(API_ENDPOINTS.HOSPITALS),
  getById: (id) => api.get(API_ENDPOINTS.HOSPITAL_BY_ID(id)),
  create: (data) => api.post(API_ENDPOINTS.HOSPITALS, data),
  update: (id, data) => api.put(API_ENDPOINTS.HOSPITAL_BY_ID(id), data),
  delete: (id) => api.delete(API_ENDPOINTS.HOSPITAL_BY_ID(id)),
  assignStudent: (data) => api.post(API_ENDPOINTS.HOSPITAL_ASSIGN, data),
};

export const supervisorService = {
  getAll: () => api.get(API_ENDPOINTS.SUPERVISORS),
  create: (data) => api.post(API_ENDPOINTS.SUPERVISOR_ADD, data),
  update: (id, data) => api.put(API_ENDPOINTS.SUPERVISOR_EDIT(id), data),
  delete: (id) => api.delete(API_ENDPOINTS.SUPERVISOR_DELETE(id)),
  search: (name) => api.get(`${API_ENDPOINTS.SUPERVISOR_SEARCH}?name=${name}`),
};

export const shiftService = {
  create: (data) => api.post(API_ENDPOINTS.SHIFTS_ADD, data),
  getBySupervisor: (id) => api.get(API_ENDPOINTS.SHIFTS_BY_SUPERVISOR(id)),
  getByDate: (date) => api.get(API_ENDPOINTS.SHIFTS_BY_DATE(date)),
  getWeek: (startDate) => api.get(`${API_ENDPOINTS.SHIFTS_WEEK}?start=${startDate}`),
  update: (id, data) => api.put(API_ENDPOINTS.SHIFTS_EDIT(id), data),
  delete: (id) => api.delete(API_ENDPOINTS.SHIFTS_DELETE(id)),
  getEmptyFloors: (date) => api.get(API_ENDPOINTS.SHIFTS_EMPTY_FLOORS(date)),
};

export const vacationService = {
  create: (data) => api.post(API_ENDPOINTS.VACATIONS_ADD, data),
  getBySupervisor: (id) => api.get(API_ENDPOINTS.VACATIONS_BY_SUPERVISOR(id)),
  delete: (id) => api.delete(API_ENDPOINTS.VACATIONS_DELETE(id)),
};

export default api;
