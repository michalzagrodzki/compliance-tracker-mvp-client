/* eslint-disable no-useless-catch */
import { useCallback } from "react";
import { useComplianceGapStore } from "../store/complianceGapStore";
import type {
  ComplianceGapAssignment,
  ComplianceGapFromChatHistoryRequest,
  ComplianceGapReview,
  ComplianceGapStatusUpdate,
  ComplianceGapUpdate,
  ComplianceRecommendationResponse,
} from "../types";

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
    createGapFromChatHistory,
    generateRecommendation,
    loadGaps,
    loadGapById,
    loadGapWithChatMessage,
    loadGapsByAuditSession,
    updateGap,
    updateGapStatus,
    assignGap,
    reviewGap,
    openModal,
    closeModal,
    setLoading,
    clearError,
    clearGaps,
    clearRelatedChatMessage,
    clearRecommendationError,
  } = useComplianceGapStore();

  const handleCreateGapFromMessage = useCallback(
    async (
      chatHistoryId: string,
      auditSessionId?: string,
      complianceDomain?: string,
      initialMessage?: string,
      sources?: string[]
    ) => {
      openModal({
        chatHistoryId,
        auditSessionId,
        complianceDomain,
        initialMessage,
        sources,
      });
    },
    [openModal]
  );

  const handleSubmitGap = useCallback(
    async (
      request: ComplianceGapFromChatHistoryRequest
    ): Promise<{ id: string }> => {
      try {
        const response = await createGapFromChatHistory(request);
        return response;
      } catch (error) {
        throw error;
      }
    },
    [createGapFromChatHistory]
  );

  const handleGenerateRecommendation = useCallback(
    async (
      chatHistoryId: number,
      recommendationType: string,
      isoControl?: string
    ): Promise<ComplianceRecommendationResponse> => {
      try {
        const response = await generateRecommendation(
          chatHistoryId,
          recommendationType,
          isoControl
        );
        return response;
      } catch (error) {
        throw error;
      }
    },
    [generateRecommendation]
  );

  const handleLoadGaps = useCallback(
    async (filters?: {
      skip?: number;
      limit?: number;
      compliance_domain?: string;
      gap_type?: string;
      risk_level?: string;
      status?: string;
    }) => {
      await loadGaps(filters);
    },
    [loadGaps]
  );

  const handleLoadGap = useCallback(
    async (id: string, includeChatMessage: boolean = true) => {
      if (includeChatMessage) {
        await loadGapWithChatMessage(id);
      } else {
        await loadGapById(id);
      }
    },
    [loadGapById, loadGapWithChatMessage]
  );

  const handleLoadSessionGaps = useCallback(
    async (sessionId: string) => {
      await loadGapsByAuditSession(sessionId);
    },
    [loadGapsByAuditSession]
  );

  const handleUpdateGap = useCallback(
    async (gapId: string, updateData: ComplianceGapUpdate) => {
      try {
        await updateGap(gapId, updateData);
      } catch (error) {
        throw error;
      }
    },
    [updateGap]
  );

  const handleUpdateGapStatus = useCallback(
    async (gapId: string, statusData: ComplianceGapStatusUpdate) => {
      try {
        await updateGapStatus(gapId, statusData);
      } catch (error) {
        throw error;
      }
    },
    [updateGapStatus]
  );

  const handleAssignGap = useCallback(
    async (gapId: string, assignmentData: ComplianceGapAssignment) => {
      try {
        await assignGap(gapId, assignmentData);
      } catch (error) {
        throw error;
      }
    },
    [assignGap]
  );

  const handleReviewGap = useCallback(
    async (gapId: string, reviewData: ComplianceGapReview) => {
      try {
        await reviewGap(gapId, reviewData);
      } catch (error) {
        throw error;
      }
    },
    [reviewGap]
  );

  const handleCancelModal = useCallback(() => {
    closeModal();
  }, [closeModal]);

  const handleClearRelatedChatMessage = useCallback(() => {
    clearRelatedChatMessage();
  }, [clearRelatedChatMessage]);

  const handleClearRecommendationError = useCallback(() => {
    clearRecommendationError();
  }, [clearRecommendationError]);

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
    createGapFromMessage: handleCreateGapFromMessage,
    submitGap: handleSubmitGap,
    generateRecommendation: handleGenerateRecommendation,
    loadGaps: handleLoadGaps,
    loadGap: handleLoadGap,
    loadSessionGaps: handleLoadSessionGaps,
    updateGap: handleUpdateGap,
    updateGapStatus: handleUpdateGapStatus,
    assignGap: handleAssignGap,
    reviewGap: handleReviewGap,
    cancelModal: handleCancelModal,
    clearError,
    clearGaps,
    clearRelatedChatMessage: handleClearRelatedChatMessage,
    clearRecommendationError: handleClearRecommendationError,

    // Utilities
    setLoading,
  };
};
