/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { complianceGapService } from "../services/complianceGapService";
import type {
  ComplianceGapResponse,
  ComplianceGapFromChatHistoryRequest,
  ComplianceGapAssignment,
  ComplianceGapReview,
  ComplianceGapStatusUpdate,
  ComplianceGapUpdate,
  GapType,
  RiskLevel,
  BusinessImpactLevel,
  RecommendationType,
  DetectionMethod,
} from "../types";

// Add interface for direct creation request
interface ComplianceGapDirectRequest {
  user_id: string;
  audit_session_id: string;
  compliance_domain: string;
  gap_type: GapType;
  gap_category: string;
  gap_title: string;
  gap_description: string;
  original_question: string;
  creation_method: "direct";
  chat_history_id?: number;
  pdf_ingestion_id?: string;
  expected_answer_type?: string;
  search_terms_used: string[];
  similarity_threshold_used: number;
  best_match_score: number;
  risk_level: RiskLevel;
  business_impact: BusinessImpactLevel;
  regulatory_requirement: boolean;
  potential_fine_amount: number;
  recommendation_type?: RecommendationType;
  recommendation_text: string;
  recommended_actions: string[];
  related_documents: string[];
  detection_method: DetectionMethod;
  confidence_score: number;
  false_positive_likelihood: number;
  ip_address?: string;
  user_agent: string;
  session_context: Record<string, any>;
}

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

  // Add new action for direct creation
  createGapDirect: (
    request: ComplianceGapDirectRequest
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
  updateGap: (gapId: string, updateData: ComplianceGapUpdate) => Promise<void>;
  updateGapStatus: (
    gapId: string,
    statusData: ComplianceGapStatusUpdate
  ) => Promise<void>;
  assignGap: (
    gapId: string,
    assignmentData: ComplianceGapAssignment
  ) => Promise<void>;
  reviewGap: (gapId: string, reviewData: ComplianceGapReview) => Promise<void>;
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

  createGapDirect: async (request: ComplianceGapDirectRequest) => {
    set({ isLoading: true, error: null });

    try {
      const response = await complianceGapService.createDirect(request);

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

  updateGap: async (gapId: string, updateData: ComplianceGapUpdate) => {
    set({ isLoading: true, error: null });

    try {
      const updatedGap = await complianceGapService.updateComplianceGap(
        gapId,
        updateData
      );

      set((state) => ({
        gaps: state.gaps.map((gap) => (gap.id === gapId ? updatedGap : gap)),
        currentGap:
          state.currentGap?.id === gapId ? updatedGap : state.currentGap,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message || "Failed to update compliance gap",
        isLoading: false,
      });
      throw error;
    }
  },

  updateGapStatus: async (
    gapId: string,
    statusData: ComplianceGapStatusUpdate
  ) => {
    set({ isLoading: true, error: null });

    try {
      const updatedGap = await complianceGapService.updateComplianceGapStatus(
        gapId,
        statusData
      );

      set((state) => ({
        gaps: state.gaps.map((gap) => (gap.id === gapId ? updatedGap : gap)),
        currentGap:
          state.currentGap?.id === gapId ? updatedGap : state.currentGap,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message || "Failed to update gap status",
        isLoading: false,
      });
      throw error;
    }
  },

  assignGap: async (gapId: string, assignmentData: ComplianceGapAssignment) => {
    set({ isLoading: true, error: null });

    try {
      const updatedGap = await complianceGapService.assignComplianceGap(
        gapId,
        assignmentData
      );

      set((state) => ({
        gaps: state.gaps.map((gap) => (gap.id === gapId ? updatedGap : gap)),
        currentGap:
          state.currentGap?.id === gapId ? updatedGap : state.currentGap,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message || "Failed to assign compliance gap",
        isLoading: false,
      });
      throw error;
    }
  },

  reviewGap: async (gapId: string, reviewData: ComplianceGapReview) => {
    set({ isLoading: true, error: null });

    try {
      const updatedGap = await complianceGapService.reviewComplianceGap(
        gapId,
        reviewData
      );

      set((state) => ({
        gaps: state.gaps.map((gap) => (gap.id === gapId ? updatedGap : gap)),
        currentGap:
          state.currentGap?.id === gapId ? updatedGap : state.currentGap,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message || "Failed to review compliance gap",
        isLoading: false,
      });
      throw error;
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
