import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useComplianceGap } from '@/modules/compliance-gaps';
import type { ChatMessage as ChatMessageType, SourceDocument } from '../types';

interface ChatMessageProps {
  message: ChatMessageType;
  onIdentifyGap?: (messageId: string) => void;
}

const extractUniqueTitles = (
  sources?: string[] | SourceDocument[]
): string[] | undefined => {
  if (!sources || sources.length === 0) {
    return undefined;
  }

  // If already string[]
  if (typeof sources[0] === "string") {
    return Array.from(new Set(sources as string[]));
  }

  // If SourceDocument[]
  if (
    typeof sources[0] === "object" &&
    sources[0] !== null &&
    "title" in (sources[0] as SourceDocument)
  ) {
    const titles = (sources as SourceDocument[]).map((src) => src.title);
    return titles.length > 0 ? Array.from(new Set(titles)) : undefined;
  }

  return undefined;
};

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, onIdentifyGap }) => {
  const [showGapIcon, setShowGapIcon] = useState(false);
  const { createGapFromMessage } = useComplianceGap();
  
  const handleIdentifyGap = () => {
    createGapFromMessage(
      message.id,
      message.audit_session_id,
      message.compliance_domain,
      message.message,
      extractUniqueTitles(message.sources)
    );
    
    onIdentifyGap?.(message.id);
  };

  const formatSimilarity = (similarity: string | number) => {
    // Handle both string and number types, and convert string numbers
    let numericSimilarity: number;
    
    if (typeof similarity === 'string') {
      // Handle comma decimal format (e.g., "0,81")
      const cleanedString = similarity.replace(',', '.');
      numericSimilarity = parseFloat(cleanedString);
    } else {
      numericSimilarity = similarity;
    }
    
    // Check if parsing was successful
    if (isNaN(numericSimilarity)) {
      return 'N/A';
    }
    
    // If it's already a percentage (> 1), just round it
    if (numericSimilarity > 1) {
      return `${Math.round(numericSimilarity)}%`;
    }
    
    // If it's a decimal (0-1), convert to percentage
    return `${Math.round(numericSimilarity * 100)}%`;
  };

  const renderSources = (sources: (string | SourceDocument)[]) => {
    // Check if sources are SourceDocument objects or just strings
    const isSourceDocuments = sources.length > 0 && typeof sources[0] === 'object' && 'title' in sources[0];

    if (isSourceDocuments) {
      const sourceDocuments = sources as SourceDocument[];
      
      // Aggregate documents by title, author, and filename
      const aggregatedDocs = sourceDocuments.reduce((acc, doc) => {
        const key = `${doc.title}|${doc.author}|${doc.source_filename || ''}`;
        
        if (!acc[key]) {
          acc[key] = {
            title: doc.title,
            author: doc.author,
            source_filename: doc.source_filename,
            pages: []
          };
        }
        
        acc[key].pages.push({
          page_number: doc.source_page_number,
          similarity: doc.similarity
        });
        
        return acc;
      }, {} as Record<string, {
        title: string;
        author: string;
        source_filename?: string;
        pages: Array<{ page_number: number; similarity: string }>;
      }>);
      
      // Sort pages within each document by similarity (highest first)
      Object.values(aggregatedDocs).forEach(doc => {
        doc.pages.sort((a, b) => {
          const simA = typeof a.similarity === 'string' ? parseFloat(a.similarity.replace(',', '.')) : a.similarity;
          const simB = typeof b.similarity === 'string' ? parseFloat(b.similarity.replace(',', '.')) : b.similarity;
          return simB - simA;
        });
      });

      return (
        <div className="space-y-2">
          {Object.values(aggregatedDocs).map((doc, index) => (
            <div key={index} className="bg-gray-50 border border-gray-200 rounded-md p-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-700 truncate">{doc.title}</span>
              </div>
              <div className="text-xs text-gray-600 mb-1">
                <span className="font-medium">Author:</span> {doc.author}
              </div>
              {doc.source_filename && (
                <div className="text-xs text-gray-600 mb-2">
                  <span className="font-medium">File:</span> {doc.source_filename}
                </div>
              )}
              <div className="flex flex-wrap gap-1">
                {doc.pages.map((page, pageIndex) => (
                  <span 
                    key={pageIndex}
                    className="inline-flex items-center space-x-1 text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded hover:bg-blue-200 transition-colors cursor-pointer"
                    title={`Page ${page.page_number} - ${formatSimilarity(page.similarity)} similarity`}
                  >
                    <span>{page.page_number}</span>
                    <span className="text-blue-600">({formatSimilarity(page.similarity)})</span>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    }

    // Fallback for string array
    const stringSources = sources as string[];
    return (
      <div className="flex flex-wrap gap-1.5">
        {stringSources.map((source, index) => (
          <span 
            key={index} 
            className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs font-medium hover:bg-blue-200 transition-colors cursor-pointer"
            title={`Click to view: ${source}`}
          >
            {source}
          </span>
        ))}
      </div>
    );
  };

  const formatMessageContent = (text: string) => {
    const numberedSections = text.split(/(?=\d+\.\s\*\*)/);
    
    if (numberedSections.length <= 1) {
      return formatBasicContent(text);
    }

    return (
      <div className="space-y-4">
        {numberedSections.map((section, index) => {
          if (index === 0 && !section.match(/^\d+\.\s/)) {
            return (
              <div key={index} className="mb-4">
                {formatBasicContent(section.trim())}
              </div>
            );
          }
          
          return (
            <div key={index} className="border-l-4 border-blue-200 pl-4 py-2 bg-blue-50/30 rounded-r">
              {formatNumberedSection(section.trim())}
            </div>
          );
        })}
      </div>
    );
  };

  const formatBasicContent = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/);
    
    return (
      <div className="leading-relaxed">
        {parts.map((part, index) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <span key={index} className="font-semibold text-gray-900">
                {part.slice(2, -2)}
              </span>
            );
          }
          return <span key={index}>{part}</span>;
        })}
      </div>
    );
  };

  const formatNumberedSection = (text: string) => {
    // Extract number, title, and content
    const match = text.match(/^(\d+)\.\s\*\*([^*]+)\*\*:\s*(.+)$/s);
    
    if (match) {
      const [, number, title, content] = match;
      return (
        <div>
          <div className="flex items-start space-x-2 mb-2">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white text-xs font-medium rounded-full flex items-center justify-center">
              {number}
            </span>
            <h4 className="font-semibold text-gray-900 text-sm leading-tight">
              {title}
            </h4>
          </div>
          <div className="ml-8 text-sm text-gray-700 leading-relaxed">
            {formatBasicContent(content.trim())}
          </div>
        </div>
      );
    }
    
    return formatBasicContent(text);
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
              {renderSources(message.sources)}
            </div>
          )}
        </div>
        
        <div className={`text-xs mt-3 pt-2 border-t ${
          message.type === 'user' 
            ? 'text-gray-300 border-gray-600' 
            : 'text-gray-400 border-gray-100'
        }`}>
          {message.timestamp.toLocaleString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            month: 'short',
            day: 'numeric',
            hour12: true
          })}
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
    </div>
  );
};