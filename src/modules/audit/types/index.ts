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
  audit_report: string;
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


export interface DocumentWithRelationship extends PdfIngestion {
  notes?: string;
}

export interface AddDocumentRequest {
  pdf_ingestion_id: string;
  notes?: string;
}
