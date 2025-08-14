/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useComplianceGap } from '@/modules/compliance-gaps';
import { ComplianceGapModal } from '@/modules/compliance-gaps/components/ComplianceGapModal';
import { 
  formatMessageContent,
  extractUniqueTitles,
  renderChatSources,
  formatChatTimestamp
} from '@/components/shared/utils';
import type { ChatMessage as ChatMessageType } from '../types';

interface ChatMessageProps {
  message: ChatMessageType;
  onIdentifyGap?: (messageId: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, onIdentifyGap }) => {
  const [showGapIcon, setShowGapIcon] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { createGapFromChatHistory } = useComplianceGap();
  
  const handleIdentifyGap = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmitGap = async (request: any) => {
    await createGapFromChatHistory(request);
    onIdentifyGap?.(message.id);
  };

  return (
    <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} mb-6`}>
      <div 
        className={`max-w-[85%] rounded-lg shadow-sm relative ${
          message.type === 'user' 
            ? 'bg-gray-800 text-white p-4' 
            : 'bg-white border border-gray-200 p-5'
        }`}
        onMouseEnter={() => message.type === 'ai' && setShowGapIcon(true)}
        onMouseLeave={() => setShowGapIcon(false)}
      >
        <div className="flex-1 min-w-0">
          <div className={`${message.type === 'user' ? 'text-sm' : 'text-sm'}`}>
            {message.type === 'user' ? (
              <div className="whitespace-pre-wrap leading-relaxed">
                {message.message}
              </div>
            ) : (
              formatMessageContent(message.message)
            )}
          </div>
          
          {message.sources && message.sources.length > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-200">
              <div className="text-xs font-medium text-gray-600 mb-2">
                Sources ({message.sources.length}):
              </div>
              {renderChatSources(message.sources)}
            </div>
          )}
        </div>
        
        <div className={`text-xs mt-3 pt-2 border-t ${
          message.type === 'user' 
            ? 'text-gray-300 border-gray-600' 
            : 'text-gray-400 border-gray-100'
        }`}>
          {formatChatTimestamp(message.timestamp)}
        </div>

        {message.type === 'ai' && showGapIcon && (
          <Button
            size="sm"
            variant="ghost"
            className="absolute top-2 right-2 h-6 w-6 p-0 opacity-70 hover:opacity-100 transition-opacity bg-white border border-orange-200 shadow-sm hover:shadow-md"
            title="Mark this message as a compliance gap"
            onClick={handleIdentifyGap}
          >
            <AlertTriangle className="h-3 w-3 text-orange-500" />
          </Button>
        )}
      </div>

      <ComplianceGapModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        chatHistoryId={message.id}
        auditSessionId={message.audit_session_id}
        complianceDomain={message.compliance_domain}
        initialMessage={message.message}
        sources={extractUniqueTitles(message.sources)}
        onSubmitRequest={handleSubmitGap}
      />
    </div>
  );
};