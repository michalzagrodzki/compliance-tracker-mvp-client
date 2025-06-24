/* eslint-disable @typescript-eslint/no-explicit-any */
export interface PdfIngestion {
  processing_duration_seconds: any;
  processing_completed_at: any;
  id: string;
  filename: string; // Changed from source_filename to match DB schema
  ingested_at: string;
  metadata: Record<string, any>; // JSON field from DB

  // Compliance-specific fields
  compliance_domain?: string;
  document_version?: string;
  uploaded_by?: string;
  file_size?: number; // BIGINT in DB
  processing_status?: "processing" | "completed" | "failed";
  error_message?: string; // Changed from processing_error to match DB
  total_chunks?: number;
  document_tags?: string[]; // TEXT[] in DB

  // File integrity fields
  file_hash?: string; // SHA-256 hash
  original_path?: string;

  // Standard timestamps (these might be added by your ORM/backend)
  created_at?: string;
  updated_at?: string;
}

export interface Document {
  id: string;
  content: string;
  metadata: DocumentMetadata;
  created_at: string;
  updated_at: string;
}

export interface DocumentMetadata {
  source_filename: string;
  chunk_index?: number;
  total_chunks?: number;
  file_type?: string;
  file_size?: number;
  compliance_domain?: string;
  document_version?: string;
  document_tags?: string[];
  uploaded_by?: string;
  approved_by?: string;
  approval_status?: "approved" | "pending" | "rejected";
  upload_timestamp?: string;
  similarity?: number;
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
  tag_categories: Record<string, string[] | Record<string, string>>; // Can be either array of strings or object with descriptions
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

// Store interfaces
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
  setLoading: (loading: boolean) => void;
  clearError: () => void;
  fetchDocuments: (params?: any) => Promise<void>;
  fetchDocumentById: (documentId: string) => Promise<void>;
  uploadDocument: (
    uploadData: DocumentUploadRequest
  ) => Promise<DocumentUploadResponse>;
  fetchComplianceDomains: () => Promise<void>;
  fetchTagConstants: () => Promise<void>;
}

// Search and filter interfaces
export interface DocumentSearchParams {
  skip?: number;
  limit?: number;
  compliance_domain?: string;
  document_version?: string;
  source_filename?: string;
  document_tags?: string[];
  tags_match_mode?: "any" | "all" | "exact";
  approval_status?: string;
  uploaded_by?: string;
  approved_by?: string;
}

export interface IngestionSearchParams {
  skip?: number;
  limit?: number;
  compliance_domain?: string;
  uploaded_by?: string;
  document_version?: string;
  processing_status?: string;
  filename_search?: string;
  ingested_after?: string;
  ingested_before?: string;
  document_tags?: string[];
  tags_match_mode?: "any" | "all" | "exact";
}
