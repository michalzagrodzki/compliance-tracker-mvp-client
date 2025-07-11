/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { auditReportService } from "../services/auditReportService";
import type {
  AuditReportCreate,
  AuditReportResponse,
  AuditReportState,
  AuditReportActions,
  ReportDataSources,
} from "../types";

interface AuditReportStore extends AuditReportState, AuditReportActions {
  // Data sources for report creation
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

  // Core report actions
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

  fetchReports: async (
    userId?: string,
    skip: number = 0,
    limit: number = 10
  ) => {
    set({ isLoading: true, error: null });

    try {
      const reports = userId
        ? await auditReportService.getUserReports(userId, skip, limit)
        : await auditReportService.getAllReports(skip, limit);

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
};
