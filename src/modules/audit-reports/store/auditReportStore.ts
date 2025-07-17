/* eslint-disable no-useless-catch */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { auditReportService } from "../services/auditReportService";
import type {
  AuditReportCreate,
  AuditReportResponse,
  AuditReportState,
  AuditReportActions,
  ReportDataSources,
  AuditReport,
  ExecutiveSummaryResponse,
  SummaryTypeValue,
  AuditReportGenerateRequest,
  AuditReportGenerateResponse,
} from "../types";
import { SummaryType } from "../types";
import type { ComplianceGap } from "@/modules/compliance-gaps/types";

interface ExecutiveSummaryState {
  executiveSummary: ExecutiveSummaryResponse | null;
  isGeneratingSummary: boolean;
  summaryError: string | null;
  summaryGenerationHistory: ExecutiveSummaryResponse[];
}

interface ExecutiveSummaryActions {
  generateExecutiveSummary: (
    auditReport: AuditReportCreate,
    complianceGaps: ComplianceGap[],
    summaryType?: SummaryTypeValue,
    customInstructions?: string
  ) => Promise<ExecutiveSummaryResponse>;
  clearExecutiveSummary: () => void;
  clearSummaryError: () => void;
  updateExecutiveSummaryInReport: (
    reportId: string,
    summary: string
  ) => Promise<void>;
  getSummaryHistory: () => ExecutiveSummaryResponse[];
  clearSummaryHistory: () => void;
}

interface AuditReportStore
  extends AuditReportState,
    AuditReportActions,
    ExecutiveSummaryState,
    ExecutiveSummaryActions {
  dataSources: ReportDataSources;

  // Data source actions
  loadSessionDataSources: (sessionId: string) => Promise<void>;
  updateChatSelection: (chatId: number, selected: boolean) => void;
  updateGapSelection: (gapId: string, selected: boolean) => void;
  updateDocumentSelection: (docId: string, selected: boolean) => void;
  selectAllChats: (selected: boolean) => void;
  selectAllGaps: (selected: boolean) => void;
  selectAllDocuments: (selected: boolean) => void;
  clearDataSources: () => void;
}

export const useAuditReportStore = create<AuditReportStore>((set, get) => ({
  // State
  reports: [],
  currentReport: null,
  isLoading: false,
  error: null,
  isCreating: false,
  createResponse: null,
  isUpdating: false,
  updateError: null,
  isGeneratingSummary: false,

  isGenerating: false,
  generateResponse: null,
  generateError: null,

  executiveSummary: null,
  summaryError: null,
  summaryGenerationHistory: [],

  // Data sources state
  dataSources: {
    chatHistory: [],
    complianceGaps: [],
    documents: [],
    isLoadingChats: false,
    isLoadingGaps: false,
    isLoadingDocuments: false,
  },

  // Basic actions
  setLoading: (loading: boolean) => set({ isLoading: loading }),
  clearError: () => set({ error: null }),
  clearCreateResponse: () => set({ createResponse: null }),
  clearUpdateError: () => set({ updateError: null }),

  clearGenerateResponse: () => set({ generateResponse: null }),
  clearGenerateError: () => set({ generateError: null }),

  createReport: async (
    reportData: AuditReportCreate
  ): Promise<AuditReportResponse> => {
    set({ isCreating: true, error: null, createResponse: null });

    try {
      const response = await auditReportService.createReport(reportData);

      set({
        createResponse: response,
        isCreating: false,
        error: response.success
          ? null
          : response.error || "Failed to create report",
      });

      if (response.success && response.report_id) {
        try {
          const newReport = await auditReportService.getReportById(
            response.report_id
          );
          const currentReports = get().reports;
          set({ reports: [newReport, ...currentReports] });
        } catch {
          // Don't fail the creation if we can't fetch the created report
        }
      }

      return response;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail || "Failed to create audit report";
      const errorResponse: AuditReportResponse = {
        success: false,
        message: errorMessage,
        error: errorMessage,
      };

      set({
        error: errorMessage,
        isCreating: false,
        createResponse: errorResponse,
      });

      return errorResponse;
    }
  },

  generateAuditReport: async (
    generateRequest: AuditReportGenerateRequest
  ): Promise<AuditReportGenerateResponse> => {
    set({ isGenerating: true, generateError: null, generateResponse: null });

    try {
      const response = await auditReportService.generateAuditReport(
        generateRequest
      );

      set({
        generateResponse: response,
        isGenerating: false,
        generateError: response.success
          ? null
          : response.error || "Failed to generate report",
      });

      if (response.success) {
        try {
          await get().fetchReports();
        } catch {
          // Don't fail the generation if we can't refresh the list
        }
      }

      return response;
    } catch (error: any) {
      const errorMessage = error.message || "Failed to generate audit report";
      const errorResponse: AuditReportGenerateResponse = {
        success: false,
        message: errorMessage,
        error: errorMessage,
        generation_status: "failed",
      };

      set({
        generateError: errorMessage,
        isGenerating: false,
        generateResponse: errorResponse,
      });

      return errorResponse;
    }
  },
  fetchReports: async (skip: number = 0, limit: number = 10) => {
    set({ isLoading: true, error: null });

    try {
      const reports = await auditReportService.getAllReports(skip, limit);

      set({ reports, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || "Failed to fetch audit reports",
        isLoading: false,
      });
    }
  },

  fetchReportById: async (reportId: string) => {
    set({ isLoading: true, error: null });

    try {
      const report = await auditReportService.getReportById(reportId);
      set({ currentReport: report, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || "Failed to fetch audit report",
        isLoading: false,
      });
    }
  },

  // Data source actions
  loadSessionDataSources: async (sessionId: string) => {
    const currentDataSources = get().dataSources;

    set({
      dataSources: {
        ...currentDataSources,
        isLoadingChats: true,
        isLoadingGaps: true,
        isLoadingDocuments: true,
      },
      error: null,
    });

    try {
      const { chatHistory, complianceGaps, documents } =
        await auditReportService.getSessionDataSources(sessionId);

      set({
        dataSources: {
          chatHistory,
          complianceGaps,
          documents,
          isLoadingChats: false,
          isLoadingGaps: false,
          isLoadingDocuments: false,
        },
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || "Failed to load session data",
        dataSources: {
          chatHistory: [],
          complianceGaps: [],
          documents: [],
          isLoadingChats: false,
          isLoadingGaps: false,
          isLoadingDocuments: false,
        },
      });
    }
  },

  updateReport: async (
    reportId: string,
    updateData: Partial<AuditReport>,
    changeDescription?: string
  ) => {
    set({ isUpdating: true, updateError: null });

    try {
      const updatedReport = await auditReportService.updateReport(
        reportId,
        updateData,
        changeDescription
      );

      // Update the current report if it's the one being edited
      const currentReport = get().currentReport;
      if (currentReport && currentReport.id === reportId) {
        set({ currentReport: updatedReport });
      }

      // Update the report in the reports list
      const reports = get().reports;
      const updatedReports = reports.map((report) =>
        report.id === reportId ? updatedReport : report
      );
      set({ reports: updatedReports });

      set({ isUpdating: false });
    } catch (error: any) {
      set({
        updateError:
          error.response?.data?.detail || "Failed to update audit report",
        isUpdating: false,
      });
      throw error;
    }
  },

  updateChatSelection: (chatId: number, selected: boolean) => {
    const currentDataSources = get().dataSources;
    const updatedChatHistory = currentDataSources.chatHistory.map((chat) =>
      chat.id === chatId ? { ...chat, selected } : chat
    );

    set({
      dataSources: {
        ...currentDataSources,
        chatHistory: updatedChatHistory,
      },
    });
  },

  updateGapSelection: (gapId: string, selected: boolean) => {
    const currentDataSources = get().dataSources;
    const updatedGaps = currentDataSources.complianceGaps.map((gap) =>
      gap.id === gapId ? { ...gap, selected } : gap
    );

    set({
      dataSources: {
        ...currentDataSources,
        complianceGaps: updatedGaps,
      },
    });
  },

  updateDocumentSelection: (docId: string, selected: boolean) => {
    const currentDataSources = get().dataSources;
    const updatedDocuments = currentDataSources.documents.map((doc) =>
      doc.id === docId ? { ...doc, selected } : doc
    );

    set({
      dataSources: {
        ...currentDataSources,
        documents: updatedDocuments,
      },
    });
  },

  selectAllChats: (selected: boolean) => {
    const currentDataSources = get().dataSources;
    const updatedChatHistory = currentDataSources.chatHistory.map((chat) => ({
      ...chat,
      selected,
    }));

    set({
      dataSources: {
        ...currentDataSources,
        chatHistory: updatedChatHistory,
      },
    });
  },

  selectAllGaps: (selected: boolean) => {
    const currentDataSources = get().dataSources;
    const updatedGaps = currentDataSources.complianceGaps.map((gap) => ({
      ...gap,
      selected,
    }));

    set({
      dataSources: {
        ...currentDataSources,
        complianceGaps: updatedGaps,
      },
    });
  },

  selectAllDocuments: (selected: boolean) => {
    const currentDataSources = get().dataSources;
    const updatedDocuments = currentDataSources.documents.map((doc) => ({
      ...doc,
      selected,
    }));

    set({
      dataSources: {
        ...currentDataSources,
        documents: updatedDocuments,
      },
    });
  },

  clearDataSources: () => {
    set({
      dataSources: {
        chatHistory: [],
        complianceGaps: [],
        documents: [],
        isLoadingChats: false,
        isLoadingGaps: false,
        isLoadingDocuments: false,
      },
    });
  },

  generateExecutiveSummary: async (
    auditReport: AuditReportCreate,
    complianceGaps: ComplianceGap[],
    summaryType: SummaryTypeValue = SummaryType.STANDARD
  ): Promise<ExecutiveSummaryResponse> => {
    set({ isGeneratingSummary: true, summaryError: null });

    try {
      const summaryResponse = await auditReportService.createExecutiveSummary(
        auditReport,
        complianceGaps,
        summaryType
      );

      // Add to history
      const currentHistory = get().summaryGenerationHistory;
      const updatedHistory = [summaryResponse, ...currentHistory.slice(0, 4)]; // Keep last 5

      set({
        executiveSummary: summaryResponse,
        summaryGenerationHistory: updatedHistory,
        isGeneratingSummary: false,
      });

      return summaryResponse;
    } catch (error: any) {
      const errorMessage =
        error.message || "Failed to generate executive summary";
      set({
        summaryError: errorMessage,
        isGeneratingSummary: false,
      });
      throw error;
    }
  },

  clearExecutiveSummary: () => {
    set({
      executiveSummary: null,
      summaryError: null,
    });
  },

  clearSummaryError: () => {
    set({ summaryError: null });
  },

  updateExecutiveSummaryInReport: async (
    reportId: string,
    summary: string
  ): Promise<void> => {
    try {
      await get().updateReport(reportId, { executive_summary: summary });
    } catch (error) {
      throw error;
    }
  },

  getSummaryHistory: () => {
    return get().summaryGenerationHistory;
  },

  clearSummaryHistory: () => {
    set({ summaryGenerationHistory: [] });
  },
}));

export const auditReportStoreUtils = {
  getState: () => useAuditReportStore.getState(),
  setState: useAuditReportStore.setState,

  getSelectedData: () => {
    const { dataSources } = useAuditReportStore.getState();

    return {
      selectedChats: dataSources.chatHistory.filter((chat) => chat.selected),
      selectedGaps: dataSources.complianceGaps.filter((gap) => gap.selected),
      selectedDocuments: dataSources.documents.filter((doc) => doc.selected),
    };
  },

  getSelectionCounts: () => {
    const { dataSources } = useAuditReportStore.getState();

    return {
      selectedChatsCount: dataSources.chatHistory.filter(
        (chat) => chat.selected
      ).length,
      totalChatsCount: dataSources.chatHistory.length,
      selectedGapsCount: dataSources.complianceGaps.filter(
        (gap) => gap.selected
      ).length,
      totalGapsCount: dataSources.complianceGaps.length,
      selectedDocumentsCount: dataSources.documents.filter(
        (doc) => doc.selected
      ).length,
      totalDocumentsCount: dataSources.documents.length,
    };
  },

  // Executive Summary utilities
  hasExecutiveSummary: () => {
    const { executiveSummary } = useAuditReportStore.getState();
    return executiveSummary !== null;
  },

  getExecutiveSummaryPreview: (maxLength: number = 200) => {
    const { executiveSummary } = useAuditReportStore.getState();
    if (!executiveSummary?.executive_summary) return null;

    const summary = executiveSummary.executive_summary;
    return summary.length > maxLength
      ? summary.substring(0, maxLength) + "..."
      : summary;
  },

  getComplianceGapsForSummary: () => {
    const { dataSources } = useAuditReportStore.getState();
    return dataSources.complianceGaps
      .filter((gap) => gap.selected)
      .map((gap) => ({
        id: gap.id,
        gap_type: gap.gap_type,
        gap_category: gap.gap_category,
        gap_title: gap.gap_title,
        gap_description: gap.gap_description,
        risk_level: gap.risk_level,
        business_impact: gap.business_impact,
        regulatory_requirement: gap.regulatory_requirement || false,
        potential_fine_amount: gap.potential_fine_amount,
        recommendation_text: gap.recommendation_text,
        recommended_actions: gap.recommended_actions,
        confidence_score: gap.confidence_score,
        detection_method: gap.detection_method,
        false_positive_likelihood: gap.false_positive_likelihood,
        // Add required fields for ComplianceGap type
        user_id: "", // Will be populated by backend
        audit_session_id: "", // Will be populated by backend
        compliance_domain: "", // Will be populated by backend
        original_question: "", // Will be populated by backend
        status: "identified" as const,
        auto_generated: true,
        detected_at: gap.detected_at,
        created_at: gap.detected_at,
        updated_at: gap.detected_at,
      }));
  },
};
