import { create } from "zustand";
import type { AuditSession, DocumentWithRelationship } from "../types";

interface AuditSessionState {
  sessions: AuditSession[];
  currentSession: AuditSession | null;
  sessionDocuments: DocumentWithRelationship[];
  isLoading: boolean;
  isAddingDocument: boolean;
  isRemovingDocument: string | null;
  error: string | null;
}

interface AuditSessionActions {
  // State setters - only for use by hooks
  setSessions: (sessions: AuditSession[]) => void;
  setCurrentSession: (session: AuditSession | null) => void;
  setSessionDocuments: (documents: DocumentWithRelationship[]) => void;
  setLoading: (loading: boolean) => void;
  setAddingDocument: (adding: boolean) => void;
  setRemovingDocument: (documentId: string | null) => void;
  setError: (error: string | null) => void;
  clearError: () => void;

  // Utility actions
  clearSessionDocuments: () => void;
  reset: () => void;
}

interface AuditSessionStore extends AuditSessionState, AuditSessionActions {}

const initialState: AuditSessionState = {
  sessions: [],
  sessionDocuments: [],
  currentSession: null,
  isLoading: false,
  isAddingDocument: false,
  isRemovingDocument: null,
  error: null,
};

export const useAuditSessionStore = create<AuditSessionStore>((set) => ({
  ...initialState,

  // State setters - only for use by hooks
  setSessions: (sessions: AuditSession[]) => set({ sessions }),
  setCurrentSession: (session: AuditSession | null) =>
    set({ currentSession: session }),
  setSessionDocuments: (documents: DocumentWithRelationship[]) =>
    set({ sessionDocuments: documents }),
  setLoading: (loading: boolean) => set({ isLoading: loading }),
  setAddingDocument: (adding: boolean) => set({ isAddingDocument: adding }),
  setRemovingDocument: (documentId: string | null) =>
    set({ isRemovingDocument: documentId }),
  setError: (error: string | null) => set({ error }),
  clearError: () => set({ error: null }),

  // Utility actions
  clearSessionDocuments: () => set({ sessionDocuments: [] }),
  reset: () => set({ ...initialState }),
}));

// Export store utilities
export const auditSessionStoreUtils = {
  getState: () => useAuditSessionStore.getState(),
  setState: useAuditSessionStore.setState,
};
