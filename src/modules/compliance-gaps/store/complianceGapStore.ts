/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { complianceGapService } from "../services/complianceGapService";
import type {
  ComplianceGapResponse,
  ComplianceGapFromChatHistoryRequest,
} from "../types";

interface ComplianceGapState {
  gaps: ComplianceGapResponse[];
  currentGap: ComplianceGapResponse | null;
  isLoading: boolean;
  error: string | null;

  isModalOpen: boolean;
  modalData: {
    chatHistoryId?: string;
    auditSessionId?: string;
    complianceDomain?: string;
    initialMessage?: string;
    sources?: string[];
  } | null;
}

interface ComplianceGapActions {
  createGapFromChatHistory: (
    request: ComplianceGapFromChatHistoryRequest
  ) => Promise<ComplianceGapResponse>;
  loadGaps: (params?: {
    skip?: number;
    limit?: number;
    compliance_domain?: string;
    gap_type?: string;
    risk_level?: string;
    status?: string;
  }) => Promise<void>;
  loadGapById: (id: string) => Promise<void>;
  loadGapsByAuditSession: (sessionId: string) => Promise<void>;

  openModal: (data: {
    chatHistoryId: string;
    auditSessionId?: string;
    complianceDomain?: string;
    initialMessage?: string;
    sources?: string[];
  }) => void;
  closeModal: () => void;

  setLoading: (loading: boolean) => void;
  clearError: () => void;
  clearGaps: () => void;
}

interface ComplianceGapStore extends ComplianceGapState, ComplianceGapActions {}

export const useComplianceGapStore = create<ComplianceGapStore>((set, get) => ({
  gaps: [],
  currentGap: null,
  isLoading: false,
  error: null,
  isModalOpen: false,
  modalData: null,

  createGapFromChatHistory: async (
    request: ComplianceGapFromChatHistoryRequest
  ) => {
    set({ isLoading: true, error: null });

    try {
      const response = await complianceGapService.createFromChatHistory(
        request
      );

      set((state) => ({
        gaps: [response, ...state.gaps],
        isLoading: false,
      }));

      return response;
    } catch (error: any) {
      set({
        error: error.message || "Failed to create compliance gap",
        isLoading: false,
      });
      throw error;
    }
  },

  loadGaps: async (params) => {
    set({ isLoading: true, error: null });

    try {
      const gaps = await complianceGapService.getComplianceGaps(params);
      set({
        gaps,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || "Failed to load compliance gaps",
        isLoading: false,
      });
    }
  },

  loadGapById: async (id: string) => {
    set({ isLoading: true, error: null });

    try {
      const gap = await complianceGapService.getComplianceGapById(id);
      set({
        currentGap: gap,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || "Failed to load compliance gap",
        isLoading: false,
      });
    }
  },

  loadGapsByAuditSession: async (sessionId: string) => {
    set({ isLoading: true, error: null });

    try {
      const gaps = await complianceGapService.getGapsByAuditSession(sessionId);
      set({
        gaps,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || "Failed to load audit session gaps",
        isLoading: false,
      });
    }
  },

  // Modal operations
  openModal: (data) => {
    set({
      isModalOpen: true,
      modalData: data,
      error: null,
    });
  },

  closeModal: () => {
    set({
      isModalOpen: false,
      modalData: null,
    });
  },

  // State management
  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  clearError: () => {
    set({ error: null });
  },

  clearGaps: () => {
    set({
      gaps: [],
      currentGap: null,
      error: null,
    });
  },
}));
