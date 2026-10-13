import axios from "axios";
import { getToken, clearSession } from "../utils/storage";

// In development Vite forwards /api to the backend on port 5001 (see vite.config.js).
// Set VITE_API_URL only if the API lives on a different address.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
});

// Attach the JWT token to every request
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// If the token has expired, go back to the login page
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthCall = error.config?.url?.startsWith("/auth/");
    if (error.response?.status === 401 && !isAuthCall) {
      clearSession();
      if (window.location.pathname !== "/login") {
        window.location.href = "/login?expired=1";
      }
    }
    return Promise.reject(error);
  }
);

// Turns an axios error into a readable message
export function errorMessage(error, fallback = "Something went wrong. Please try again.") {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.request && !error.response) return "Unable to connect to the server.";
  return fallback;
}

export default api;
