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
  // State
  sessions: [],
  sessionDocuments: [],
  currentSession: null,
  isLoading: false,
  isAddingDocument: false,
  isRemovingDocument: null,
  error: null,

  setLoading: (loading: boolean) => set({ isLoading: loading }),
  setAddingDocument: (adding: boolean) => set({ isAddingDocument: adding }),
  setRemovingDocument: (documentId: string | null) =>
    set({ isRemovingDocument: documentId }),
  clearError: () => set({ error: null }),

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

  // Document-related actions - completely rewritten
  fetchSessionDocuments: async (sessionId: string) => {
    const currentState = get();

    if (currentState.isLoading) {
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const documents = await auditSessionService.getSessionDocuments(
        sessionId
      );
      set({
        sessionDocuments: documents,
        isLoading: false,
        error: null,
      });
      return documents;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail || "Failed to fetch session documents";
      set({
        error: errorMessage,
        isLoading: false,
        sessionDocuments: [], // Clear on error
      });
      throw new Error(errorMessage);
    }
  },

  addDocumentToSession: async (
    sessionId: string,
    documentId: string,
    notes?: string
  ) => {
    set({ isAddingDocument: true, error: null });

    try {
      await auditSessionService.addDocumentToSession(
        sessionId,
        documentId,
        notes
      );

      // Refetch documents to get updated list
      const documents = await auditSessionService.getSessionDocuments(
        sessionId
      );
      set({
        sessionDocuments: documents,
        isAddingDocument: false,
        error: null,
      });

      return documents;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail ||
        "Failed to add document to audit session";
      set({
        error: errorMessage,
        isAddingDocument: false,
      });
      throw new Error(errorMessage);
    }
  },

  removeDocumentFromSession: async (sessionId: string, documentId: string) => {
    set({ isRemovingDocument: documentId, error: null });

    try {
      await auditSessionService.removeDocumentFromSession(
        sessionId,
        documentId
      );

      // Update local state by filtering out the removed document
      const currentDocuments = get().sessionDocuments;
      const updatedDocuments = currentDocuments.filter(
        (doc: { id: string }) => doc.id !== documentId
      );

      set({
        sessionDocuments: updatedDocuments,
        isRemovingDocument: null,
        error: null,
      });

      return updatedDocuments;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail ||
        "Failed to remove document from session";
      set({
        error: errorMessage,
        isRemovingDocument: null,
      });
      throw new Error(errorMessage);
    }
  },

  // Utility methods
  clearSessionDocuments: () => set({ sessionDocuments: [] }),

  setSessionDocuments: (documents: any[]) =>
    set({ sessionDocuments: documents }),
}));

// Export utility functions for direct store access
export const auditSessionStoreUtils = {
  getState: () => useAuditSessionStore.getState(),
  setState: useAuditSessionStore.setState,

  // Safe document fetching that won't cause loops
  fetchDocumentsSafe: async (sessionId: string) => {
    try {
      const documents = await auditSessionService.getSessionDocuments(
        sessionId
      );
      useAuditSessionStore.setState({
        sessionDocuments: documents,
        isLoading: false,
        error: null,
      });
      return documents;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail || "Failed to fetch session documents";
      useAuditSessionStore.setState({
        error: errorMessage,
        isLoading: false,
        sessionDocuments: [],
      });
      throw new Error(errorMessage);
    }
  },
};

export const initializeUserSessions = (userId: string) => {
  const store = useAuditSessionStore.getState();
  store.fetchUserSessions(userId);
};
