/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/modules/chat/services/chatService.ts

import { http } from "@/modules/api/http";
import type {
  ChatMessage,
  QueryRequest,
  QueryResponse,
  DocumentsByType,
  DocumentGroup,
} from "../types";

const CHAT_ENDPOINTS = {
  QUERY: "/v1/query",
  QUERY_STREAM: "/v1/query-stream",
  HISTORY: (conversationId: string) => `/v1/history/${conversationId}`,
  AUDIT_SESSION_HISTORY: (auditSessionId: string) =>
    `/v1/audit-sessions/${auditSessionId}/history`,
  DOCUMENTS: "/v1/documents",
  AUDIT_SESSION: (sessionId: string) => `/v1/audit-sessions/${sessionId}`,
  SESSION_DOCUMENTS: (sessionId: string) =>
    `/v1/audit-sessions/${sessionId}/pdf-ingestions`,
} as const;

class ChatService {
  // Send a query message and get a response
  async sendQuery(queryRequest: QueryRequest): Promise<QueryResponse> {
    try {
      const response = await http.post<QueryResponse>(
        CHAT_ENDPOINTS.QUERY,
        queryRequest
      );
      return response.data;
    } catch (error: any) {
      // The http interceptor will handle auth errors automatically
      throw new Error(error.response?.data?.detail || "Failed to send query");
    }
  }

  // Send a streaming query
  async sendStreamingQuery(
    queryRequest: QueryRequest,
    onToken: (token: string) => void,
    onComplete: (response: QueryResponse) => void,
    onError: (error: Error) => void
  ): Promise<void> {
    try {
      // Get the auth token using the same method as the http interceptor
      const authToken = this.getAuthToken();

      const response = await fetch(
        `${http.defaults.baseURL}${CHAT_ENDPOINTS.QUERY_STREAM}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(authToken && { Authorization: `Bearer ${authToken}` }),
          },
          body: JSON.stringify(queryRequest),
        }
      );

      if (!response.ok) {
        // Handle 401 errors consistently with the http interceptor
        if (response.status === 401) {
          try {
            await this.handleAuthRefresh();
            // Retry the request with new token
            return this.sendStreamingQuery(
              queryRequest,
              onToken,
              onComplete,
              onError
            );
          } catch (authError) {
            throw new Error("Authentication failed");
          }
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body reader available");
      }

      const decoder = new TextDecoder();
      let buffer = "";
      let fullAnswer = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        // Process complete lines
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.trim()) {
            fullAnswer += line;
            onToken(line);
          }
        }
      }

      // Process any remaining buffer
      if (buffer.trim()) {
        fullAnswer += buffer;
        onToken(buffer);
      }

      // Get conversation ID and other metadata from response headers
      const conversationId = response.headers.get("x-conversation-id") || "";
      const auditSessionId = response.headers.get("x-audit-session-id") || "";
      const complianceDomain =
        response.headers.get("x-compliance-domain") || "";

      onComplete({
        answer: fullAnswer,
        source_docs: [], // Will be populated from metadata
        conversation_id: conversationId,
        audit_session_id: auditSessionId,
        compliance_domain: complianceDomain,
      });
    } catch (error) {
      onError(error as Error);
    }
  }

  // Get chat history for a conversation
  async getChatHistory(conversationId: string): Promise<ChatMessage[]> {
    try {
      const response = await http.get<ChatMessage[]>(
        CHAT_ENDPOINTS.HISTORY(conversationId)
      );

      return response.data.map((item) => ({
        ...item,
        timestamp: new Date(item.timestamp),
      }));
    } catch (error: any) {
      throw new Error(
        error.response?.data?.detail || "Failed to get chat history"
      );
    }
  }

  // Get chat history for an audit session
  async getAuditSessionHistory(auditSessionId: string): Promise<ChatMessage[]> {
    try {
      const response = await http.get<ChatMessage[]>(
        CHAT_ENDPOINTS.AUDIT_SESSION_HISTORY(auditSessionId)
      );

      return response.data.map((item) => ({
        ...item,
        timestamp: new Date(item.timestamp),
      }));
    } catch (error: any) {
      throw new Error(
        error.response?.data?.detail || "Failed to get audit session history"
      );
    }
  }

  // Get audit session details
  async getAuditSession(sessionId: string): Promise<any> {
    try {
      const response = await http.get(CHAT_ENDPOINTS.AUDIT_SESSION(sessionId));
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.detail || "Failed to get audit session"
      );
    }
  }

  // Get documents for an audit session
  async getSessionDocuments(sessionId: string): Promise<DocumentGroup[]> {
    try {
      const response = await http.get<DocumentGroup[]>(
        CHAT_ENDPOINTS.SESSION_DOCUMENTS(sessionId)
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.detail || "Failed to get session documents"
      );
    }
  }

  // Get all documents with optional filtering
  async getDocuments(params?: {
    compliance_domain?: string;
    document_tags?: string[];
    skip?: number;
    limit?: number;
  }): Promise<DocumentGroup[]> {
    try {
      const response = await http.get<DocumentGroup[]>(
        CHAT_ENDPOINTS.DOCUMENTS,
        { params }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.detail || "Failed to get documents"
      );
    }
  }

  // Categorize documents by type based on tags
  categorizeDocuments(documents: DocumentGroup[]): DocumentsByType {
    const reference: DocumentGroup[] = [];
    const implementation: DocumentGroup[] = [];
    const assessment: DocumentGroup[] = [];

    documents.forEach((doc) => {
      const tags = doc.document_tags || [];

      if (
        tags.includes("reference_document") ||
        tags.includes("iso_standard") ||
        tags.includes("regulatory_framework")
      ) {
        reference.push(doc);
      } else if (
        tags.includes("implementation_document") ||
        tags.includes("sop") ||
        tags.includes("procedure") ||
        tags.includes("internal_policy")
      ) {
        implementation.push(doc);
      } else if (
        tags.includes("assessment_document") ||
        tags.includes("audit_report") ||
        tags.includes("gap_analysis")
      ) {
        assessment.push(doc);
      } else {
        // Default to reference if no specific tags
        reference.push(doc);
      }
    });

    return { reference, implementation, assessment };
  }

  private getAuthToken(): string {
    try {
      const { authService } = require("@/modules/auth/services/authService");
      return authService.getAccessToken() || "";
    } catch (error) {
      console.warn("Failed to get auth token:", error);
      return "";
    }
  }

  private async handleAuthRefresh(): Promise<void> {
    try {
      const { authService } = require("@/modules/auth/services/authService");
      const refreshToken = authService.getRefreshToken();

      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const tokenResponse = await authService.refreshToken({
        refresh_token: refreshToken,
      });

      authService.setAuthTokens(tokenResponse);
    } catch (error) {
      const { authService } = require("@/modules/auth/services/authService");
      authService.clearTokens();
      window.location.href = "/login";
      throw error;
    }
  }

  // Format message for display
  formatMessage(message: any): ChatMessage {
    return {
      id: message.id || Date.now().toString(),
      type: message.type || "ai",
      message: message.message || message.answer || "",
      timestamp: message.timestamp ? new Date(message.timestamp) : new Date(),
      sources:
        message.sources ||
        message.source_docs
          ?.map((doc: any) => doc.metadata?.source_filename)
          .filter(Boolean) ||
        [],
      conversation_id: message.conversation_id,
      audit_session_id: message.audit_session_id,
      compliance_domain: message.compliance_domain,
      response_time_ms: message.response_time_ms,
      metadata: message.metadata,
    };
  }

  // Log document access
  async logDocumentAccess(
    documentId: string,
    accessType: "reference" | "view" | "search",
    chatMessageId?: string
  ): Promise<void> {
    try {
      // This would be implemented based on your document access logging API
      console.log("Logging document access:", {
        documentId,
        accessType,
        chatMessageId,
      });
    } catch (error) {
      console.warn("Failed to log document access:", error);
    }
  }
}

export const chatService = new ChatService();
