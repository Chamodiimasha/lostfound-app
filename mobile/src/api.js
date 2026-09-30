import axios from 'axios';
import { API_URL } from './config';

let token = null;
export const setToken = (t) => { token = t; };

const api = axios.create({ baseURL: API_URL, timeout: 30000 }); // generous: free hosts sleep and cold-start
api.interceptors.request.use((config) => {
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const errMsg = (e) => e?.response?.data?.message || 'Network error. Check your connection and try again.';
export default api;
