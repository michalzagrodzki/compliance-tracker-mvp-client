// src/modules/auth/store/authStore.ts

import { create } from "zustand";
import { authService } from "../services/authService";
import type {
  User,
  LoginRequest,
  SignupRequest,
  AuthState,
  AuthActions,
} from "../types";

interface AuthStore extends AuthState, AuthActions {}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  accessToken: null,
  refreshTokenValue: null,
  isAuthenticated: false,
  isLoading: true,

  // Actions
  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setAuthenticated: (user: User, accessToken: string, refreshToken: string) => {
    set({
      user,
      accessToken,
      refreshTokenValue: refreshToken,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  setUnauthenticated: () => {
    set({
      user: null,
      accessToken: null,
      refreshTokenValue: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  setTokens: (accessToken: string, refreshToken: string) => {
    set({ accessToken, refreshTokenValue: refreshToken });
  },

  initializeAuth: async () => {
    set({ isLoading: true });

    try {
      if (authService.isAuthenticated()) {
        const user = await authService.getMe();
        const accessToken = authService.getAccessToken();
        const refreshTokenValue = authService.getRefreshToken();

        if (user && accessToken && refreshTokenValue) {
          get().setAuthenticated(user, accessToken, refreshTokenValue);
        } else {
          throw new Error("Invalid user data");
        }
      } else {
        get().setUnauthenticated();
      }
    } catch (error) {
      console.error("Auth initialization failed:", error);
      authService.clearTokens();
      get().setUnauthenticated();
    }
  },

  login: async (credentials: LoginRequest) => {
    set({ isLoading: true });

    try {
      const tokenResponse = await authService.login(credentials);
      authService.setAuthTokens(tokenResponse);

      const user = await authService.getMe();

      get().setAuthenticated(
        user,
        tokenResponse.access_token,
        tokenResponse.refresh_token
      );
    } catch (error) {
      get().setUnauthenticated();
      throw error;
    }
  },

  signup: async (userData: SignupRequest) => {
    set({ isLoading: true });

    try {
      const tokenResponse = await authService.signup(userData);
      authService.setAuthTokens(tokenResponse);

      const user = await authService.getMe();

      get().setAuthenticated(
        user,
        tokenResponse.access_token,
        tokenResponse.refresh_token
      );
    } catch (error) {
      get().setUnauthenticated();
      throw error;
    }
  },

  logout: async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      authService.clearTokens();
      get().setUnauthenticated();
    }
  },

  refreshToken: async () => {
    // ← This is the method, not a property
    try {
      const currentRefreshToken = authService.getRefreshToken();
      if (!currentRefreshToken) {
        throw new Error("No refresh token available");
      }

      const tokenResponse = await authService.refreshToken({
        refresh_token: currentRefreshToken,
      });
      authService.setAuthTokens(tokenResponse);

      get().setTokens(tokenResponse.access_token, tokenResponse.refresh_token);
    } catch (error) {
      console.error("Token refresh failed:", error);
      authService.clearTokens();
      get().setUnauthenticated();
      throw error;
    }
  },
}));

// Initialize auth when the store is created
useAuthStore.getState().initializeAuth();
