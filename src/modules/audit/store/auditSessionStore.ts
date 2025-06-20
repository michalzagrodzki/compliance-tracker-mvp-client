/* eslint-disable @typescript-eslint/no-explicit-any */
// src/modules/audit/store/auditSessionStore.ts

import { create } from "zustand";
import { auditSessionService } from "../services/auditSessionService";
import type {
  AuditSession,
  AuditSessionCreate,
  AuditSessionSearchRequest,
  AuditSessionState,
  AuditSessionActions,
} from "../types";

interface AuditSessionStore extends AuditSessionState, AuditSessionActions {}

export const useAuditSessionStore = create<AuditSessionStore>((set, get) => ({
  // Initial state
  sessions: [],
  currentSession: null,
  isLoading: false,
  error: null,

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  clearError: () => {
    set({ error: null });
  },

  fetchUserSessions: async (
    userId: string,
    skip: number = 0,
    limit: number = 10
  ) => {
    set({ isLoading: true, error: null });

    try {
      const sessions = await auditSessionService.getUserSessions(
        userId,
        skip,
        limit
      );
      set({ sessions, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || "Failed to fetch audit sessions",
        isLoading: false,
      });
    }
  },

  fetchSessionById: async (sessionId: string) => {
    set({ isLoading: true, error: null });

    try {
      const session = await auditSessionService.getSessionById(sessionId);
      set({ currentSession: session, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || "Failed to fetch audit session",
        isLoading: false,
      });
    }
  },

  createSession: async (
    sessionData: AuditSessionCreate
  ): Promise<AuditSession> => {
    set({ isLoading: true, error: null });

    try {
      const newSession = await auditSessionService.createSession(sessionData);

      const currentSessions = get().sessions;
      set({
        sessions: [newSession, ...currentSessions],
        currentSession: newSession,
        isLoading: false,
      });

      return newSession;
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || "Failed to create audit session",
        isLoading: false,
      });
      throw error;
    }
  },

  searchSessions: async (searchData: AuditSessionSearchRequest) => {
    set({ isLoading: true, error: null });

    try {
      const sessions = await auditSessionService.searchSessions(searchData);
      set({ sessions, isLoading: false });
    } catch (error: any) {
      set({
        error:
          error.response?.data?.detail || "Failed to search audit sessions",
        isLoading: false,
      });
    }
  },
}));

export const initializeUserSessions = (userId: string) => {
  const store = useAuditSessionStore.getState();
  store.fetchUserSessions(userId);
};
