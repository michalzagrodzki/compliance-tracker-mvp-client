/* eslint-disable @typescript-eslint/no-explicit-any */

import type { PdfIngestion } from "../../documents/types";
export interface AuditSession {
  id: string;
  user_id: string;
  session_name: string;
  compliance_domain: string;
  started_at: string;
  ended_at?: string;
  is_active: boolean;
  total_queries?: number;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  updated_at: string;
}

export interface AuditSessionCreate {
  session_name: string;
  compliance_domain: string;
}

export interface AuditSessionSearchRequest {
  compliance_domain?: string;
  user_id?: string;
  started_at?: string;
  ended_at?: string;
  is_active?: boolean;
  skip?: number;
  limit?: number;
}

export interface AuditSessionState {
  sessions: AuditSession[];
  currentSession: AuditSession | null;
  isLoading: boolean;
  error: string | null;
  sessionDocuments: any;
  isAddingDocument: boolean;
  isRemovingDocument: string | null;
}

export interface AuditSessionActions {
  fetchUserSessions: (
    userId: string,
    skip?: number,
    limit?: number
  ) => Promise<void>;
  fetchSessionById: (sessionId: string) => Promise<void>;
  createSession: (sessionData: AuditSessionCreate) => Promise<AuditSession>;
  searchSessions: (searchData: AuditSessionSearchRequest) => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  setAddingDocument: (adding: boolean) => void;
  setRemovingDocument: (documentId: string | null) => void;
  fetchSessionDocuments: (
    sessionId: string
  ) => Promise<DocumentWithRelationship[] | undefined>;

  addDocumentToSession: (
    sessionId: string,
    documentId: string,
    notes?: string
  ) => Promise<DocumentWithRelationship[]>;
  removeDocumentFromSession: (
    sessionId: string,
    documentId: string
  ) => Promise<void>;
  closeSession: (sessionId: string, summary?: string) => Promise<void>;
  reactivateSession: (sessionId: string) => Promise<void>;
}

export interface DocumentWithRelationship extends PdfIngestion {
  notes?: string;
}

export interface AddDocumentRequest {
  pdf_ingestion_id: string;
  notes?: string;
}
