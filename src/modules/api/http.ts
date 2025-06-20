// src/modules/api/http.ts

import axios from "axios";
import { authService } from "@/modules/auth/services/authService";

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8000",
  timeout: 30_000,
});

http.interceptors.request.use(
  (config) => {
    const token = authService.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = authService.getRefreshToken();
        if (refreshToken) {
          const tokenResponse = await authService.refreshToken({
            refresh_token: refreshToken,
          });

          authService.setAuthTokens(tokenResponse);

          originalRequest.headers.Authorization = `Bearer ${tokenResponse.access_token}`;
          return http(originalRequest);
        }
      } catch (refreshError) {
        authService.clearTokens();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
