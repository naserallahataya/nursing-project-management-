// API Base URL
export const API_BASE_URL = 'http://localhost:3000';

// API Endpoints
export const API_ENDPOINTS = {
  // Users/Students
  USERS: `${API_BASE_URL}/api/v1/users`,
  USER_BY_ID: (id) => `${API_BASE_URL}/api/v1/users/${id}`,
  USERS_WITHOUT_ROOM: `${API_BASE_URL}/api/v1/users/no-room`,
  
  // Buildings, Floors, Rooms
  BUILDINGS: `${API_BASE_URL}/api/v1/builds`,
  BUILDINGS_AVAILABLE: `${API_BASE_URL}/api/v1/builds/available`,
  FLOORS_AVAILABLE: `${API_BASE_URL}/api/v1/floors/available`,
  ROOMS: `${API_BASE_URL}/api/v1/rooms`,
  ROOMS_AVAILABLE: `${API_BASE_URL}/api/v1/rooms/available`,
  ROOM_BY_ID: (id) => `${API_BASE_URL}/api/v1/rooms/${id}`,
  ROOM_STUDENTS: (id) => `${API_BASE_URL}/api/v1/rooms/${id}/students`,
  AUTO_ASSIGN: `${API_BASE_URL}/api/v1/auto-assign`,
  
  // Hospitals
  HOSPITALS: `${API_BASE_URL}/api/v1/hospitals`,
  HOSPITAL_BY_ID: (id) => `${API_BASE_URL}/api/v1/hospitals/${id}`,
  HOSPITAL_ASSIGN: `${API_BASE_URL}/api/v1/hospitals/assign`,
  
  // Supervisors/Staff
  SUPERVISORS: `${API_BASE_URL}/api/supervisor/all`,
  SUPERVISOR_ADD: `${API_BASE_URL}/api/supervisor/add`,
  SUPERVISOR_EDIT: (id) => `${API_BASE_URL}/api/supervisor/edit/${id}`,
  SUPERVISOR_DELETE: (id) => `${API_BASE_URL}/api/supervisor/delete/${id}`,
  SUPERVISOR_SEARCH: `${API_BASE_URL}/api/supervisor/search`,
  
  // Shifts
  SHIFTS_ADD: `${API_BASE_URL}/api/shift/add`,
  SHIFTS_BY_SUPERVISOR: (id) => `${API_BASE_URL}/api/shift/supervisor/${id}`,
  SHIFTS_BY_DATE: (date) => `${API_BASE_URL}/api/shift/date/${date}`,
  SHIFTS_EDIT: (id) => `${API_BASE_URL}/api/shift/edit/${id}`,
  SHIFTS_DELETE: (id) => `${API_BASE_URL}/api/shift/delete/${id}`,
  SHIFTS_WEEK: `${API_BASE_URL}/api/shift/week`,
  SHIFTS_EMPTY_FLOORS: (date) => `${API_BASE_URL}/api/shift/empty-floors/${date}`,
  
  // Vacations/Leaves
  VACATIONS_ADD: `${API_BASE_URL}/api/vacation/add`,
  VACATIONS_BY_SUPERVISOR: (id) => `${API_BASE_URL}/api/vacation/supervisor/${id}`,
  VACATIONS_DELETE: (id) => `${API_BASE_URL}/api/vacation/delete/${id}`,
};
