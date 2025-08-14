import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  ComplianceGapResponse,
  ComplianceRecommendationResponse,
} from "../types";
import type { ChatMessage } from "@/modules/chat/types";

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
    sources?: string[];
  } | null;
}

interface ComplianceGapActions {
  setGaps: (gaps: ComplianceGapResponse[]) => void;
  setCurrentGap: (gap: ComplianceGapResponse | null) => void;
  setRelatedChatMessage: (message: ChatMessage | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  setIsGeneratingRecommendation: (generating: boolean) => void;
  setRecommendationError: (error: string | null) => void;
  clearRecommendationError: () => void;
  setLastGeneratedRecommendation: (
    recommendation: ComplianceRecommendationResponse | null
  ) => void;
  openModal: (data: {
    chatHistoryId: string;
    auditSessionId?: string;
    complianceDomain?: string;
    initialMessage?: string;
    sources?: string[];
  }) => void;
  closeModal: () => void;
  clearGaps: () => void;
  clearRelatedChatMessage: () => void;
  addGap: (gap: ComplianceGapResponse) => void;
  updateGapInStore: (gapId: string, updatedGap: ComplianceGapResponse) => void;
  removeGap: (gapId: string) => void;
  filterGaps: (searchTerm: string) => ComplianceGapResponse[];
  filterGapsByStatus: (status: string) => ComplianceGapResponse[];
  filterGapsByRiskLevel: (riskLevel: string) => ComplianceGapResponse[];
}

interface ComplianceGapStore extends ComplianceGapState, ComplianceGapActions {}

export const useComplianceGapStore = create<ComplianceGapStore>()(
  persist(
    (set, get) => ({
      // State
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

      // Actions
      setGaps: (gaps: ComplianceGapResponse[]) => {
        set({ gaps });
      },

      setCurrentGap: (gap: ComplianceGapResponse | null) => {
        set({ currentGap: gap });
      },

      setRelatedChatMessage: (message: ChatMessage | null) => {
        set({ relatedChatMessage: message });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },

      setIsGeneratingRecommendation: (generating: boolean) => {
        set({ isGeneratingRecommendation: generating });
      },

      setRecommendationError: (error: string | null) => {
        set({ recommendationError: error });
      },

      clearRecommendationError: () => {
        set({ recommendationError: null });
      },

      setLastGeneratedRecommendation: (
        recommendation: ComplianceRecommendationResponse | null
      ) => {
        set({ lastGeneratedRecommendation: recommendation });
      },

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

      addGap: (gap: ComplianceGapResponse) => {
        set((state) => ({
          gaps: [gap, ...state.gaps],
        }));
      },

      updateGapInStore: (gapId: string, updatedGap: ComplianceGapResponse) => {
        set((state) => ({
          gaps: state.gaps.map((gap) => (gap.id === gapId ? updatedGap : gap)),
          currentGap:
            state.currentGap?.id === gapId ? updatedGap : state.currentGap,
        }));
      },

      removeGap: (gapId: string) => {
        set((state) => ({
          gaps: state.gaps.filter((gap) => gap.id !== gapId),
          currentGap: state.currentGap?.id === gapId ? null : state.currentGap,
        }));
      },

      filterGaps: (searchTerm: string): ComplianceGapResponse[] => {
        const { gaps } = get();

        if (!searchTerm) {
          return gaps;
        }

        return gaps.filter(
          (gap) =>
            gap.gap_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            gap.gap_description
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            gap.gap_category.toLowerCase().includes(searchTerm.toLowerCase()) ||
            gap.compliance_domain
              .toLowerCase()
              .includes(searchTerm.toLowerCase())
        );
      },

      filterGapsByStatus: (status: string): ComplianceGapResponse[] => {
        const { gaps } = get();

        if (!status) {
          return gaps;
        }

        return gaps.filter((gap) => gap.status === status);
      },

      filterGapsByRiskLevel: (riskLevel: string): ComplianceGapResponse[] => {
        const { gaps } = get();

        if (!riskLevel) {
          return gaps;
        }

        return gaps.filter((gap) => gap.risk_level === riskLevel);
      },
    }),
    {
      name: "compliance-gap-store",
      partialize: (state) => ({
        // Only persist certain state, not temporary data like loading states
        modalData: state.modalData,
      }),
    }
  )
);
