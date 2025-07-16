/* eslint-disable @typescript-eslint/no-explicit-any */
import { http } from "@/modules/api/http";
import {
  SummaryType,
  type AuditReport,
  type AuditReportCreate,
  type AuditReportResponse,
  type ChatHistoryItem,
  type ComplianceGapItem,
  type DocumentItem,
  type ExecutiveSummaryRequest,
  type ExecutiveSummaryResponse,
  type SummaryTypeValue,
} from "../types";
import type { ComplianceGap } from "@/modules/compliance-gaps/types";

const AUDIT_REPORT_ENDPOINTS = {
  CREATE: "/v1/audit-reports",
  UPDATE: (reportId: string) => `/v1/audit-reports/${reportId}`,
  LIST: "/v1/audit-reports",
  BY_ID: (reportId: string) => `/v1/audit-reports/${reportId}`,
  BY_SESSION: (sessionId: string) => `/v1/audit-reports/session/${sessionId}`,
  DOWNLOAD: (reportId: string) => `/v1/audit-reports/${reportId}/download`,
  EXECUTIVE_SUMMARY: "/v1/executive-summary",

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
      const cleanedData = {
        ...reportData,
        chat_history_ids: reportData.chat_history_ids.map((id) => {
          const numId = typeof id === "string" ? parseInt(id, 10) : id;
          return isNaN(numId) ? 0 : numId;
        }),
        template_used: reportData.template_used?.trim() || null,
        report_status: "draft",
        total_questions_asked: 0,
        questions_answered_satisfactorily: 0,
        total_gaps_identified: reportData.compliance_gap_ids?.length || 0,
        critical_gaps_count: 0,
        high_risk_gaps_count: 0,
        medium_risk_gaps_count: 0,
        low_risk_gaps_count: 0,
        user_id: String(reportData.user_id),
        audit_session_id: String(reportData.audit_session_id),
        compliance_gap_ids:
          reportData.compliance_gap_ids?.map((id) => String(id)) || [],
        document_ids: reportData.document_ids?.map((id) => String(id)) || [],
        pdf_ingestion_ids:
          reportData.pdf_ingestion_ids?.map((id) => String(id)) || [],
      };

      const response = await http.post<AuditReport>(
        AUDIT_REPORT_ENDPOINTS.CREATE,
        cleanedData
      );
      const auditReport = response.data;

      return {
        success: true,
        message: "Audit report created successfully",
        report_id: auditReport.id,
        download_url: auditReport.download_url || undefined,
      };
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

  async updateReport(
    reportId: string,
    updateData: Partial<AuditReport>,
    changeDescription?: string
  ): Promise<AuditReport> {
    const payload = {
      update_data: updateData,
      change_description:
        changeDescription || "Report updated via web interface",
    };

    const response = await http.patch<AuditReport>(
      AUDIT_REPORT_ENDPOINTS.UPDATE(reportId),
      payload
    );
    return response.data;
  }

  async downloadReport(reportId: string): Promise<Blob> {
    const response = await http.get(AUDIT_REPORT_ENDPOINTS.DOWNLOAD(reportId), {
      responseType: "blob",
    });
    return response.data;
  }

  async getSessionChatHistory(sessionId: string): Promise<ChatHistoryItem[]> {
    try {
      const response = await http.get<any[]>(
        AUDIT_REPORT_ENDPOINTS.SESSION_CHATS(sessionId)
      );
      return response.data.map((chat) => ({
        ...chat,
        id: typeof chat.id === "string" ? parseInt(chat.id, 10) : chat.id,
        selected: true,
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

  async createExecutiveSummary(
    auditReport: AuditReportCreate,
    complianceGaps: ComplianceGap[],
    summaryType: SummaryTypeValue = SummaryType.STANDARD
  ): Promise<ExecutiveSummaryResponse> {
    try {
      const requestData: ExecutiveSummaryRequest = {
        audit_report: auditReport,
        compliance_gaps: complianceGaps,
        summary_type: summaryType,
      };

      const response = await http.post<ExecutiveSummaryResponse>(
        AUDIT_REPORT_ENDPOINTS.EXECUTIVE_SUMMARY,
        requestData
      );

      return response.data;
    } catch (error: any) {
      console.error("Failed to create executive summary:", error);
      throw new Error(
        error.response?.data?.detail || "Failed to create executive summary"
      );
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
