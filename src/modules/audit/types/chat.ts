/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ChatHistoryItem {
  id: string;
  conversation_id: string;
  question: string;
  answer: string;
  audit_session_id?: string;
  compliance_domain?: string;
  source_document_ids?: string[];
  match_threshold?: number;
  match_count?: number;
  user_id?: string;
  response_time_ms?: number;
  total_tokens_used?: number;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Chat {
  id: string;
  conversation_id: string;
  audit_session_id: string;
  compliance_domain: string;
  created_at: string;
  updated_at: string;
  message_count: number;
  first_question: string;
  last_activity: string;
  has_compliance_gaps?: boolean;
  gap_count?: number;
  user_id?: string;
  session_summary?: string;
}
