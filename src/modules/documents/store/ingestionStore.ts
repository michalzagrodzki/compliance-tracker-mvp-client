import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  PdfIngestion,
  ComplianceDomain,
  DocumentTagConstants,
  ExtractedDocumentInfo,
} from "../types";

interface IngestionState {
  ingestions: PdfIngestion[];
  currentIngestion: PdfIngestion | null;
  complianceDomains: ComplianceDomain[];
  tagConstants: DocumentTagConstants | null;
  isLoading: boolean;
  error: string | null;
  uploadProgress: number;
  extractedMetadata: ExtractedDocumentInfo | null;
  isExtractingMetadata: boolean;
}

interface IngestionActions {
  setIngestions: (ingestions: PdfIngestion[]) => void;
  setCurrentIngestion: (ingestion: PdfIngestion | null) => void;
  setComplianceDomains: (domains: ComplianceDomain[]) => void;
  setTagConstants: (constants: DocumentTagConstants | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  setUploadProgress: (progress: number) => void;
  setExtractedMetadata: (metadata: ExtractedDocumentInfo | null) => void;
  clearExtractedMetadata: () => void;
  setIsExtractingMetadata: (extracting: boolean) => void;
  filterIngestions: (searchTerm: string) => PdfIngestion[];
}

interface IngestionStore extends IngestionState, IngestionActions {}

export const useIngestionStore = create<IngestionStore>()(
  persist(
    (set, get) => ({
      // State
      ingestions: [],
      currentIngestion: null,
      complianceDomains: [],
      tagConstants: null,
      isLoading: false,
      error: null,
      uploadProgress: 0,
      extractedMetadata: null,
      isExtractingMetadata: false,

      // Actions
      setIngestions: (ingestions: PdfIngestion[]) => {
        set({ ingestions });
      },

      setCurrentIngestion: (ingestion: PdfIngestion | null) => {
        set({ currentIngestion: ingestion });
      },

      setComplianceDomains: (domains: ComplianceDomain[]) => {
        set({ complianceDomains: domains });
      },

      setTagConstants: (constants: DocumentTagConstants | null) => {
        set({ tagConstants: constants });
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

      setUploadProgress: (progress: number) => {
        set({ uploadProgress: progress });
      },

      setExtractedMetadata: (metadata: ExtractedDocumentInfo | null) => {
        set({ extractedMetadata: metadata });
      },

      clearExtractedMetadata: () => {
        set({ extractedMetadata: null });
      },

      setIsExtractingMetadata: (extracting: boolean) => {
        set({ isExtractingMetadata: extracting });
      },

      filterIngestions: (searchTerm: string): PdfIngestion[] => {
        const { ingestions } = get();

        if (!searchTerm) {
          return ingestions;
        }

        return ingestions.filter(
          (doc) =>
            doc.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.document_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.document_author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.document_tags?.some((tag) =>
              tag.toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
      },
    }),
    {
      name: "ingestion-store",
      partialize: (state) => ({
        complianceDomains: state.complianceDomains,
        tagConstants: state.tagConstants,
      }),
    }
  )
);