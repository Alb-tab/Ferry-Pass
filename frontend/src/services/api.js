import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
});

// Adicionar token aos headers
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (email, password, name) => api.post('/auth/register', { email, password, name }),
};

export const clientAPI = {
  getByCPF: (cpf) => api.get(`/clients?cpf=${cpf}`),
  getAll: () => api.get('/clients'),
  create: (client) => api.post('/clients', client),
  update: (id, client) => api.put(`/clients/${id}`, client),
};

export const vehicleAPI = {
  getByPlate: (plate) => api.get(`/vehicles?plate=${plate}`),
  getAll: () => api.get('/vehicles'),
  create: (vehicle) => api.post('/vehicles', vehicle),
  getFare: (route_id, vehicle_type) => api.get(`/vehicles/fares?route_id=${route_id}&vehicle_type=${vehicle_type}`),
};

export const routeAPI = {
  getAll: () => api.get('/routes'),
  create: (route) => api.post('/routes', route),
};

export const sailingAPI = {
  getByRoute: (route_id) => api.get(`/sailings?route_id=${route_id}`),
  getAll: () => api.get('/sailings'),
  create: (sailing) => api.post('/sailings', sailing),
};

export const ticketAPI = {
  create: (ticket) => api.post('/tickets', ticket),
  getByCode: (code) => api.get(`/tickets?code=${code}`),
  getByClient: (client_id) => api.get(`/tickets?client_id=${client_id}`),
  getPDF: (code) => `${API_URL}/tickets/${code}/pdf`,
};

export default api;
