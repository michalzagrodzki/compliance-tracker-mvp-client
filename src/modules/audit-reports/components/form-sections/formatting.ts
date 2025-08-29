import React from 'react';

export const formatRecommendationContent = (content: unknown): React.ReactNode => {
  if (content == null) return '';

  // Ensure we always operate on a string
  let text = typeof content === 'string'
    ? content
    : Array.isArray(content)
      ? content.map((v) => (v == null ? '' : String(v))).join('\n')
      : typeof content === 'object'
        ? JSON.stringify(content, null, 2)
        : String(content);
  
  // Remove leading "1. " from the beginning of content
  text = text.replace(/^1\.\s*/, '');

  // Split text into paragraphs and process each
  const paragraphs = text.split('\n\n');
  
  return paragraphs.map((paragraph, index) => {
    if (!paragraph.trim()) return null;
    
    // Check for headers
    if (paragraph.startsWith('### ')) {
      return React.createElement('h3', {
        key: index,
        className: 'text-lg font-semibold mb-2 text-gray-900'
      }, paragraph.replace('### ', ''));
    }
    if (paragraph.startsWith('## ')) {
      return React.createElement('h2', {
        key: index,
        className: 'text-xl font-bold mb-3 text-gray-900'
      }, paragraph.replace('## ', ''));
    }
    if (paragraph.startsWith('# ')) {
      return React.createElement('h1', {
        key: index,
        className: 'text-2xl font-bold mb-4 text-gray-900'
      }, paragraph.replace('# ', ''));
    }
    
    // Check for lists
    const lines = paragraph.split('\n');
    if (lines.some(line => line.match(/^[-\*]\s/) || line.match(/^\d+\.\s/))) {
      const listItems = lines.map((line, lineIndex) => {
        if (line.match(/^[-\*]\s/)) {
          return React.createElement('li', {
            key: lineIndex,
            className: 'ml-4 mb-1'
          }, '• ' + line.replace(/^[-\*]\s/, ''));
        }
        if (line.match(/^\d+\.\s/)) {
          return React.createElement('li', {
            key: lineIndex,
            className: 'ml-4 mb-1'
          }, line);
        }
        return line;
      }).filter(item => typeof item !== 'string' || item.trim());
      
      return React.createElement('ul', {
        key: index,
        className: 'list-none mb-4'
      }, ...listItems);
    }
    
    // Regular paragraph - handle inline formatting
    const processInlineFormatting = (text: string): React.ReactNode[] => {
      const parts: React.ReactNode[] = [];
      let currentIndex = 0;
      
      // Process bold text
      text.replace(/\*\*(.+?)\*\*/g, (match, content, offset) => {
        if (offset > currentIndex) {
          parts.push(text.slice(currentIndex, offset));
        }
        parts.push(React.createElement('strong', {
          key: `bold-${offset}`,
          className: 'font-semibold text-gray-900'
        }, content));
        currentIndex = offset + match.length;
        return match;
      });
      
      if (currentIndex < text.length) {
        parts.push(text.slice(currentIndex));
      }
      
      return parts.length > 0 ? parts : [text];
    };
    
    return React.createElement('p', {
      key: index,
      className: 'mb-4'
    }, ...processInlineFormatting(paragraph));
  }).filter(Boolean);
};
