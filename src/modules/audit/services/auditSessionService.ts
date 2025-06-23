import { http } from "@/modules/api/http";
import type {
  AuditSession,
  AuditSessionCreate,
  AuditSessionSearchRequest,
} from "../types";

const AUDIT_SESSION_ENDPOINTS = {
  LIST_ALL: "/v1/audit-sessions",
  BY_USER: (userId: string) => `/v1/audit-sessions/user/${userId}`,
  BY_ID: (sessionId: string) => `/v1/audit-sessions/${sessionId}`,
  BY_STATUS: (isActive: boolean) => `/v1/audit-sessions/status/${isActive}`,
  BY_DOMAIN: (domain: string) => `/v1/audit-sessions/domain/${domain}`,
  SEARCH: "/v1/audit-sessions/search",
  CREATE: "/v1/audit-sessions",
} as const;

class AuditSessionService {
  async getAllSessions(
    skip: number = 0,
    limit: number = 10
  ): Promise<AuditSession[]> {
    const response = await http.get<AuditSession[]>(
      AUDIT_SESSION_ENDPOINTS.LIST_ALL,
      {
        params: { skip, limit },
      }
    );
    return response.data;
  }

  async getUserSessions(
    userId: string,
    skip: number = 0,
    limit: number = 10
  ): Promise<AuditSession[]> {
    const response = await http.get<AuditSession[]>(
      AUDIT_SESSION_ENDPOINTS.BY_USER(userId),
      {
        params: { skip, limit },
      }
    );
    return response.data;
  }

  async getSessionById(sessionId: string): Promise<AuditSession> {
    const response = await http.get<AuditSession>(
      AUDIT_SESSION_ENDPOINTS.BY_ID(sessionId)
    );
    return response.data;
  }

  async getSessionsByStatus(
    isActive: boolean,
    skip: number = 0,
    limit: number = 10
  ): Promise<AuditSession[]> {
    const response = await http.get<AuditSession[]>(
      AUDIT_SESSION_ENDPOINTS.BY_STATUS(isActive),
      {
        params: { skip, limit },
      }
    );
    return response.data;
  }

  async getSessionsByDomain(
    domain: string,
    skip: number = 0,
    limit: number = 10
  ): Promise<AuditSession[]> {
    const response = await http.get<AuditSession[]>(
      AUDIT_SESSION_ENDPOINTS.BY_DOMAIN(domain),
      {
        params: { skip, limit },
      }
    );
    return response.data;
  }

  async searchSessions(
    searchData: AuditSessionSearchRequest
  ): Promise<AuditSession[]> {
    const response = await http.post<AuditSession[]>(
      AUDIT_SESSION_ENDPOINTS.SEARCH,
      searchData
    );
    return response.data;
  }

  async createSession(sessionData: AuditSessionCreate): Promise<AuditSession> {
    const response = await http.post<AuditSession>(
      AUDIT_SESSION_ENDPOINTS.CREATE,
      {
        ...sessionData,
      }
    );
    return response.data;
  }
}

export const auditSessionService = new AuditSessionService();
