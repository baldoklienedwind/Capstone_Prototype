import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/';  // Update if deployed

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;

export const login = async (username, password) => {
  const response = await api.post('token/', {
    username,
    password,
  });
  return response.data;
};