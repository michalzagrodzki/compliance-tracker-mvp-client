/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ChatMessage {
  id: string;
  type: "user" | "ai";
  message: string;
  timestamp: Date;
  sources?: string[];
  conversation_id?: string;
  audit_session_id?: string;
  compliance_domain?: string;
  response_time_ms?: number;
  metadata?: Record<string, any>;
}

export interface DocumentGroup {
  id: string;
  title: string;
  filename: string;
  compliance_domain?: string;
  document_version?: string;
  document_tags?: string[];
  upload_date?: string;
}

export interface DocumentsByType {
  reference: DocumentGroup[];
  implementation: DocumentGroup[];
  assessment: DocumentGroup[];
}

export interface ChatSession {
  id: string;
  conversation_id: string;
  audit_session_id: string;
  compliance_domain: string;
  session_name: string;
  created_at: Date;
  updated_at: Date;
  messages: ChatMessage[];
}

export interface ChatState {
  currentSession: ChatSession | null;
  messages: ChatMessage[];
  isLoading: boolean;
  isStreaming: boolean;
  error: string | null;
  documents: DocumentsByType;
}

export interface ChatActions {
  initializeChat: (sessionId: string, chatId: string) => Promise<void>;
  sendMessage: (message: string) => Promise<void>;
  loadChatHistory: (conversationId: string) => Promise<void>;
  loadDocuments: (sessionId: string) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setStreaming: (streaming: boolean) => void;
  clearError: () => void;
  clearChat: () => void;
}

export interface StreamResponse {
  token: string;
  isComplete: boolean;
  conversation_id?: string;
  sources?: string[];
  metadata?: Record<string, any>;
}

export interface QueryRequest {
  question: string;
  conversation_id?: string;
  audit_session_id?: string;
  compliance_domain?: string;
  match_threshold?: number;
  match_count?: number;
  user_id?: string;
  document_version?: string;
  document_tags?: string[];
}

export interface QueryResponse {
  answer: string;
  source_docs: Array<{
    page_content: string | null;
    metadata: Record<string, any>;
    similarity: number | null;
    id: string;
  }>;
  conversation_id: string;
  audit_session_id?: string;
  compliance_domain?: string;
  response_time_ms?: number;
  metadata?: Record<string, any>;
}

export interface ChatMessageCreate {
  message: string;
  type: "user" | "ai";
  conversation_id: string;
  audit_session_id: string;
  sources?: string[];
  metadata?: Record<string, any>;
}

export interface ComplianceGapIdentification {
  message_id: string;
  gap_type: string;
  gap_category: string;
  confidence_score: number;
  recommendation: string;
}

export interface DocumentAccessLog {
  document_id: string;
  access_type: "reference" | "view" | "search";
  chat_message_id?: string;
  accessed_at: Date;
}
