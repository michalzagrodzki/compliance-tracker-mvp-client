import { useChatStore } from "../store/chatStore";
import type { ChatMessage } from "../types";

export const chatStoreUtils = {
  getState: () => useChatStore.getState(),
  setState: useChatStore.setState,

  // Add a message to the current chat
  addMessage: (message: ChatMessage) => {
    useChatStore.setState((state) => ({
      messages: [...state.messages, message],
    }));
  },

  updateMessage: (messageId: string, updates: Partial<ChatMessage>) => {
    useChatStore.setState((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === messageId ? { ...msg, ...updates } : msg
      ),
    }));
  },

  getCurrentConversationId: (): string | null => {
    const state = useChatStore.getState();
    return state.currentSession?.conversation_id || null;
  },

  getCurrentAuditSessionId: (): string | null => {
    const state = useChatStore.getState();
    return state.currentSession?.audit_session_id || null;
  },
};
