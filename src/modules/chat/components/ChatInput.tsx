import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  isStreaming: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  isLoading, 
  isStreaming, 
  disabled = false,
  placeholder = "Ask a question about compliance..."
}) => {
  const [message, setMessage] = useState('');
  
  const handleSubmit = () => {
    if (message.trim() && !isLoading && !isStreaming && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const isDisabled = !message.trim() || isLoading || isStreaming || disabled;
  
  return (
    <div className="border-t bg-white p-4">
      <div className="flex space-x-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="flex-1"
          disabled={disabled || isStreaming}
        />
        <Button onClick={handleSubmit} disabled={isDisabled}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
      {isStreaming && (
        <div className="mt-2 text-sm text-gray-500">
          AI is responding...
        </div>
      )}
    </div>
  );
};