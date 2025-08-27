/* eslint-disable @typescript-eslint/no-explicit-any */
import { http } from "@/modules/api/http";
import { normalizeError } from "@/lib/error";
import type {
  AddDocumentRequest,
  AuditSession,
  AuditSessionCreate,
  AuditSessionSearchRequest,
  DocumentWithRelationship,
} from "../types";

const AUDIT_SESSION_ENDPOINTS = {
  LIST_ALL: "/v1/audit-sessions",
  BY_USER: (userId: string) => `/v1/audit-sessions/user/${userId}`,
  BY_ID: (sessionId: string) => `/v1/audit-sessions/${sessionId}`,
  BY_STATUS: (isActive: boolean) => `/v1/audit-sessions/status/${isActive}`,
  BY_DOMAIN: (domain: string) => `/v1/audit-sessions/domain/${domain}`,
  SEARCH: "/v1/audit-sessions/search",
  CREATE: "/v1/audit-sessions",
  SESSION_DOCUMENTS: (sessionId: string) =>
    `/v1/ingestions/audit-sessions/${sessionId}`,
  ADD_TO_SESSION: (sessionId: string) =>
    `/v1/ingestions/audit-sessions/${sessionId}`,
  REMOVE_FROM_SESSION: (sessionId: string, documentId: string) =>
    `/v1/ingestions/audit-sessions/${sessionId}/pdf-ingestions/${documentId}`,
  SESSION_HISTORY: (sessionId: string) =>
    `/v1/history/audit-sessions/${sessionId}`,
  CLOSE_SESSION: (sessionId: string) => `/v1/audit-sessions/${sessionId}/close`,
  ACTIVATE_SESSION: (sessionId: string) =>
    `/v1/audit-sessions/${sessionId}/activate`,
} as const;

class AuditSessionService {
  private unwrap<T>(payload: any): T {
    if (payload && typeof payload === "object" && "data" in payload) {
      return (payload as any).data as T;
    }
    return payload as T;
  }

  async getAllSessions(
    skip: number = 0,
    limit: number = 10
  ): Promise<AuditSession[]> {
    try {
      const response = await http.get<AuditSession[]>(
        AUDIT_SESSION_ENDPOINTS.LIST_ALL,
        {
          params: { skip, limit },
        }
      );
      return this.unwrap<AuditSession[]>(response.data);
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async getUserSessions(
    userId: string,
    skip: number = 0,
    limit: number = 10
  ): Promise<AuditSession[]> {
    try {
      const response = await http.get<AuditSession[]>(
        AUDIT_SESSION_ENDPOINTS.BY_USER(userId),
        {
          params: { skip, limit },
        }
      );
      return this.unwrap<AuditSession[]>(response.data);
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async getSessionById(sessionId: string): Promise<AuditSession> {
    try {
      const response = await http.get<AuditSession>(
        AUDIT_SESSION_ENDPOINTS.BY_ID(sessionId)
      );
      return this.unwrap<AuditSession>(response.data);
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async getSessionsByStatus(
    isActive: boolean,
    skip: number = 0,
    limit: number = 10
  ): Promise<AuditSession[]> {
    try {
      const response = await http.get<AuditSession[]>(
        AUDIT_SESSION_ENDPOINTS.BY_STATUS(isActive),
        {
          params: { skip, limit },
        }
      );
      return this.unwrap<AuditSession[]>(response.data);
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async getSessionsByDomain(
    domain: string,
    skip: number = 0,
    limit: number = 10
  ): Promise<AuditSession[]> {
    try {
      const response = await http.get<AuditSession[]>(
        AUDIT_SESSION_ENDPOINTS.BY_DOMAIN(domain),
        {
          params: { skip, limit },
        }
      );
      return this.unwrap<AuditSession[]>(response.data);
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async searchSessions(
    searchData: AuditSessionSearchRequest
  ): Promise<AuditSession[]> {
    try {
      const response = await http.post<AuditSession[]>(
        AUDIT_SESSION_ENDPOINTS.SEARCH,
        searchData
      );
      return this.unwrap<AuditSession[]>(response.data);
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async createSession(sessionData: AuditSessionCreate): Promise<AuditSession> {
    try {
      const response = await http.post<AuditSession>(
        AUDIT_SESSION_ENDPOINTS.CREATE,
        {
          ...sessionData,
        }
      );
      return this.unwrap<AuditSession>(response.data);
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async getSessionDocuments(
    sessionId: string
  ): Promise<DocumentWithRelationship[]> {
    try {
      const response = await http.get<DocumentWithRelationship[]>(
        AUDIT_SESSION_ENDPOINTS.SESSION_DOCUMENTS(sessionId)
      );
      return this.unwrap<DocumentWithRelationship[]>(response.data);
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async addDocumentToSession(
    sessionId: string,
    documentId: string,
    notes?: string
  ): Promise<void> {
    try {
      const requestData: AddDocumentRequest = {
        pdf_ingestion_id: documentId,
        notes:
          notes ||
          `Document added to audit session on ${new Date().toLocaleDateString()}`,
      };

      await http.post(
        AUDIT_SESSION_ENDPOINTS.ADD_TO_SESSION(sessionId),
        requestData
      );
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async removeDocumentFromSession(
    sessionId: string,
    documentId: string
  ): Promise<void> {
    try {
      await http.delete(
        AUDIT_SESSION_ENDPOINTS.REMOVE_FROM_SESSION(sessionId, documentId)
      );
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async getAuditSessionHistory(sessionId: string): Promise<any[]> {
    try {
      const response = await http.get<any>(
        AUDIT_SESSION_ENDPOINTS.SESSION_HISTORY(sessionId)
      );
      const payload = response.data as any;
      // Handle both plain array responses and envelope { success, data, ... }
      const items = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
        ? payload.data
        : [];
      return items;
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async closeAuditSession(
    sessionId: string,
    sessionSummary?: string
  ): Promise<AuditSession> {
    try {
      const response = await http.put<AuditSession>(
        AUDIT_SESSION_ENDPOINTS.CLOSE_SESSION(sessionId),
        { session_summary: sessionSummary }
      );
      return this.unwrap<AuditSession>(response.data);
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async activateAuditSession(sessionId: string): Promise<AuditSession> {
    try {
      const response = await http.put<AuditSession>(
        AUDIT_SESSION_ENDPOINTS.ACTIVATE_SESSION(sessionId)
      );
      return this.unwrap<AuditSession>(response.data);
    } catch (error) {
      throw normalizeError(error);
    }
  }
}

export const auditSessionService = new AuditSessionService();
