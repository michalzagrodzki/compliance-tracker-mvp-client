 
import { create } from "zustand";
import type {
  ChatMessage,
  ChatSession,
  DocumentsByType,
} from "../types";

interface ChatState {
  currentSession: ChatSession | null;
  messages: ChatMessage[];
  isLoading: boolean;
  isStreaming: boolean;
  error: string | null;
  documents: DocumentsByType;
}

interface ChatActions {
  // Setters for state management
  setCurrentSession: (session: ChatSession | null) => void;
  setMessages: (messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void;
  removeMessage: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setStreaming: (streaming: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  setDocuments: (documents: DocumentsByType) => void;
  
  // Computed/utility methods
  clearChat: () => void;
  findMessageById: (id: string) => ChatMessage | undefined;
  getMessagesByType: (type: "user" | "ai") => ChatMessage[];
  getConversationStats: () => {
    userMessages: number;
    aiMessages: number;
    totalMessages: number;
    avgResponseTime: number;
  };
  getReferencedSources: () => string[];
}

interface ChatStore extends ChatState, ChatActions {}

export const useChatStore = create<ChatStore>((set, get) => ({
  // State
  currentSession: null,
  messages: [],
  isLoading: false,
  isStreaming: false,
  error: null,
  documents: {
    reference: [],
    implementation: [],
    assessment: [],
  },

  // Setters
  setCurrentSession: (session: ChatSession | null) => {
    set({ currentSession: session });
  },

  setMessages: (messages: ChatMessage[]) => {
    set({ messages });
  },

  addMessage: (message: ChatMessage) => {
    set((state) => ({
      messages: [...state.messages, message],
    }));
  },

  updateMessage: (id: string, updates: Partial<ChatMessage>) => {
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === id ? { ...msg, ...updates } : msg
      ),
    }));
  },

  removeMessage: (id: string) => {
    set((state) => ({
      messages: state.messages.filter((msg) => msg.id !== id),
    }));
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setStreaming: (streaming: boolean) => {
    set({ isStreaming: streaming });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  clearError: () => {
    set({ error: null });
  },

  setDocuments: (documents: DocumentsByType) => {
    set({ documents });
  },

  // Computed/utility methods
  clearChat: () => {
    set({
      currentSession: null,
      messages: [],
      isLoading: false,
      isStreaming: false,
      error: null,
      documents: {
        reference: [],
        implementation: [],
        assessment: [],
      },
    });
  },

  findMessageById: (id: string): ChatMessage | undefined => {
    const { messages } = get();
    return messages.find((msg) => msg.id === id);
  },

  getMessagesByType: (type: "user" | "ai"): ChatMessage[] => {
    const { messages } = get();
    return messages.filter((msg) => msg.type === type);
  },

  getConversationStats: () => {
    const { messages } = get();
    const userMessages = messages.filter((m) => m.type === "user").length;
    const aiMessages = messages.filter((m) => m.type === "ai").length;
    const totalMessages = messages.length;
    const avgResponseTime =
      messages
        .filter((m) => m.type === "ai" && m.response_time_ms)
        .reduce((acc, m) => acc + (m.response_time_ms || 0), 0) / aiMessages || 0;

    return {
      userMessages,
      aiMessages,
      totalMessages,
      avgResponseTime: Math.round(avgResponseTime),
    };
  },

  getReferencedSources: (): string[] => {
    const { messages } = get();
    const sources = new Set<string>();
    messages.forEach((message) => {
      if (message.sources) {
        message.sources.forEach((source) => {
          if (typeof source === "string") {
            sources.add(source);
          } else if (source && typeof source === "object" && "source_filename" in source) {
            sources.add(source.source_filename || "");
          }
        });
      }
    });
    return Array.from(sources).filter(Boolean);
  },
}));