/* eslint-disable no-useless-catch */
import { useCallback } from "react";
import { useComplianceGapStore } from "../store/complianceGapStore";
import type { ComplianceGapFromChatHistoryRequest } from "../types";

export const useComplianceGap = () => {
  const {
    gaps,
    currentGap,
    isLoading,
    error,
    isModalOpen,
    modalData,
    createGapFromChatHistory,
    loadGaps,
    loadGapById,
    loadGapsByAuditSession,
    openModal,
    closeModal,
    setLoading,
    clearError,
    clearGaps,
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
    async (id: string) => {
      await loadGapById(id);
    },
    [loadGapById]
  );

  const handleLoadSessionGaps = useCallback(
    async (sessionId: string) => {
      await loadGapsByAuditSession(sessionId);
    },
    [loadGapsByAuditSession]
  );

  const handleCancelModal = useCallback(() => {
    closeModal();
  }, [closeModal]);

  return {
    // State
    gaps,
    currentGap,
    isLoading,
    error,
    isModalOpen,
    modalData,

    // Actions
    createGapFromMessage: handleCreateGapFromMessage,
    submitGap: handleSubmitGap,
    loadGaps: handleLoadGaps,
    loadGap: handleLoadGap,
    loadSessionGaps: handleLoadSessionGaps,
    cancelModal: handleCancelModal,
    clearError,
    clearGaps,

    // Utilities
    setLoading,
  };
};
