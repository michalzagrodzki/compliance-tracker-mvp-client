import axios from "axios";

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8000",
  timeout: 30_000,
});

http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
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
        const refreshToken = localStorage.getItem("refresh_token");
        if (refreshToken) {
          // Perform refresh using fetch to avoid circular import
          const response = await fetch(
            `${http.defaults.baseURL}/v1/auth/refresh`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ refresh_token: refreshToken }),
            }
          );

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          const tokenResponse = await response.json();

          // Persist new tokens
          localStorage.setItem("access_token", tokenResponse.access_token);
          localStorage.setItem("refresh_token", tokenResponse.refresh_token);
          localStorage.setItem(
            "token_expires_in",
            tokenResponse.expires_in?.toString?.() || ""
          );
          localStorage.setItem("token_type", tokenResponse.token_type || "");
          const expirationTime =
            Date.now() + (tokenResponse.expires_in || 0) * 1000;
          localStorage.setItem("token_expires_at", expirationTime.toString());

          originalRequest.headers.Authorization = `Bearer ${tokenResponse.access_token}`;
          return http(originalRequest);
        }
      } catch (refreshError) {
        // Clear tokens and redirect on failure
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("token_expires_in");
        localStorage.removeItem("token_type");
        localStorage.removeItem("token_expires_at");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
