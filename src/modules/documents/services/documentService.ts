// src/modules/documents/services/documentService.ts

import { http } from "@/modules/api/http";
import type {
  PdfIngestion,
  DocumentUploadRequest,
  DocumentUploadResponse,
  ComplianceDomain,
  DocumentTagConstants,
} from "../types";

const ENDPOINTS = {
  INGESTIONS_LIST: "/v1/ingestions",
  INGESTION_BY_ID: (id: string) => `/v1/ingestions/${id}`,
  INGESTIONS_BY_DOMAIN: (domain: string) =>
    `/v1/ingestions/compliance-domain/${domain}`,
  INGESTIONS_BY_VERSION: (version: string) =>
    `/v1/ingestions/version/${version}`,
  INGESTIONS_BY_USER: (userId: string) => `/v1/ingestions/user/${userId}`,
  INGESTIONS_SEARCH: "/v1/ingestions/search",
  INGESTIONS_UPLOAD: "/v1/ingestions/upload",
  TAG_CONSTANTS: "/v1/ingestions/tags/constants",
  COMPLIANCE_DOMAINS: "/v1/compliance-domains",
} as const;

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

class DocumentService {
  async getIngestions(
    params: IngestionListParams = {}
  ): Promise<PdfIngestion[]> {
    const response = await http.get<PdfIngestion[]>(ENDPOINTS.INGESTIONS_LIST, {
      params: {
        skip: params.skip || 0,
        limit: params.limit || 10,
        ...params,
      },
    });
    return response.data;
  }

  async getIngestionById(ingestionId: string): Promise<PdfIngestion> {
    const response = await http.get<PdfIngestion>(
      ENDPOINTS.INGESTION_BY_ID(ingestionId)
    );
    return response.data;
  }

  async getIngestionsByDomain(
    domain: string,
    skip: number = 0,
    limit: number = 50
  ): Promise<PdfIngestion[]> {
    const response = await http.get<PdfIngestion[]>(
      ENDPOINTS.INGESTIONS_BY_DOMAIN(domain),
      {
        params: { skip, limit },
      }
    );
    return response.data;
  }

  async getIngestionsByVersion(
    version: string,
    skip: number = 0,
    limit: number = 10,
    exact_match: boolean = false
  ): Promise<PdfIngestion[]> {
    const response = await http.get<PdfIngestion[]>(
      ENDPOINTS.INGESTIONS_BY_VERSION(version),
      {
        params: { skip, limit, exact_match },
      }
    );
    return response.data;
  }

  async getIngestionsByUser(
    userId: string,
    skip: number = 0,
    limit: number = 50
  ): Promise<PdfIngestion[]> {
    const response = await http.get<PdfIngestion[]>(
      ENDPOINTS.INGESTIONS_BY_USER(userId),
      {
        params: { skip, limit },
      }
    );
    return response.data;
  }

  async searchIngestions(
    searchParams: IngestionListParams
  ): Promise<PdfIngestion[]> {
    const response = await http.get<PdfIngestion[]>(
      ENDPOINTS.INGESTIONS_SEARCH,
      {
        params: searchParams,
      }
    );
    return response.data;
  }

  async uploadDocument(
    uploadData: DocumentUploadRequest,
    onProgress?: (progress: number) => void
  ): Promise<DocumentUploadResponse> {
    const formData = new FormData();
    formData.append("file", uploadData.file);

    if (uploadData.compliance_domain) {
      formData.append("compliance_domain", uploadData.compliance_domain);
    }

    if (uploadData.document_version) {
      formData.append("document_version", uploadData.document_version);
    }

    if (uploadData.document_tags && uploadData.document_tags.length > 0) {
      formData.append("document_tags", uploadData.document_tags.join(","));
    }

    const response = await http.post<DocumentUploadResponse>(
      ENDPOINTS.INGESTIONS_UPLOAD,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onProgress) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(progress);
          }
        },
      }
    );
    return response.data;
  }

  async getComplianceDomains(): Promise<ComplianceDomain[]> {
    const response = await http.get<ComplianceDomain[]>(
      ENDPOINTS.COMPLIANCE_DOMAINS,
      {
        params: { is_active: true, limit: 100 },
      }
    );
    return response.data;
  }

  async getTagConstants(): Promise<DocumentTagConstants> {
    const response = await http.get<DocumentTagConstants>(
      ENDPOINTS.TAG_CONSTANTS
    );
    return response.data;
  }
}

export const documentService = new DocumentService();
