/* eslint-disable no-useless-catch */
import { useCallback } from "react";
import {
  useAuditReportStore,
  auditReportStoreUtils,
} from "../store/auditReportStore";
import type {
  AuditReport,
  AuditReportCreate,
  AuditReportResponse,
  ExecutiveSummaryResponse,
  SummaryTypeValue,
} from "../types";
import { SummaryType } from "../types";
import type { ComplianceGap } from "@/modules/compliance-gaps/types";

export const useAuditReport = () => {
  const {
    reports,
    currentReport,
    isLoading,
    isCreating,
    error,
    createResponse,
    dataSources,
    isGeneratingSummary,
    executiveSummary,
    summaryError,
    summaryGenerationHistory,
    createReport,
    fetchReports,
    fetchReportById,
    loadSessionDataSources,
    updateChatSelection,
    updateGapSelection,
    updateDocumentSelection,
    selectAllChats,
    selectAllGaps,
    selectAllDocuments,
    clearError,
    clearCreateResponse,
    clearDataSources,
    setLoading,
    isUpdating,
    updateError,
    updateReport,
    clearUpdateError,
    generateExecutiveSummary,
    clearExecutiveSummary,
    clearSummaryError,
    updateExecutiveSummaryInReport,
    getSummaryHistory,
    clearSummaryHistory,
  } = useAuditReportStore();

  const handleCreateReport = useCallback(
    async (reportData: AuditReportCreate): Promise<AuditReportResponse> => {
      try {
        const response = await createReport(reportData);
        return response;
      } catch (error) {
        throw error;
      }
    },
    [createReport]
  );

  const handleUpdateReport = useCallback(
    async (
      reportId: string,
      updateData: Partial<AuditReport>,
      changeDescription?: string
    ) => {
      try {
        await updateReport(reportId, updateData, changeDescription);
      } catch (error) {
        throw error;
      }
    },
    [updateReport]
  );

  const handleLoadReports = useCallback(
    async (skip?: number, limit?: number) => {
      await fetchReports(skip, limit);
    },
    [fetchReports]
  );

  const handleLoadReport = useCallback(
    async (reportId: string) => {
      await fetchReportById(reportId);
    },
    [fetchReportById]
  );

  const handleLoadSessionData = useCallback(
    async (sessionId: string) => {
      await loadSessionDataSources(sessionId);
    },
    [loadSessionDataSources]
  );

  const handleUpdateSelections = useCallback(
    (
      type: "chat" | "gap" | "document",
      id: string | number,
      selected: boolean
    ) => {
      if (type === "chat") {
        updateChatSelection(id as number, selected);
      } else if (type === "gap") {
        updateGapSelection(id as string, selected);
      } else if (type === "document") {
        updateDocumentSelection(id as string, selected);
      }
    },
    [updateChatSelection, updateGapSelection, updateDocumentSelection]
  );

  const handleSelectAll = useCallback(
    (type: "chats" | "gaps" | "documents", selected: boolean) => {
      if (type === "chats") {
        selectAllChats(selected);
      } else if (type === "gaps") {
        selectAllGaps(selected);
      } else if (type === "documents") {
        selectAllDocuments(selected);
      }
    },
    [selectAllChats, selectAllGaps, selectAllDocuments]
  );

  // Executive Summary Actions
  const handleGenerateExecutiveSummary = useCallback(
    async (
      auditReport: AuditReportCreate,
      complianceGaps?: ComplianceGap[],
      summaryType: SummaryTypeValue = SummaryType.STANDARD
    ): Promise<ExecutiveSummaryResponse> => {
      try {
        // Use provided gaps or get from selected data
        const gaps = complianceGaps;

        if (!gaps || (gaps && gaps.length === 0)) {
          throw new Error("No compliance gaps selected for summary generation");
        }

        const response = await generateExecutiveSummary(
          auditReport,
          gaps,
          summaryType
        );
        return response;
      } catch (error) {
        throw error;
      }
    },
    [generateExecutiveSummary]
  );

  const handleUpdateExecutiveSummaryInReport = useCallback(
    async (reportId: string, summary: string) => {
      try {
        await updateExecutiveSummaryInReport(reportId, summary);
      } catch (error) {
        throw error;
      }
    },
    [updateExecutiveSummaryInReport]
  );

  const handleRegenerateSummary = useCallback(
    async (
      auditReport: AuditReportCreate,
      summaryType: SummaryTypeValue = SummaryType.STANDARD
    ): Promise<ExecutiveSummaryResponse> => {
      try {
        clearExecutiveSummary();
        return await handleGenerateExecutiveSummary(
          auditReport,
          undefined,
          summaryType
        );
      } catch (error) {
        throw error;
      }
    },
    [clearExecutiveSummary, handleGenerateExecutiveSummary]
  );

  const handleSaveAndUseSummary = useCallback(
    async (reportId: string, summary?: string): Promise<void> => {
      try {
        const summaryToUse = summary || executiveSummary?.executive_summary;

        if (!summaryToUse) {
          throw new Error("No executive summary available to save");
        }

        await updateExecutiveSummaryInReport(reportId, summaryToUse);
      } catch (error) {
        throw error;
      }
    },
    [executiveSummary, updateExecutiveSummaryInReport]
  );

  const getSelectedData = useCallback(() => {
    return auditReportStoreUtils.getSelectedData();
  }, []);

  const getSelectionCounts = useCallback(() => {
    return auditReportStoreUtils.getSelectionCounts();
  }, []);

  const prepareReportData = useCallback(
    (
      baseReportData: Omit<
        AuditReportCreate,
        | "chat_history_ids"
        | "compliance_gap_ids"
        | "document_ids"
        | "pdf_ingestion_ids"
      >
    ): AuditReportCreate => {
      const selectedData = auditReportStoreUtils.getSelectedData();

      return {
        ...baseReportData,
        chat_history_ids: selectedData.selectedChats.map((chat) => {
          const id =
            typeof chat.id === "string" ? parseInt(chat.id, 10) : chat.id;
          return isNaN(id) ? 0 : id;
        }),
        compliance_gap_ids: selectedData.selectedGaps.map((gap) => gap.id),
        document_ids: selectedData.selectedDocuments.map((doc) => doc.id),
        pdf_ingestion_ids: selectedData.selectedDocuments.map((doc) => doc.id),
      };
    },
    []
  );

  const validateReportData = useCallback(
    (
      reportData: Partial<AuditReportCreate>
    ): { isValid: boolean; errors: string[] } => {
      const errors: string[] = [];
      const selectionCounts = auditReportStoreUtils.getSelectionCounts();

      if (!reportData.report_title?.trim()) {
        errors.push("Report title is required");
      }

      if (!reportData.compliance_domain?.trim()) {
        errors.push("Compliance domain is required");
      }

      if (!reportData.target_audience) {
        errors.push("Target audience is required");
      }

      if (!reportData.confidentiality_level) {
        errors.push("Confidentiality level is required");
      }

      if (
        selectionCounts.selectedChatsCount === 0 &&
        selectionCounts.selectedGapsCount === 0 &&
        selectionCounts.selectedDocumentsCount === 0
      ) {
        errors.push("At least one data source must be selected");
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    },
    []
  );

  const validateSummaryGeneration = useCallback((): {
    isValid: boolean;
    errors: string[];
  } => {
    const errors: string[] = [];
    const selectionCounts = auditReportStoreUtils.getSelectionCounts();

    if (selectionCounts.selectedGapsCount === 0) {
      errors.push(
        "At least one compliance gap must be selected to generate an executive summary"
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, []);

  const resetForm = useCallback(() => {
    clearError();
    clearCreateResponse();
    clearDataSources();
    clearExecutiveSummary();
    clearSummaryError();
  }, [
    clearError,
    clearCreateResponse,
    clearDataSources,
    clearExecutiveSummary,
    clearSummaryError,
  ]);

  const resetSummaryState = useCallback(() => {
    clearExecutiveSummary();
    clearSummaryError();
  }, [clearExecutiveSummary, clearSummaryError]);

  // Executive Summary utilities
  const hasExecutiveSummary = useCallback(() => {
    return auditReportStoreUtils.hasExecutiveSummary();
  }, []);

  const getExecutiveSummaryPreview = useCallback((maxLength?: number) => {
    return auditReportStoreUtils.getExecutiveSummaryPreview(maxLength);
  }, []);

  const canGenerateSummary = useCallback(() => {
    const selectionCounts = auditReportStoreUtils.getSelectionCounts();
    return selectionCounts.selectedGapsCount > 0;
  }, []);

  const getSummaryStats = useCallback(() => {
    if (!executiveSummary) return null;

    return {
      totalGaps: executiveSummary.total_gaps,
      highRiskGaps: executiveSummary.high_risk_gaps,
      mediumRiskGaps: executiveSummary.medium_risk_gaps,
      lowRiskGaps: executiveSummary.low_risk_gaps,
      regulatoryGaps: executiveSummary.regulatory_gaps,
      potentialFinancialImpact: executiveSummary.potential_financial_impact,
      auditSessionId: executiveSummary.audit_session_id,
      complianceDomain: executiveSummary.compliance_domain,
    };
  }, [executiveSummary]);

  return {
    // State
    reports,
    currentReport,
    isLoading,
    isCreating,
    error,
    createResponse,
    dataSources,
    isUpdating,
    updateError,
    isGeneratingSummary,

    // Executive Summary State
    executiveSummary,
    summaryError,
    summaryGenerationHistory,

    // Actions
    createReport: handleCreateReport,
    updateReport: handleUpdateReport,
    loadReports: handleLoadReports,
    loadReport: handleLoadReport,
    loadSessionData: handleLoadSessionData,
    updateSelections: handleUpdateSelections,
    selectAll: handleSelectAll,

    // Executive Summary Actions
    generateExecutiveSummary: handleGenerateExecutiveSummary,
    regenerateSummary: handleRegenerateSummary,
    updateExecutiveSummaryInReport: handleUpdateExecutiveSummaryInReport,
    saveAndUseSummary: handleSaveAndUseSummary,

    // Utilities
    getSelectedData,
    getSelectionCounts,
    prepareReportData,
    validateReportData,
    validateSummaryGeneration,
    resetForm,
    resetSummaryState,
    hasExecutiveSummary,
    getExecutiveSummaryPreview,
    canGenerateSummary,
    getSummaryStats,
    getSummaryHistory,
    clearSummaryHistory,
    clearError,
    clearCreateResponse,
    clearUpdateError,
    clearExecutiveSummary,
    clearSummaryError,
    setLoading,
  };
};
