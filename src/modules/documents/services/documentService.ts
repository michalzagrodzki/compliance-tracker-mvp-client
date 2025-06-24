// src/modules/documents/services/documentService.ts

import { http } from "@/modules/api/http";
import type {
  PdfIngestion,
  DocumentUploadRequest,
  DocumentUploadResponse,
  ComplianceDomain,
  DocumentTagConstants,
  ExtractedDocumentInfo,
  PdfMetadata,
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

    if (uploadData.document_title) {
      formData.append("document_title", uploadData.document_title);
    }

    if (uploadData.document_author) {
      formData.append("document_author", uploadData.document_author);
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

  async extractPdfMetadata(file: File): Promise<ExtractedDocumentInfo> {
    try {
      // Use a lightweight PDF metadata extraction library
      // For now, we'll simulate metadata extraction
      const metadata = await this.extractMetadataFromPdf(file);

      return {
        title: metadata.title || this.generateTitleFromFilename(file.name),
        author: metadata.author,
        hasMetadata: !!(metadata.title || metadata.author),
        filename: file.name,
      };
    } catch (error) {
      console.warn("Failed to extract PDF metadata:", error);

      // Fallback to filename-based title
      return {
        title: this.generateTitleFromFilename(file.name),
        author: undefined,
        hasMetadata: false,
        filename: file.name,
      };
    }
  }

  private async extractMetadataFromPdf(file: File): Promise<PdfMetadata> {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();

      fileReader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const uint8Array = new Uint8Array(arrayBuffer);

          // Simple PDF metadata extraction
          // Look for common PDF metadata patterns
          const text = new TextDecoder("latin1").decode(uint8Array);

          const metadata: PdfMetadata = {};

          // Extract title
          const titleMatch = text.match(/\/Title\s*\(([^)]+)\)/);
          if (titleMatch) {
            metadata.title = this.cleanPdfString(titleMatch[1]);
          }

          const authorMatch = text.match(/\/Author\s*\(([^)]+)\)/);
          if (authorMatch) {
            metadata.author = this.cleanPdfString(authorMatch[1]);
          }

          const creatorMatch = text.match(/\/Creator\s*\(([^)]+)\)/);
          if (creatorMatch && !metadata.author) {
            metadata.author = this.cleanPdfString(creatorMatch[1]);
          }

          const subjectMatch = text.match(/\/Subject\s*\(([^)]+)\)/);
          if (subjectMatch) {
            metadata.subject = this.cleanPdfString(subjectMatch[1]);
          }

          resolve(metadata);
        } catch (error) {
          reject(error);
        }
      };

      fileReader.onerror = () => reject(new Error("Failed to read file"));
      fileReader.readAsArrayBuffer(file.slice(0, 10000));
    });
  }

  private cleanPdfString(str: string): string {
    return str
      .replace(/\\[0-7]{3}/g, "")
      .replace(/\\./g, "")
      .replace(/^\xFE\xFF/, "")
      .replace(/[^\x20-\x7E]/g, "")
      .trim();
  }

  private generateTitleFromFilename(filename: string): string {
    const name = filename.replace(/\.[^/.]+$/, "");
    let title = name.replace(/[_-]/g, " ");
    title = title.replace(/\b\w/g, (l) => l.toUpperCase());
    title = title.replace(/\s+/g, " ").trim();

    return title;
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
