/* eslint-disable @typescript-eslint/no-explicit-any */
// src/modules/auth/services/authService.ts

import { http } from "@/modules/api/http";
import type {
  LoginRequest,
  SignupRequest,
  RefreshTokenRequest,
  TokenResponse,
} from "../types";

const AUTH_ENDPOINTS = {
  SIGNUP: "/v1/auth/signup",
  LOGIN: "/v1/auth/login",
  REFRESH: "/v1/auth/refresh",
  LOGOUT: "/v1/auth/logout",
  ME: "/v1/auth/me",
} as const;

class AuthService {
  async signup(userData: SignupRequest): Promise<TokenResponse> {
    const response = await http.post<TokenResponse>(
      AUTH_ENDPOINTS.SIGNUP,
      userData
    );
    return response.data;
  }

  async login(loginData: LoginRequest): Promise<TokenResponse> {
    const response = await http.post<TokenResponse>(
      AUTH_ENDPOINTS.LOGIN,
      loginData
    );
    return response.data;
  }

  async refreshToken(refreshData: RefreshTokenRequest): Promise<TokenResponse> {
    const response = await http.post<TokenResponse>(
      AUTH_ENDPOINTS.REFRESH,
      refreshData
    );
    return response.data;
  }

  async logout(): Promise<void> {
    await http.post(AUTH_ENDPOINTS.LOGOUT);
  }

  async getMe(): Promise<any> {
    const response = await http.get(AUTH_ENDPOINTS.ME);
    return response.data;
  }

  // Token management
  setAuthTokens(tokens: TokenResponse): void {
    localStorage.setItem("access_token", tokens.access_token);
    localStorage.setItem("refresh_token", tokens.refresh_token);
    localStorage.setItem("token_expires_in", tokens.expires_in.toString());
    localStorage.setItem("token_type", tokens.token_type);

    // Set expiration time
    const expirationTime = Date.now() + tokens.expires_in * 1000;
    localStorage.setItem("token_expires_at", expirationTime.toString());
  }

  getAccessToken(): string | null {
    return localStorage.getItem("access_token");
  }

  getRefreshToken(): string | null {
    return localStorage.getItem("refresh_token");
  }

  isTokenExpired(): boolean {
    const expiresAt = localStorage.getItem("token_expires_at");
    if (!expiresAt) return true;

    return Date.now() >= parseInt(expiresAt);
  }

  clearTokens(): void {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("token_expires_in");
    localStorage.removeItem("token_type");
    localStorage.removeItem("token_expires_at");
  }

  isAuthenticated(): boolean {
    const accessToken = this.getAccessToken();
    return !!accessToken && !this.isTokenExpired();
  }
}

export const authService = new AuthService();
