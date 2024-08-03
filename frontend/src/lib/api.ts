import { config } from "@/lib/config";
import axios from "axios";

export const getGoogleAuthUrl = () => `${config.apiUrl}/auth/google`;

export const api = axios.create({
  baseURL: config.apiUrl,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (request) => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      request.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return request;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !error.config._retry) {
      originalRequest._retry = true; // Mark the request as retried to avoid infinite loops.
      try {
        const response = await axios.post(
          `${config.apiUrl}/auth/refresh`,
          {},
          {
            withCredentials: true,
          },
        );

        const { accessToken } = response.data;
        localStorage.setItem("accessToken", accessToken);

        // Update the authorization header with the new access token.
        api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        localStorage.removeItem("accessToken");
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);
