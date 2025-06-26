import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ChatMessage as ChatMessageType } from '../types';

interface ChatMessageProps {
  message: ChatMessageType;
  onIdentifyGap?: (messageId: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, onIdentifyGap }) => {
  const [showGapIcon, setShowGapIcon] = useState(false);
  
  const handleIdentifyGap = () => {
    onIdentifyGap?.(message.id);
  };

  return (
    <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
      <div 
        className={`max-w-[80%] rounded-lg p-4 ${
          message.type === 'user' 
            ? 'bg-gray-800 text-white' 
            : 'bg-white border shadow-sm'
        }`}
        onMouseEnter={() => message.type === 'ai' && setShowGapIcon(true)}
        onMouseLeave={() => setShowGapIcon(false)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="text-sm whitespace-pre-wrap">{message.message}</div>
            
            {message.sources && message.sources.length > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-200">
                <div className="text-xs text-gray-500">Sources:</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {message.sources.map((source, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                      {source}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {message.response_time_ms && (
              <div className="mt-1 text-xs text-gray-400">
                Response time: {message.response_time_ms}ms
              </div>
            )}
          </div>
          
          {message.type === 'ai' && showGapIcon && (
            <Button
              size="sm"
              variant="ghost"
              className="ml-2 h-6 w-6 p-0 opacity-70 hover:opacity-100"
              title="Identify Compliance Gap"
              onClick={handleIdentifyGap}
            >
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </Button>
          )}
        </div>
        
        <div className="text-xs text-gray-400 mt-2">
          {message.timestamp.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};