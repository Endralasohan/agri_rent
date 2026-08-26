import axios from 'axios';

export const API_BASE_URL = 'https://agri-rent-gzex.onrender.com';
export const TOKEN_KEY = 'agri_rent_token';
export const USER_KEY = 'agri_rent_user';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 25000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
