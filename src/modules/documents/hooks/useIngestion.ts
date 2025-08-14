import { useCallback } from "react";
import { documentService } from "../services/documentService";
import { useIngestionStore } from "../store/ingestionStore";
import { normalizeError } from "@/lib/error";
import type {
  DocumentUploadRequest,
  DocumentUploadResponse,
  ExtractedDocumentInfo,
} from "../types";

interface IngestionListParams {
  skip?: number;
  limit?: number;
  compliance_domain?: string;
  document_version?: string;
  processing_status?: string;
  filename_search?: string;
  document_tags?: string[];
  tags_match_mode?: string;
  uploaded_by?: string;
  ingested_after?: string;
  ingested_before?: string;
}

export const useIngestion = () => {
  const {
    ingestions,
    currentIngestion,
    complianceDomains,
    tagConstants,
    isLoading,
    error,
    uploadProgress,
    extractedMetadata,
    isExtractingMetadata,
    setIngestions,
    setCurrentIngestion,
    setComplianceDomains,
    setTagConstants,
    setLoading,
    setError,
    clearError,
    setUploadProgress,
    setExtractedMetadata,
    clearExtractedMetadata,
    setIsExtractingMetadata,
    filterIngestions,
  } = useIngestionStore();

  const fetchIngestions = useCallback(
    async (params: IngestionListParams = {}) => {
      setLoading(true);
      clearError();

      try {
        const ingestions = await documentService.getIngestions(params);
        setIngestions(ingestions);
      } catch (error) {
        const normalizedError = normalizeError(error);
        setError(normalizedError.message || "Failed to fetch ingestions");
      } finally {
        setLoading(false);
      }
    },
    [setLoading, clearError, setIngestions, setError]
  );

  const fetchIngestionById = useCallback(
    async (ingestionId: string) => {
      setLoading(true);
      clearError();

      try {
        const ingestion = await documentService.getIngestionById(ingestionId);
        setCurrentIngestion(ingestion);
      } catch (error) {
        const normalizedError = normalizeError(error);
        setError(normalizedError.message || "Failed to fetch ingestion");
      } finally {
        setLoading(false);
      }
    },
    [setLoading, clearError, setCurrentIngestion, setError]
  );

  const uploadDocument = useCallback(
    async (uploadData: DocumentUploadRequest): Promise<DocumentUploadResponse> => {
      setLoading(true);
      clearError();
      setUploadProgress(0);

      try {
        const response = await documentService.uploadDocument(
          uploadData,
          (progress) => {
            setUploadProgress(progress);
          }
        );

        setUploadProgress(100);

        // Refresh ingestions if we have data
        if (ingestions.length > 0) {
          await fetchIngestions();
        }

        return response;
      } catch (error) {
        const normalizedError = normalizeError(error);
        setError(normalizedError.message || "Failed to upload document");
        setUploadProgress(0);
        throw normalizedError;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, clearError, setUploadProgress, ingestions, fetchIngestions, setError]
  );

  const extractPdfMetadata = useCallback(
    async (file: File): Promise<ExtractedDocumentInfo> => {
      setIsExtractingMetadata(true);
      clearError();

      try {
        const extractedInfo = await documentService.extractPdfMetadata(file);
        setExtractedMetadata(extractedInfo);
        return extractedInfo;
      } catch (error) {
        normalizeError(error);
        setError("Failed to extract PDF metadata");
        
        // Return fallback metadata
        const fallbackInfo: ExtractedDocumentInfo = {
          title: file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " "),
          author: undefined,
          hasMetadata: false,
          filename: file.name,
        };
        setExtractedMetadata(fallbackInfo);
        return fallbackInfo;
      } finally {
        setIsExtractingMetadata(false);
      }
    },
    [setIsExtractingMetadata, clearError, setExtractedMetadata, setError]
  );

  const fetchComplianceDomains = useCallback(async () => {
    try {
      const domains = await documentService.getComplianceDomains();
      setComplianceDomains(domains);
    } catch (error) {
      const normalizedError = normalizeError(error);
      console.error("Failed to fetch compliance domains:", normalizedError.message);
    }
  }, [setComplianceDomains]);

  const fetchTagConstants = useCallback(async () => {
    try {
      const tagConstants = await documentService.getTagConstants();
      setTagConstants(tagConstants);
    } catch (error) {
      const normalizedError = normalizeError(error);
      console.error("Failed to fetch tag constants:", normalizedError.message);
    }
  }, [setTagConstants]);

  const searchIngestions = useCallback(
    async (searchParams: IngestionListParams) => {
      setLoading(true);
      clearError();

      try {
        const ingestions = await documentService.searchIngestions(searchParams);
        setIngestions(ingestions);
      } catch (error) {
        const normalizedError = normalizeError(error);
        setError(normalizedError.message || "Failed to search ingestions");
      } finally {
        setLoading(false);
      }
    },
    [setLoading, clearError, setIngestions, setError]
  );

  return {
    // State
    ingestions,
    currentIngestion,
    complianceDomains,
    tagConstants,
    isLoading,
    error,
    uploadProgress,
    extractedMetadata,
    isExtractingMetadata,

    // Actions
    fetchIngestions,
    fetchIngestionById,
    uploadDocument,
    extractPdfMetadata,
    fetchComplianceDomains,
    fetchTagConstants,
    searchIngestions,
    clearError,
    clearExtractedMetadata,
    filterIngestions,
  };
};