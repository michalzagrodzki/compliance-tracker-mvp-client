import React, { useEffect, useRef } from 'react';
import { ChatMessage } from './ChatMessage';
import type { ChatMessage as ChatMessageType } from '../types';

interface ChatMessagesProps {
  messages: ChatMessageType[];
  isLoading: boolean;
  isStreaming: boolean;
  onIdentifyGap?: (messageId: string) => void;
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  isLoading,
  isStreaming,
  onIdentifyGap
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="max-w-4xl mx-auto">
        {messages.length === 0 && !isLoading && (
          <div className="text-center text-gray-500 mt-8">
            <div className="text-lg mb-2">Start a conversation</div>
            <div className="text-sm">Ask any question about compliance requirements or policies.</div>
          </div>
        )}
        
        {messages.map((message) => (
          <ChatMessage 
            key={message.id} 
            message={message} 
            onIdentifyGap={onIdentifyGap}
          />
        ))}
        
        {(isLoading || isStreaming) && (
          <div className="flex justify-start mb-4">
            <div className="bg-white border shadow-sm rounded-lg p-4 max-w-[80%]">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm text-gray-600">
                  {isStreaming ? 'AI is responding...' : 'AI is thinking...'}
                </span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};