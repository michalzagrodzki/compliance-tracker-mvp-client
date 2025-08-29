import { create } from "zustand";
import type {
  AuditReportResponse,
  AuditReportState,
  ReportDataSources,
  AuditReport,
  ExecutiveSummaryResponse,
  ThreatIntelligenceResponse,
  RiskPrioritizationResponse,
  TargetAudienceResponse,
  AuditReportGenerateResponse,
  AuditReportRecommendation,
  AuditReportActionItem,
} from "../types";

interface ExecutiveSummaryState {
  executiveSummary: ExecutiveSummaryResponse | null;
  isGeneratingSummary: boolean;
  summaryError: string | null;
  summaryGenerationHistory: ExecutiveSummaryResponse[];
}

interface ThreatIntelligenceState {
  threatIntelligence: ThreatIntelligenceResponse | null;
  isGeneratingThreatIntelligence: boolean;
  threatIntelligenceError: string | null;
  threatIntelligenceGenerationHistory: ThreatIntelligenceResponse[];
}

interface RiskPrioritizationState {
  riskPrioritization: RiskPrioritizationResponse | null;
  isGeneratingRiskPrioritization: boolean;
  riskPrioritizationError: string | null;
  riskPrioritizationGenerationHistory: RiskPrioritizationResponse[];
}

interface TargetAudienceState {
  targetAudience: TargetAudienceResponse | null;
  isGeneratingTargetAudience: boolean;
  targetAudienceError: string | null;
  targetAudienceGenerationHistory: TargetAudienceResponse[];
}

interface RecommendationsState {
  recommendations: AuditReportRecommendation | null;
  isGeneratingRecommendations: boolean;
  recommendationsError: string | null;
}

interface ActionItemsState {
  actionItems: AuditReportActionItem | null;
  isGeneratingActionItems: boolean;
  actionItemsError: string | null;
}

interface AuditReportStore
  extends AuditReportState,
    ExecutiveSummaryState,
    ThreatIntelligenceState,
    RiskPrioritizationState,
    TargetAudienceState,
    RecommendationsState,
    ActionItemsState {
  dataSources: ReportDataSources;

  // Selection actions (pure state updates)
  updateChatSelection: (chatId: number, selected: boolean) => void;
  updateGapSelection: (gapId: string, selected: boolean) => void;
  updateDocumentSelection: (docId: string, selected: boolean) => void;
  selectAllChats: (selected: boolean) => void;
  selectAllGaps: (selected: boolean) => void;
  selectAllDocuments: (selected: boolean) => void;
  clearDataSources: () => void;

  // State-only setter interfaces (used by hooks)
  setLoading: (loading: boolean) => void;
  clearError: () => void;
  setError: (error: string | null) => void;
  setReports: (reports: AuditReport[]) => void;
  setCurrentReport: (report: AuditReport | null) => void;
  setIsCreating: (creating: boolean) => void;
  setCreateResponse: (resp: AuditReportResponse | null) => void;
  clearCreateResponse: () => void;
  setIsUpdating: (updating: boolean) => void;
  setUpdateError: (msg: string | null) => void;
  clearUpdateError: () => void;
  setIsGenerating: (generating: boolean) => void;
  setGenerateError: (msg: string | null) => void;
  setGenerateResponse: (resp: AuditReportGenerateResponse | null) => void;
  clearGenerateResponse: () => void;
  clearGenerateError: () => void;
  setDataSourcesLoading: (
    flags: Partial<{
      isLoadingChats: boolean;
      isLoadingGaps: boolean;
      isLoadingDocuments: boolean;
    }>
  ) => void;
  setDataSources: (data: {
    chatHistory: ReportDataSources["chatHistory"];
    complianceGaps: ReportDataSources["complianceGaps"];
    documents: ReportDataSources["documents"];
  }) => void;
  setIsGeneratingSummary: (generating: boolean) => void;
  setExecutiveSummary: (summary: ExecutiveSummaryResponse | null) => void;
  setSummaryError: (msg: string | null) => void;
  addSummaryHistory: (item: ExecutiveSummaryResponse) => void;
  clearExecutiveSummary: () => void;
  clearSummaryError: () => void;
  getSummaryHistory: () => ExecutiveSummaryResponse[];
  clearSummaryHistory: () => void;
  setIsGeneratingThreatIntelligence: (generating: boolean) => void;
  setThreatIntelligence: (ti: ThreatIntelligenceResponse | null) => void;
  setThreatIntelligenceError: (msg: string | null) => void;
  addThreatIntelligenceHistory: (item: ThreatIntelligenceResponse) => void;
  clearThreatIntelligence: () => void;
  clearThreatIntelligenceError: () => void;
  getThreatIntelligenceHistory: () => ThreatIntelligenceResponse[];
  clearThreatIntelligenceHistory: () => void;
  setIsGeneratingRiskPrioritization: (generating: boolean) => void;
  setRiskPrioritization: (rp: RiskPrioritizationResponse | null) => void;
  setRiskPrioritizationError: (msg: string | null) => void;
  addRiskPrioritizationHistory: (item: RiskPrioritizationResponse) => void;
  clearRiskPrioritization: () => void;
  clearRiskPrioritizationError: () => void;
  getRiskPrioritizationHistory: () => RiskPrioritizationResponse[];
  clearRiskPrioritizationHistory: () => void;
  setIsGeneratingTargetAudience: (generating: boolean) => void;
  setTargetAudience: (ta: TargetAudienceResponse | null) => void;
  setTargetAudienceError: (msg: string | null) => void;
  addTargetAudienceHistory: (item: TargetAudienceResponse) => void;
  clearTargetAudience: () => void;
  clearTargetAudienceError: () => void;
  getTargetAudienceHistory: () => TargetAudienceResponse[];
  clearTargetAudienceHistory: () => void;
  setIsGeneratingRecommendations: (generating: boolean) => void;
  setRecommendations: (recommendations: AuditReportRecommendation | null) => void;
  setRecommendationsError: (msg: string | null) => void;
  clearRecommendations: () => void;
  clearRecommendationsError: () => void;
  setIsGeneratingActionItems: (generating: boolean) => void;
  setActionItems: (actionItems: AuditReportActionItem | null) => void;
  setActionItemsError: (msg: string | null) => void;
  clearActionItems: () => void;
  clearActionItemsError: () => void;
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

  // Executive Summary state
  executiveSummary: null,
  summaryError: null,
  summaryGenerationHistory: [],

  // Threat Intelligence state
  threatIntelligence: null,
  isGeneratingThreatIntelligence: false,
  threatIntelligenceError: null,
  threatIntelligenceGenerationHistory: [],

  // Risk Prioritization state
  riskPrioritization: null,
  isGeneratingRiskPrioritization: false,
  riskPrioritizationError: null,
  riskPrioritizationGenerationHistory: [],

  // Target Audience state
  targetAudience: null,
  isGeneratingTargetAudience: false,
  targetAudienceError: null,
  targetAudienceGenerationHistory: [],

  // Recommendations state
  recommendations: null,
  isGeneratingRecommendations: false,
  recommendationsError: null,

  // Action Items state
  actionItems: null,
  isGeneratingActionItems: false,
  actionItemsError: null,

  // Data sources state
  dataSources: {
    chatHistory: [],
    complianceGaps: [],
    documents: [],
    isLoadingChats: false,
    isLoadingGaps: false,
    isLoadingDocuments: false,
  },

  setLoading: (loading: boolean) => set({ isLoading: loading }),
  setError: (error: string | null) => set({ error }),
  clearError: () => set({ error: null }),
  setReports: (reports: AuditReport[]) => set({ reports }),
  setCurrentReport: (report: AuditReport | null) =>
    set({ currentReport: report }),
  clearCreateResponse: () => set({ createResponse: null }),
  clearUpdateError: () => set({ updateError: null }),

  clearGenerateResponse: () => set({ generateResponse: null }),
  clearGenerateError: () => set({ generateError: null }),

  setIsCreating: (creating: boolean) => set({ isCreating: creating }),
  setCreateResponse: (resp: AuditReportResponse | null) =>
    set({ createResponse: resp }),
  setIsUpdating: (updating: boolean) => set({ isUpdating: updating }),
  setUpdateError: (msg: string | null) => set({ updateError: msg }),
  setIsGenerating: (generating: boolean) => set({ isGenerating: generating }),
  setGenerateError: (msg: string | null) => set({ generateError: msg }),
  setGenerateResponse: (resp: AuditReportGenerateResponse | null) =>
    set({ generateResponse: resp }),

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

  setDataSourcesLoading: (flags) =>
    set({
      dataSources: { ...get().dataSources, ...flags } as ReportDataSources,
    }),
  setDataSources: ({ chatHistory, complianceGaps, documents }) =>
    set({
      dataSources: {
        chatHistory,
        complianceGaps,
        documents,
        isLoadingChats: false,
        isLoadingGaps: false,
        isLoadingDocuments: false,
      },
    }),
  clearExecutiveSummary: () =>
    set({ executiveSummary: null, summaryError: null }),
  clearSummaryError: () => set({ summaryError: null }),
  getSummaryHistory: () => get().summaryGenerationHistory,
  clearSummaryHistory: () => set({ summaryGenerationHistory: [] }),

  setIsGeneratingSummary: (generating: boolean) =>
    set({ isGeneratingSummary: generating }),
  setExecutiveSummary: (summary: ExecutiveSummaryResponse | null) =>
    set({ executiveSummary: summary }),
  setSummaryError: (msg: string | null) => set({ summaryError: msg }),
  addSummaryHistory: (item: ExecutiveSummaryResponse) => {
    const current = get().summaryGenerationHistory;
    set({ summaryGenerationHistory: [item, ...current.slice(0, 4)] });
  },

  clearThreatIntelligence: () =>
    set({ threatIntelligence: null, threatIntelligenceError: null }),
  clearThreatIntelligenceError: () => set({ threatIntelligenceError: null }),
  getThreatIntelligenceHistory: () => get().threatIntelligenceGenerationHistory,
  clearThreatIntelligenceHistory: () =>
    set({ threatIntelligenceGenerationHistory: [] }),

  setIsGeneratingThreatIntelligence: (generating: boolean) =>
    set({ isGeneratingThreatIntelligence: generating }),
  setThreatIntelligence: (ti: ThreatIntelligenceResponse | null) =>
    set({ threatIntelligence: ti }),
  setThreatIntelligenceError: (msg: string | null) =>
    set({ threatIntelligenceError: msg }),
  addThreatIntelligenceHistory: (item: ThreatIntelligenceResponse) => {
    const current = get().threatIntelligenceGenerationHistory;
    set({
      threatIntelligenceGenerationHistory: [item, ...current.slice(0, 4)],
    });
  },

  clearRiskPrioritization: () =>
    set({ riskPrioritization: null, riskPrioritizationError: null }),
  clearRiskPrioritizationError: () => set({ riskPrioritizationError: null }),
  getRiskPrioritizationHistory: () => get().riskPrioritizationGenerationHistory,
  clearRiskPrioritizationHistory: () =>
    set({ riskPrioritizationGenerationHistory: [] }),

  setIsGeneratingRiskPrioritization: (generating: boolean) =>
    set({ isGeneratingRiskPrioritization: generating }),
  setRiskPrioritization: (rp: RiskPrioritizationResponse | null) =>
    set({ riskPrioritization: rp }),
  setRiskPrioritizationError: (msg: string | null) =>
    set({ riskPrioritizationError: msg }),
  addRiskPrioritizationHistory: (item: RiskPrioritizationResponse) => {
    const current = get().riskPrioritizationGenerationHistory;
    set({
      riskPrioritizationGenerationHistory: [item, ...current.slice(0, 4)],
    });
  },

  clearTargetAudience: () =>
    set({ targetAudience: null, targetAudienceError: null }),
  clearTargetAudienceError: () => set({ targetAudienceError: null }),
  getTargetAudienceHistory: () => get().targetAudienceGenerationHistory,
  clearTargetAudienceHistory: () =>
    set({ targetAudienceGenerationHistory: [] }),

  setIsGeneratingTargetAudience: (generating: boolean) =>
    set({ isGeneratingTargetAudience: generating }),
  setTargetAudience: (ta: TargetAudienceResponse | null) =>
    set({ targetAudience: ta }),
  setTargetAudienceError: (msg: string | null) =>
    set({ targetAudienceError: msg }),
  addTargetAudienceHistory: (item: TargetAudienceResponse) => {
    const current = get().targetAudienceGenerationHistory;
    set({ targetAudienceGenerationHistory: [item, ...current.slice(0, 4)] });
  },

  // Recommendations actions
  setIsGeneratingRecommendations: (generating: boolean) =>
    set({ isGeneratingRecommendations: generating }),
  setRecommendations: (recommendations: AuditReportRecommendation | null) =>
    set({ recommendations }),
  setRecommendationsError: (msg: string | null) =>
    set({ recommendationsError: msg }),
  clearRecommendations: () =>
    set({ recommendations: null, recommendationsError: null }),
  clearRecommendationsError: () => set({ recommendationsError: null }),

  // Action Items actions
  setIsGeneratingActionItems: (generating: boolean) =>
    set({ isGeneratingActionItems: generating }),
  setActionItems: (actionItems: AuditReportActionItem | null) =>
    set({ actionItems }),
  setActionItemsError: (msg: string | null) =>
    set({ actionItemsError: msg }),
  clearActionItems: () =>
    set({ actionItems: null, actionItemsError: null }),
  clearActionItemsError: () => set({ actionItemsError: null }),
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

  // Threat Intelligence utilities
  hasThreatIntelligence: () => {
    const { threatIntelligence } = useAuditReportStore.getState();
    return threatIntelligence !== null;
  },

  getThreatIntelligencePreview: (maxLength: number = 200) => {
    const { threatIntelligence } = useAuditReportStore.getState();
    if (!threatIntelligence?.threat_analysis) return null;

    const analysis = threatIntelligence.threat_analysis;
    return analysis.length > maxLength
      ? analysis.substring(0, maxLength) + "..."
      : analysis;
  },

  // Risk Prioritization utilities
  hasRiskPrioritization: () => {
    const { riskPrioritization } = useAuditReportStore.getState();
    return riskPrioritization !== null;
  },

  getRiskPrioritizationPreview: (maxLength: number = 200) => {
    const { riskPrioritization } = useAuditReportStore.getState();
    if (!riskPrioritization?.risk_prioritization_analysis) return null;

    const prioritization = riskPrioritization.risk_prioritization_analysis;
    return prioritization.length > maxLength
      ? prioritization.substring(0, maxLength) + "..."
      : prioritization;
  },

  // Target Audience utilities
  hasTargetAudience: () => {
    const { targetAudience } = useAuditReportStore.getState();
    return targetAudience !== null;
  },

  getTargetAudiencePreview: (maxLength: number = 200) => {
    const { targetAudience } = useAuditReportStore.getState();
    if (!targetAudience?.target_audience_summary) return null;

    const summary = targetAudience.target_audience_summary;
    return summary.length > maxLength
      ? summary.substring(0, maxLength) + "..."
      : summary;
  },

  // Recommendations utilities
  hasRecommendations: () => {
    const { recommendations } = useAuditReportStore.getState();
    return recommendations !== null;
  },

  getRecommendationsPreview: (maxLength: number = 200) => {
    const { recommendations } = useAuditReportStore.getState();
    if (!recommendations?.recommendations) return null;

    const recs = recommendations.recommendations;
    return recs.length > maxLength
      ? recs.substring(0, maxLength) + "..."
      : recs;
  },

  // Action Items utilities
  hasActionItems: () => {
    const { actionItems } = useAuditReportStore.getState();
    return actionItems !== null;
  },

  getActionItemsPreview: (maxLength: number = 200) => {
    const { actionItems } = useAuditReportStore.getState();
    if (!actionItems?.action_items) return null;

    const items = actionItems.action_items;
    return items.length > maxLength
      ? items.substring(0, maxLength) + "..."
      : items;
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
