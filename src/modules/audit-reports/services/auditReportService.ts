/* eslint-disable @typescript-eslint/no-explicit-any */
import { http } from "@/modules/api/http";
import type {
  AuditReport,
  AuditReportCreate,
  AuditReportResponse,
  ChatHistoryItem,
  ComplianceGapItem,
  DocumentItem,
} from "../types";

const AUDIT_REPORT_ENDPOINTS = {
  CREATE: "/v1/audit-reports",
  LIST: "/v1/audit-reports",
  BY_ID: (reportId: string) => `/v1/audit-reports/${reportId}`,
  BY_USER: (userId: string) => `/v1/audit-reports/user/${userId}`,
  BY_SESSION: (sessionId: string) => `/v1/audit-reports/session/${sessionId}`,
  DOWNLOAD: (reportId: string) => `/v1/audit-reports/${reportId}/download`,

  // Data source endpoints
  SESSION_CHATS: (sessionId: string) =>
    `/v1/audit-sessions/${sessionId}/history`,
  SESSION_GAPS: (sessionId: string) => `/v1/audit-sessions/${sessionId}/gaps`,
  SESSION_DOCUMENTS: (sessionId: string) =>
    `/v1/audit-sessions/${sessionId}/pdf-ingestions`,
} as const;

class AuditReportService {
  async createReport(
    reportData: AuditReportCreate
  ): Promise<AuditReportResponse> {
    try {
      const response = await http.post<AuditReportResponse>(
        AUDIT_REPORT_ENDPOINTS.CREATE,
        reportData
      );
      return response.data;
    } catch (error: any) {
      // Transform error response to match our expected format
      const errorMessage =
        error.response?.data?.detail || "Failed to create audit report";
      return {
        success: false,
        message: errorMessage,
        error: errorMessage,
      };
    }
  }

  async getAllReports(
    skip: number = 0,
    limit: number = 10
  ): Promise<AuditReport[]> {
    const response = await http.get<AuditReport[]>(
      AUDIT_REPORT_ENDPOINTS.LIST,
      {
        params: { skip, limit },
      }
    );
    return response.data;
  }

  async getUserReports(
    userId: string,
    skip: number = 0,
    limit: number = 10
  ): Promise<AuditReport[]> {
    const response = await http.get<AuditReport[]>(
      AUDIT_REPORT_ENDPOINTS.BY_USER(userId),
      {
        params: { skip, limit },
      }
    );
    return response.data;
  }

  async getReportById(reportId: string): Promise<AuditReport> {
    const response = await http.get<AuditReport>(
      AUDIT_REPORT_ENDPOINTS.BY_ID(reportId)
    );
    return response.data;
  }

  async getSessionReports(
    sessionId: string,
    skip: number = 0,
    limit: number = 10
  ): Promise<AuditReport[]> {
    const response = await http.get<AuditReport[]>(
      AUDIT_REPORT_ENDPOINTS.BY_SESSION(sessionId),
      {
        params: { skip, limit },
      }
    );
    return response.data;
  }

  async downloadReport(reportId: string): Promise<Blob> {
    const response = await http.get(AUDIT_REPORT_ENDPOINTS.DOWNLOAD(reportId), {
      responseType: "blob",
    });
    return response.data;
  }

  // Data source methods for report creation
  async getSessionChatHistory(sessionId: string): Promise<ChatHistoryItem[]> {
    try {
      const response = await http.get<ChatHistoryItem[]>(
        AUDIT_REPORT_ENDPOINTS.SESSION_CHATS(sessionId)
      );
      return response.data.map((chat) => ({
        ...chat,
        selected: true, // Default to selected
      }));
    } catch (error: any) {
      console.error("Failed to fetch chat history:", error);
      return [];
    }
  }

  async getSessionComplianceGaps(
    sessionId: string
  ): Promise<ComplianceGapItem[]> {
    try {
      const response = await http.get<ComplianceGapItem[]>(
        AUDIT_REPORT_ENDPOINTS.SESSION_GAPS(sessionId)
      );
      return response.data.map((gap) => ({
        ...gap,
        selected: true, // Default to selected
      }));
    } catch (error: any) {
      console.error("Failed to fetch compliance gaps:", error);
      return [];
    }
  }

  async getSessionDocuments(sessionId: string): Promise<DocumentItem[]> {
    try {
      const response = await http.get<DocumentItem[]>(
        AUDIT_REPORT_ENDPOINTS.SESSION_DOCUMENTS(sessionId)
      );
      return response.data.map((doc) => ({
        ...doc,
        selected: true, // Default to selected
      }));
    } catch (error: any) {
      console.error("Failed to fetch session documents:", error);
      return [];
    }
  }

  // Helper method to get all data sources for a session
  async getSessionDataSources(sessionId: string): Promise<{
    chatHistory: ChatHistoryItem[];
    complianceGaps: ComplianceGapItem[];
    documents: DocumentItem[];
  }> {
    const [chatHistory, complianceGaps, documents] = await Promise.all([
      this.getSessionChatHistory(sessionId),
      this.getSessionComplianceGaps(sessionId),
      this.getSessionDocuments(sessionId),
    ]);

    return {
      chatHistory,
      complianceGaps,
      documents,
    };
  }
}

export const auditReportService = new AuditReportService();
