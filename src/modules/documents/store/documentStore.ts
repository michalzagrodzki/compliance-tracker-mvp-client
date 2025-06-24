/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { documentService } from "../services/documentService";
import type {
  DocumentUploadRequest,
  DocumentUploadResponse,
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
  setLoading: (loading: boolean) => void;
  clearError: () => void;
  fetchIngestions: (params?: any) => Promise<void>;
  fetchIngestionById: (ingestionId: string) => Promise<void>;
  uploadDocument: (
    uploadData: DocumentUploadRequest
  ) => Promise<DocumentUploadResponse>;
  fetchComplianceDomains: () => Promise<void>;
  fetchTagConstants: () => Promise<void>;
  searchIngestions: (searchParams: any) => Promise<void>;
  extractPdfMetadata: (file: File) => Promise<ExtractedDocumentInfo>;
  clearExtractedMetadata: () => void;
}

interface IngestionStore extends IngestionState, IngestionActions {}

export const useIngestionStore = create<IngestionStore>((set, get) => ({
  ingestions: [],
  currentIngestion: null,
  complianceDomains: [],
  tagConstants: null,
  isLoading: false,
  error: null,
  uploadProgress: 0,
  extractedMetadata: null,
  isExtractingMetadata: false,

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  clearError: () => {
    set({ error: null });
  },

  clearExtractedMetadata: () => {
    set({ extractedMetadata: null });
  },

  fetchIngestions: async (params = {}) => {
    set({ isLoading: true, error: null });

    try {
      const ingestions = await documentService.getIngestions(params);
      set({ ingestions, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || "Failed to fetch ingestions",
        isLoading: false,
      });
    }
  },

  fetchIngestionById: async (ingestionId: string) => {
    set({ isLoading: true, error: null });

    try {
      const ingestion = await documentService.getIngestionById(ingestionId);
      set({ currentIngestion: ingestion, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || "Failed to fetch ingestion",
        isLoading: false,
      });
    }
  },

  uploadDocument: async (
    uploadData: DocumentUploadRequest
  ): Promise<DocumentUploadResponse> => {
    set({ isLoading: true, error: null, uploadProgress: 0 });

    try {
      const response = await documentService.uploadDocument(
        uploadData,
        (progress) => {
          set({ uploadProgress: progress });
        }
      );

      set({
        isLoading: false,
        uploadProgress: 100,
        error: null,
      });

      const currentState = get();
      if (currentState.ingestions.length > 0) {
        await get().fetchIngestions();
      }

      return response;
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || "Failed to upload document",
        isLoading: false,
        uploadProgress: 0,
      });
      throw error;
    }
  },

  extractPdfMetadata: async (file: File): Promise<ExtractedDocumentInfo> => {
    set({ isExtractingMetadata: true, error: null });

    try {
      const extractedInfo = await documentService.extractPdfMetadata(file);
      set({
        extractedMetadata: extractedInfo,
        isExtractingMetadata: false,
      });
      return extractedInfo;
    } catch (error: any) {
      set({
        error: "Failed to extract PDF metadata",
        isExtractingMetadata: false,
      });
      // Return fallback metadata
      const fallbackInfo: ExtractedDocumentInfo = {
        title: file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " "),
        author: undefined,
        hasMetadata: false,
        filename: file.name,
      };
      set({ extractedMetadata: fallbackInfo });
      return fallbackInfo;
    }
  },

  fetchComplianceDomains: async () => {
    try {
      const domains = await documentService.getComplianceDomains();
      set({ complianceDomains: domains });
    } catch (error: any) {
      console.error("Failed to fetch compliance domains:", error);
    }
  },

  fetchTagConstants: async () => {
    try {
      const tagConstants = await documentService.getTagConstants();
      set({ tagConstants });
    } catch (error: any) {
      console.error("Failed to fetch tag constants:", error);
    }
  },

  searchIngestions: async (searchParams: any) => {
    set({ isLoading: true, error: null });

    try {
      const ingestions = await documentService.searchIngestions(searchParams);
      set({ ingestions, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || "Failed to search ingestions",
        isLoading: false,
      });
    }
  },
}));
