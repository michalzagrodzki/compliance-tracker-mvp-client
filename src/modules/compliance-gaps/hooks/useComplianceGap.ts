/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback } from "react";
import { complianceGapService } from "../services/complianceGapService";
import { useComplianceGapStore } from "../store/complianceGapStore";
import { normalizeError } from "@/lib/error";
import type {
  ComplianceGapAssignment,
  ComplianceGapFromChatHistoryRequest,
  ComplianceGapReview,
  ComplianceGapStatusUpdate,
  ComplianceGapUpdate,
  ComplianceRecommendationResponse,
  ComplianceRecommendationRequest,
  ChatHistoryItem,
  GapType,
  RiskLevel,
  BusinessImpactLevel,
  RecommendationType,
  DetectionMethod,
} from "../types";
import type { ChatMessage } from "@/modules/chat/types";
import { chatService } from "@/modules/chat";

interface ComplianceGapListParams {
  skip?: number;
  limit?: number;
  compliance_domain?: string;
  gap_type?: string;
  risk_level?: string;
  status?: string;
  audit_session_id?: string;
  assigned_to?: string;
  created_after?: string;
  created_before?: string;
}

export interface ComplianceGapDirectRequest {
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
  iso_control: string | null;
}

export const useComplianceGap = () => {
  const {
    gaps,
    currentGap,
    relatedChatMessage,
    isLoading,
    error,
    isGeneratingRecommendation,
    recommendationError,
    lastGeneratedRecommendation,
    isModalOpen,
    modalData,
    setGaps,
    setCurrentGap,
    setRelatedChatMessage,
    setLoading,
    setError,
    clearError,
    setIsGeneratingRecommendation,
    setRecommendationError,
    clearRecommendationError,
    setLastGeneratedRecommendation,
    openModal,
    closeModal,
    clearGaps,
    clearRelatedChatMessage,
    addGap,
    updateGapInStore,
    filterGaps,
    filterGapsByStatus,
    filterGapsByRiskLevel,
  } = useComplianceGapStore();

  const loadGaps = useCallback(
    async (params: ComplianceGapListParams = {}) => {
      setLoading(true);
      clearError();

      try {
        const gaps =
          await complianceGapService.getComplianceGapsByUserComplianceDomains({
            skip: params.skip || 0,
            limit: params.limit || 50,
          });
        setGaps(gaps);
      } catch (error) {
        const normalizedError = normalizeError(error);
        setError(normalizedError.message || "Failed to load compliance gaps");
      } finally {
        setLoading(false);
      }
    },
    [setLoading, clearError, setGaps, setError]
  );

  const loadGapById = useCallback(
    async (gapId: string) => {
      setLoading(true);
      clearError();

      try {
        const gap = await complianceGapService.getComplianceGapById(gapId);
        setCurrentGap(gap);
      } catch (error) {
        const normalizedError = normalizeError(error);
        setError(normalizedError.message || "Failed to load compliance gap");
      } finally {
        setLoading(false);
      }
    },
    [setLoading, clearError, setCurrentGap, setError]
  );

  const loadGapWithChatMessage = useCallback(
    async (gapId: string) => {
      setLoading(true);
      clearError();
      setRelatedChatMessage(null);

      try {
        const gap = await complianceGapService.getComplianceGapById(gapId);
        setCurrentGap(gap);

        let chatMessage: ChatMessage | null = null;

        if (gap.chat_history_id) {
          try {
            chatMessage = await chatService.getChatHistoryItem(
              gap.chat_history_id.toString()
            );
            setRelatedChatMessage(chatMessage);
          } catch (chatError) {
            console.warn(
              `Failed to load chat message for ID ${gap.chat_history_id}:`,
              chatError
            );
          }
        }
      } catch (error) {
        const normalizedError = normalizeError(error);
        setError(normalizedError.message || "Failed to load compliance gap");
      } finally {
        setLoading(false);
      }
    },
    [setLoading, clearError, setCurrentGap, setRelatedChatMessage, setError]
  );

  const createGapFromChatHistory = useCallback(
    async (request: ComplianceGapFromChatHistoryRequest) => {
      setLoading(true);
      clearError();

      try {
        const response = await complianceGapService.createFromChatHistory(
          request
        );
        addGap(response);
        return response;
      } catch (error) {
        const normalizedError = normalizeError(error);
        setError(normalizedError.message || "Failed to create compliance gap");
        throw normalizedError;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, clearError, addGap, setError]
  );

  const createGapDirect = useCallback(
    async (request: ComplianceGapDirectRequest) => {
      setLoading(true);
      clearError();

      try {
        const response = await complianceGapService.createDirect(request);
        addGap(response);
        return response;
      } catch (error) {
        const normalizedError = normalizeError(error);
        setError(normalizedError.message || "Failed to create compliance gap");
        throw normalizedError;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, clearError, addGap, setError]
  );

  const updateGap = useCallback(
    async (gapId: string, updateData: ComplianceGapUpdate) => {
      setLoading(true);
      clearError();

      try {
        const updatedGap = await complianceGapService.updateComplianceGap(
          gapId,
          updateData
        );
        updateGapInStore(gapId, updatedGap);
      } catch (error) {
        const normalizedError = normalizeError(error);
        setError(normalizedError.message || "Failed to update compliance gap");
        throw normalizedError;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, clearError, updateGapInStore, setError]
  );

  const generateRecommendation = useCallback(
    async (
      chatHistoryId: number,
      recommendationType: string,
      isoControl?: string
    ): Promise<ComplianceRecommendationResponse> => {
      setIsGeneratingRecommendation(true);
      setRecommendationError(null);
      setLastGeneratedRecommendation(null);

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
          iso_control: isoControl || undefined,
        };

        const response = await complianceGapService.generateRecommendation(
          request
        );
        setLastGeneratedRecommendation(response);
        return response;
      } catch (error) {
        const normalizedError = normalizeError(error);
        setRecommendationError(
          normalizedError.message || "Failed to generate recommendation"
        );
        throw normalizedError;
      } finally {
        setIsGeneratingRecommendation(false);
      }
    },
    [
      setIsGeneratingRecommendation,
      setRecommendationError,
      setLastGeneratedRecommendation,
    ]
  );

  const updateGapStatus = useCallback(
    async (gapId: string, statusData: ComplianceGapStatusUpdate) => {
      setLoading(true);
      clearError();

      try {
        const updatedGap = await complianceGapService.updateComplianceGapStatus(
          gapId,
          statusData
        );
        updateGapInStore(gapId, updatedGap);
      } catch (error) {
        const normalizedError = normalizeError(error);
        setError(normalizedError.message || "Failed to update gap status");
        throw normalizedError;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, clearError, updateGapInStore, setError]
  );

  const assignGap = useCallback(
    async (gapId: string, assignmentData: ComplianceGapAssignment) => {
      setLoading(true);
      clearError();

      try {
        const updatedGap = await complianceGapService.assignComplianceGap(
          gapId,
          assignmentData
        );
        updateGapInStore(gapId, updatedGap);
      } catch (error) {
        const normalizedError = normalizeError(error);
        setError(normalizedError.message || "Failed to assign compliance gap");
        throw normalizedError;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, clearError, updateGapInStore, setError]
  );

  const reviewGap = useCallback(
    async (gapId: string, reviewData: ComplianceGapReview) => {
      setLoading(true);
      clearError();

      try {
        const updatedGap = await complianceGapService.reviewComplianceGap(
          gapId,
          reviewData
        );
        updateGapInStore(gapId, updatedGap);
      } catch (error) {
        const normalizedError = normalizeError(error);
        setError(normalizedError.message || "Failed to review compliance gap");
        throw normalizedError;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, clearError, updateGapInStore, setError]
  );

  const loadGapsByAuditSession = useCallback(
    async (sessionId: string) => {
      setLoading(true);
      clearError();

      try {
        const gaps = await complianceGapService.getGapsByAuditSession(
          sessionId
        );
        setGaps(gaps);
      } catch (error) {
        const normalizedError = normalizeError(error);
        setError(
          normalizedError.message || "Failed to load audit session gaps"
        );
      } finally {
        setLoading(false);
      }
    },
    [setLoading, clearError, setGaps, setError]
  );

  const searchGaps = useCallback(
    async (searchParams: ComplianceGapListParams) => {
      setLoading(true);
      clearError();

      try {
        const gaps = await complianceGapService.getComplianceGaps(searchParams);
        setGaps(gaps);
      } catch (error) {
        const normalizedError = normalizeError(error);
        setError(normalizedError.message || "Failed to search compliance gaps");
      } finally {
        setLoading(false);
      }
    },
    [setLoading, clearError, setGaps, setError]
  );

  return {
    // State
    gaps,
    currentGap,
    relatedChatMessage,
    isLoading,
    error,
    isGeneratingRecommendation,
    recommendationError,
    lastGeneratedRecommendation,
    isModalOpen,
    modalData,

    // Actions
    loadGaps,
    loadGapById,
    loadGapWithChatMessage,
    loadGapsByAuditSession,
    createGapFromChatHistory,
    createGapDirect,
    updateGap,
    updateGapStatus,
    assignGap,
    reviewGap,
    generateRecommendation,
    searchGaps,
    clearError,
    clearGaps,
    clearRelatedChatMessage,
    clearRecommendationError,
    openModal,
    closeModal,

    // Utilities
    filterGaps,
    filterGapsByStatus,
    filterGapsByRiskLevel,
  };
};
