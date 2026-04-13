import axios from 'axios';

const backendBaseUrl =
  process.env.REACT_APP_BACKEND_URL?.replace(/\/$/, '') || 'http://localhost:8000';

export const API_BASE_URL = `${backendBaseUrl}/api`;

export const api = axios.create({
  baseURL: API_BASE_URL,
});
