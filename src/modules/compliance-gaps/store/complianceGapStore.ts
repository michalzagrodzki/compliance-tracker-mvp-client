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
  ComplianceRecommendationResponse,
  ChatHistoryItem,
  ComplianceRecommendationRequest,
} from "../types";
import type { ChatMessage, SourceDocument } from "@/modules/chat/types";
import { chatService } from "@/modules/chat";

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
  relatedChatMessage: ChatMessage | null;
  isLoading: boolean;
  error: string | null;
  isGeneratingRecommendation: boolean;
  recommendationError: string | null;
  lastGeneratedRecommendation: ComplianceRecommendationResponse | null;

  isModalOpen: boolean;
  modalData: {
    chatHistoryId?: string;
    auditSessionId?: string;
    complianceDomain?: string;
    initialMessage?: string;
    sources?: string[] | SourceDocument[];
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
  loadGapWithChatMessage: (id: string) => Promise<void>;
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
    sources?: string[] | SourceDocument[];
  }) => void;
  closeModal: () => void;

  setLoading: (loading: boolean) => void;
  clearError: () => void;
  clearGaps: () => void;
  clearRelatedChatMessage: () => void;
  generateRecommendation: (
    chatHistoryId: number,
    recommendationType: string
  ) => Promise<ComplianceRecommendationResponse>;
  clearRecommendationError: () => void;
}

interface ComplianceGapStore extends ComplianceGapState, ComplianceGapActions {}

export const useComplianceGapStore = create<ComplianceGapStore>((set, get) => ({
  gaps: [],
  currentGap: null,
  relatedChatMessage: null,
  isLoading: false,
  error: null,
  isModalOpen: false,
  modalData: null,
  isGeneratingRecommendation: false,
  recommendationError: null,
  lastGeneratedRecommendation: null,

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
      const gaps =
        await complianceGapService.getComplianceGapsByUserComplianceDomains(
          params
        );
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

  loadGapWithChatMessage: async (id: string) => {
    set({ isLoading: true, error: null, relatedChatMessage: null });

    try {
      // Load the compliance gap
      const gap = await complianceGapService.getComplianceGapById(id);

      let chatMessage: ChatMessage | null = null;

      // If the gap has a chat_history_id, load the related chat message
      if (gap.chat_history_id) {
        try {
          chatMessage = await chatService.getChatHistoryItem(
            gap.chat_history_id.toString()
          );
        } catch (chatError) {
          console.warn(
            `Failed to load chat message for ID ${gap.chat_history_id}:`,
            chatError
          );
          // Don't fail the entire operation if chat message loading fails
        }
      }

      set({
        currentGap: gap,
        relatedChatMessage: chatMessage,
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

  generateRecommendation: async (
    chatHistoryId: number,
    recommendationType: string
  ) => {
    set({
      isGeneratingRecommendation: true,
      recommendationError: null,
      lastGeneratedRecommendation: null,
    });

    try {
      const chatHistoryItem = await complianceGapService.getChatHistoryItem(
        chatHistoryId.toString()
      );

      const chatHistoryItemFormatted: ChatHistoryItem = {
        id: chatHistoryItem.id.toString(),
        conversation_id: chatHistoryItem.conversation_id || "",
        question: chatHistoryItem.question || "",
        answer: chatHistoryItem.answer || "",
        created_at: chatHistoryItem.created_at,
        audit_session_id: chatHistoryItem.audit_session_id || "",
        compliance_domain: chatHistoryItem.compliance_domain || "",
        source_document_ids: chatHistoryItem.source_document_ids || [],
        match_threshold: chatHistoryItem.match_threshold || 0,
        match_count: chatHistoryItem.match_count || 0,
        user_id: chatHistoryItem.user_id || null,
        response_time_ms: chatHistoryItem.response_time_ms || 0,
        total_tokens_used: chatHistoryItem.total_tokens_used || 0,
        metadata: chatHistoryItem.metadata || {},
      };

      const request: ComplianceRecommendationRequest = {
        chat_history_item: chatHistoryItemFormatted,
        recommendation_type: recommendationType,
      };

      const response = await complianceGapService.generateRecommendation(
        request
      );

      set({
        lastGeneratedRecommendation: response,
        isGeneratingRecommendation: false,
      });

      return response;
    } catch (error: any) {
      set({
        recommendationError:
          error.message || "Failed to generate recommendation",
        isGeneratingRecommendation: false,
      });
      throw error;
    }
  },

  clearRecommendationError: () => {
    set({ recommendationError: null });
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

  clearRelatedChatMessage: () => {
    set({ relatedChatMessage: null });
  },
}));
