/* eslint-disable no-useless-catch */
import { useCallback } from "react";
import {
  useAuditReportStore,
  auditReportStoreUtils,
} from "../store/auditReportStore";
import type {
  AuditReport,
  AuditReportCreate,
  AuditReportGenerateRequest,
  AuditReportGenerateResponse,
  AuditReportResponse,
  ExecutiveSummaryResponse,
  ThreatIntelligenceResponse,
  RiskPrioritizationResponse,
  TargetAudienceResponse,
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
    isGeneratingThreatIntelligence,
    threatIntelligence,
    threatIntelligenceError,
    threatIntelligenceGenerationHistory,
    isGeneratingRiskPrioritization,
    riskPrioritization,
    riskPrioritizationError,
    riskPrioritizationGenerationHistory,
    isGeneratingTargetAudience,
    targetAudience,
    targetAudienceError,
    targetAudienceGenerationHistory,
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
    generateThreatIntelligence,
    clearThreatIntelligence,
    clearThreatIntelligenceError,
    updateThreatIntelligenceInReport,
    getThreatIntelligenceHistory,
    clearThreatIntelligenceHistory,
    generateRiskPrioritization,
    clearRiskPrioritization,
    clearRiskPrioritizationError,
    updateRiskPrioritizationInReport,
    getRiskPrioritizationHistory,
    clearRiskPrioritizationHistory,
    generateTargetAudience,
    clearTargetAudience,
    clearTargetAudienceError,
    updateTargetAudienceInReport,
    getTargetAudienceHistory,
    clearTargetAudienceHistory,
    isGenerating,
    generateResponse,
    generateError,
    generateAuditReport,
    clearGenerateResponse,
    clearGenerateError,
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

  const handleGenerateReport = useCallback(
    async (
      generateRequest: AuditReportGenerateRequest
    ): Promise<AuditReportGenerateResponse> => {
      try {
        const response = await generateAuditReport(generateRequest);
        return response;
      } catch (error) {
        throw error;
      }
    },
    [generateAuditReport]
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

  const handleLoadReports = useCallback(async () => {
    await fetchReports();
  }, [fetchReports]);

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

  // Threat Intelligence Actions
  const handleGenerateThreatIntelligence = useCallback(
    async (
      auditReport: AuditReportCreate,
      complianceGaps?: ComplianceGap[],
      summaryType: SummaryTypeValue = SummaryType.STANDARD
    ): Promise<ThreatIntelligenceResponse> => {
      try {
        const gaps = complianceGaps;

        if (!gaps || (gaps && gaps.length === 0)) {
          throw new Error(
            "No compliance gaps selected for threat intelligence generation"
          );
        }

        const response = await generateThreatIntelligence(
          auditReport,
          gaps,
          summaryType
        );
        return response;
      } catch (error) {
        throw error;
      }
    },
    [generateThreatIntelligence]
  );

  const handleUpdateThreatIntelligenceInReport = useCallback(
    async (reportId: string, analysis: string) => {
      try {
        await updateThreatIntelligenceInReport(reportId, analysis);
      } catch (error) {
        throw error;
      }
    },
    [updateThreatIntelligenceInReport]
  );

  const handleSaveAndUseThreatIntelligence = useCallback(
    async (reportId: string, analysis?: string): Promise<void> => {
      try {
        const analysisToUse =
          analysis || threatIntelligence?.threat_intelligence_analysis;

        if (!analysisToUse) {
          throw new Error("No threat intelligence analysis available to save");
        }

        await updateThreatIntelligenceInReport(reportId, analysisToUse);
      } catch (error) {
        throw error;
      }
    },
    [threatIntelligence, updateThreatIntelligenceInReport]
  );

  // Risk Prioritization Actions
  const handleGenerateRiskPrioritization = useCallback(
    async (
      auditReport: AuditReportCreate,
      complianceGaps?: ComplianceGap[],
      summaryType: SummaryTypeValue = SummaryType.STANDARD
    ): Promise<RiskPrioritizationResponse> => {
      try {
        const gaps = complianceGaps;

        if (!gaps || (gaps && gaps.length === 0)) {
          throw new Error(
            "No compliance gaps selected for risk prioritization generation"
          );
        }

        const response = await generateRiskPrioritization(
          auditReport,
          gaps,
          summaryType
        );
        return response;
      } catch (error) {
        throw error;
      }
    },
    [generateRiskPrioritization]
  );

  const handleUpdateRiskPrioritizationInReport = useCallback(
    async (reportId: string, prioritization: string) => {
      try {
        await updateRiskPrioritizationInReport(reportId, prioritization);
      } catch (error) {
        throw error;
      }
    },
    [updateRiskPrioritizationInReport]
  );

  const handleSaveAndUseRiskPrioritization = useCallback(
    async (reportId: string, prioritization?: string): Promise<void> => {
      try {
        const prioritizationToUse =
          prioritization || riskPrioritization?.control_risk_prioritization;

        if (!prioritizationToUse) {
          throw new Error("No risk prioritization available to save");
        }

        await updateRiskPrioritizationInReport(reportId, prioritizationToUse);
      } catch (error) {
        throw error;
      }
    },
    [riskPrioritization, updateRiskPrioritizationInReport]
  );

  // Target Audience Actions
  const handleGenerateTargetAudience = useCallback(
    async (
      auditReport: AuditReportCreate,
      complianceGaps?: ComplianceGap[],
      summaryType: SummaryTypeValue = SummaryType.STANDARD
    ): Promise<TargetAudienceResponse> => {
      try {
        const gaps = complianceGaps;

        if (!gaps || (gaps && gaps.length === 0)) {
          throw new Error(
            "No compliance gaps selected for target audience generation"
          );
        }

        const response = await generateTargetAudience(
          auditReport,
          gaps,
          summaryType
        );
        return response;
      } catch (error) {
        throw error;
      }
    },
    [generateTargetAudience]
  );

  const handleUpdateTargetAudienceInReport = useCallback(
    async (reportId: string, summary: string) => {
      try {
        await updateTargetAudienceInReport(reportId, summary);
      } catch (error) {
        throw error;
      }
    },
    [updateTargetAudienceInReport]
  );

  const handleSaveAndUseTargetAudience = useCallback(
    async (reportId: string, summary?: string): Promise<void> => {
      try {
        const summaryToUse = summary || targetAudience?.target_audience_summary;

        if (!summaryToUse) {
          throw new Error("No target audience summary available to save");
        }

        await updateTargetAudienceInReport(reportId, summaryToUse);
      } catch (error) {
        throw error;
      }
    },
    [targetAudience, updateTargetAudienceInReport]
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

  const validateGenerateRequest = useCallback(
    (
      generateRequest: Partial<AuditReportGenerateRequest>
    ): { isValid: boolean; errors: string[] } => {
      const errors: string[] = [];

      if (!generateRequest.audit_session_id?.trim()) {
        errors.push("Audit session ID is required");
      }

      if (!generateRequest.report_title?.trim()) {
        errors.push("Report title is required");
      }

      if (!generateRequest.report_type) {
        errors.push("Report type is required");
      }

      if (!generateRequest.target_audience) {
        errors.push("Target audience is required");
      }

      if (!generateRequest.confidentiality_level) {
        errors.push("Confidentiality level is required");
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
        "At least one compliance gap must be selected to generate summaries"
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
    clearThreatIntelligence();
    clearThreatIntelligenceError();
    clearRiskPrioritization();
    clearRiskPrioritizationError();
    clearTargetAudience();
    clearTargetAudienceError();
  }, [
    clearError,
    clearCreateResponse,
    clearDataSources,
    clearExecutiveSummary,
    clearSummaryError,
    clearThreatIntelligence,
    clearThreatIntelligenceError,
    clearRiskPrioritization,
    clearRiskPrioritizationError,
    clearTargetAudience,
    clearTargetAudienceError,
  ]);

  const resetSummaryState = useCallback(() => {
    clearExecutiveSummary();
    clearSummaryError();
  }, [clearExecutiveSummary, clearSummaryError]);

  const resetThreatIntelligenceState = useCallback(() => {
    clearThreatIntelligence();
    clearThreatIntelligenceError();
  }, [clearThreatIntelligence, clearThreatIntelligenceError]);

  const resetRiskPrioritizationState = useCallback(() => {
    clearRiskPrioritization();
    clearRiskPrioritizationError();
  }, [clearRiskPrioritization, clearRiskPrioritizationError]);

  const resetTargetAudienceState = useCallback(() => {
    clearTargetAudience();
    clearTargetAudienceError();
  }, [clearTargetAudience, clearTargetAudienceError]);

  const resetGenerationState = useCallback(() => {
    clearGenerateError();
    clearGenerateResponse();
  }, [clearGenerateError, clearGenerateResponse]);

  // Executive Summary utilities
  const hasExecutiveSummary = useCallback(() => {
    return auditReportStoreUtils.hasExecutiveSummary();
  }, []);

  const getExecutiveSummaryPreview = useCallback((maxLength?: number) => {
    return auditReportStoreUtils.getExecutiveSummaryPreview(maxLength);
  }, []);

  // Threat Intelligence utilities
  const hasThreatIntelligence = useCallback(() => {
    return auditReportStoreUtils.hasThreatIntelligence();
  }, []);

  const getThreatIntelligencePreview = useCallback((maxLength?: number) => {
    return auditReportStoreUtils.getThreatIntelligencePreview(maxLength);
  }, []);

  // Risk Prioritization utilities
  const hasRiskPrioritization = useCallback(() => {
    return auditReportStoreUtils.hasRiskPrioritization();
  }, []);

  const getRiskPrioritizationPreview = useCallback((maxLength?: number) => {
    return auditReportStoreUtils.getRiskPrioritizationPreview(maxLength);
  }, []);

  // Target Audience utilities
  const hasTargetAudience = useCallback(() => {
    return auditReportStoreUtils.hasTargetAudience();
  }, []);

  const getTargetAudiencePreview = useCallback((maxLength?: number) => {
    return auditReportStoreUtils.getTargetAudiencePreview(maxLength);
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

  const getThreatIntelligenceStats = useCallback(() => {
    if (!threatIntelligence) return null;

    return {
      totalGaps: threatIntelligence.total_gaps,
      highRiskGaps: threatIntelligence.high_risk_gaps,
      mediumRiskGaps: threatIntelligence.medium_risk_gaps,
      lowRiskGaps: threatIntelligence.low_risk_gaps,
      regulatoryGaps: threatIntelligence.regulatory_gaps,
      threatIndicators: threatIntelligence.threat_indicators,
      vulnerabilityScore: threatIntelligence.vulnerability_score,
      auditSessionId: threatIntelligence.audit_session_id,
      complianceDomain: threatIntelligence.compliance_domain,
    };
  }, [threatIntelligence]);

  const getRiskPrioritizationStats = useCallback(() => {
    if (!riskPrioritization) return null;

    return {
      totalGaps: riskPrioritization.total_gaps,
      highRiskGaps: riskPrioritization.high_risk_gaps,
      mediumRiskGaps: riskPrioritization.medium_risk_gaps,
      lowRiskGaps: riskPrioritization.low_risk_gaps,
      regulatoryGaps: riskPrioritization.regulatory_gaps,
      prioritizedRisks: riskPrioritization.prioritized_risks,
      riskScore: riskPrioritization.risk_score,
      auditSessionId: riskPrioritization.audit_session_id,
      complianceDomain: riskPrioritization.compliance_domain,
    };
  }, [riskPrioritization]);

  const getTargetAudienceStats = useCallback(() => {
    if (!targetAudience) return null;

    return {
      totalGaps: targetAudience.total_gaps,
      highRiskGaps: targetAudience.high_risk_gaps,
      mediumRiskGaps: targetAudience.medium_risk_gaps,
      lowRiskGaps: targetAudience.low_risk_gaps,
      regulatoryGaps: targetAudience.regulatory_gaps,
      audienceFocusAreas: targetAudience.audience_focus_areas,
      communicationLevel: targetAudience.communication_level,
      auditSessionId: targetAudience.audit_session_id,
      complianceDomain: targetAudience.compliance_domain,
    };
  }, [targetAudience]);

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

    // Executive Summary state
    isGeneratingSummary,
    executiveSummary,
    summaryError,
    summaryGenerationHistory,

    // Threat Intelligence state
    isGeneratingThreatIntelligence,
    threatIntelligence,
    threatIntelligenceError,
    threatIntelligenceGenerationHistory,

    // Risk Prioritization state
    isGeneratingRiskPrioritization,
    riskPrioritization,
    riskPrioritizationError,
    riskPrioritizationGenerationHistory,

    // Target Audience state
    isGeneratingTargetAudience,
    targetAudience,
    targetAudienceError,
    targetAudienceGenerationHistory,

    isGenerating,
    generateResponse,
    generateError,

    // Actions
    createReport: handleCreateReport,
    updateReport: handleUpdateReport,
    loadReports: handleLoadReports,
    loadReport: handleLoadReport,
    loadSessionData: handleLoadSessionData,
    updateSelections: handleUpdateSelections,
    selectAll: handleSelectAll,

    // Executive Summary actions
    generateExecutiveSummary: handleGenerateExecutiveSummary,
    regenerateSummary: handleRegenerateSummary,
    updateExecutiveSummaryInReport: handleUpdateExecutiveSummaryInReport,
    saveAndUseSummary: handleSaveAndUseSummary,

    // Threat Intelligence actions
    generateThreatIntelligence: handleGenerateThreatIntelligence,
    updateThreatIntelligenceInReport: handleUpdateThreatIntelligenceInReport,
    saveAndUseThreatIntelligence: handleSaveAndUseThreatIntelligence,

    // Risk Prioritization actions
    generateRiskPrioritization: handleGenerateRiskPrioritization,
    updateRiskPrioritizationInReport: handleUpdateRiskPrioritizationInReport,
    saveAndUseRiskPrioritization: handleSaveAndUseRiskPrioritization,

    // Target Audience actions
    generateTargetAudience: handleGenerateTargetAudience,
    updateTargetAudienceInReport: handleUpdateTargetAudienceInReport,
    saveAndUseTargetAudience: handleSaveAndUseTargetAudience,

    generateReport: handleGenerateReport,
    validateGenerateRequest,
    resetGenerationState,
    clearGenerateError,
    clearGenerateResponse,

    // Utilities
    getSelectedData,
    getSelectionCounts,
    prepareReportData,
    validateReportData,
    validateSummaryGeneration,
    resetForm,
    resetSummaryState,
    resetThreatIntelligenceState,
    resetRiskPrioritizationState,
    resetTargetAudienceState,
    hasExecutiveSummary,
    getExecutiveSummaryPreview,
    hasThreatIntelligence,
    getThreatIntelligencePreview,
    hasRiskPrioritization,
    getRiskPrioritizationPreview,
    hasTargetAudience,
    getTargetAudiencePreview,
    canGenerateSummary,
    getSummaryStats,
    getThreatIntelligenceStats,
    getRiskPrioritizationStats,
    getTargetAudienceStats,
    getSummaryHistory,
    clearSummaryHistory,
    getThreatIntelligenceHistory,
    clearThreatIntelligenceHistory,
    getRiskPrioritizationHistory,
    clearRiskPrioritizationHistory,
    getTargetAudienceHistory,
    clearTargetAudienceHistory,
    clearError,
    clearCreateResponse,
    clearUpdateError,
    clearExecutiveSummary,
    clearSummaryError,
    clearThreatIntelligence,
    clearThreatIntelligenceError,
    clearRiskPrioritization,
    clearRiskPrioritizationError,
    clearTargetAudience,
    clearTargetAudienceError,
    setLoading,
  };
};
