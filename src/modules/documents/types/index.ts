/* eslint-disable @typescript-eslint/no-explicit-any */
// src/modules/documents/types/index.ts

export interface Document {
  id: string;
  content: string;
  metadata: {
    source_filename?: string;
    chunk_index?: number;
    total_chunks?: number;
    compliance_domain?: string;
    document_version?: string;
    uploaded_by?: string;
    upload_timestamp?: string;
    document_tags?: string[];
    approval_status?: string;
    approved_by?: string;
    file_size?: number;
    file_type?: string;
  };
  similarity?: number;
  created_at: string;
  updated_at: string;
}

export interface DocumentUploadRequest {
  file: File;
  compliance_domain?: string;
  document_version?: string;
  document_tags?: string[];
}

export interface DocumentUploadResponse {
  message: string;
  inserted_count: number;
  ingestion_id: string;
  compliance_domain?: string;
  document_version?: string;
  document_tags?: string[];
}

export interface ComplianceDomain {
  code: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DocumentTagConstants {
  tag_categories: Record<string, string[]>;
  all_tags_with_descriptions: Record<string, string>;
  all_valid_tags: string[];
  reference_document_tags: string[];
  implementation_document_tags: string[];
  usage_examples: Record<
    string,
    {
      tags: string[];
      description: string;
    }
  >;
}

export interface DocumentsState {
  documents: Document[];
  currentDocument: Document | null;
  complianceDomains: ComplianceDomain[];
  tagConstants: DocumentTagConstants | null;
  isLoading: boolean;
  error: string | null;
  uploadProgress: number;
}

export interface DocumentsActions {
  fetchDocuments: (params?: {
    skip?: number;
    limit?: number;
    compliance_domain?: string;
    document_version?: string;
    source_filename?: string;
    document_tags?: string[];
  }) => Promise<void>;
  fetchDocumentById: (documentId: string) => Promise<void>;
  uploadDocument: (
    uploadData: DocumentUploadRequest
  ) => Promise<DocumentUploadResponse>;
  fetchComplianceDomains: () => Promise<void>;
  fetchTagConstants: () => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

export interface PdfIngestion {
  processing_completed_at: any;
  processing_duration_seconds: any;
  id: string;
  filename: string;
  ingested_at: string;
  metadata: Record<string, any>;

  // Compliance-specific fields
  compliance_domain?: string;
  document_version?: string;
  uploaded_by?: string;
  file_size?: number;
  processing_status?: "processing" | "completed" | "failed";
  error_message?: string;
  total_chunks?: number;
  document_tags?: string[];

  file_hash?: string;
  original_path?: string;

  // Standard timestamps (these might be added by your ORM/backend)
  created_at?: string;
  updated_at?: string;
}
