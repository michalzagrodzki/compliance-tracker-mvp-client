import type { JSX } from 'react';

/**
 * Formats similarity scores from string or number to percentage
 * Handles comma decimal format (e.g., "0,81") and converts to percentage
 */
export const formatSimilarity = (similarity: string | number): string => {
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

/**
 * Formats basic text content with bold markdown support (**text**)
 */
export const formatBasicContent = (text: string): JSX.Element => {
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

/**
 * Formats inline content with bold markdown support (for use in other components)
 */
export const formatInlineContent = (text: string): JSX.Element => {
  const boldPattern = /\*\*([^*]+)\*\*/g;
  const italicPattern = /\*([^*]+)\*/g;
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/);

  return (
    <>
      {parts.map((part, idx) => {
        if (part.match(boldPattern)) {
          return (
            <span key={idx} className="font-semibold text-gray-900">
              {part.replace(/\*\*/g, '')}
            </span>
          );
        }
        if (part.match(italicPattern)) {
          return (
            <span key={idx} className="italic text-gray-600">
              {part.replace(/\*/g, '')}
            </span>
          );
        }
        return <span key={idx}>{part}</span>;
      })}
    </>
  );
};

/**
 * Formats numbered sections with title and content
 * Pattern: "1. **Title**: content"
 */
export const formatNumberedSection = (text: string): JSX.Element => {
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

/**
 * Formats complete message content with numbered sections
 */
export const formatMessageContent = (text: string): JSX.Element => {
  // Parse markdown-like content similar to audit report formatting
  const lines = text.split('\n');
  const elements: JSX.Element[] = [];

  let i = 0;
  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let codeLang = '';

  const flushCode = (key: number) => {
    if (codeBuffer.length === 0) return null;
    const content = codeBuffer.join('\n');
    codeBuffer = [];
    const langClass = codeLang ? ` language-${codeLang}` : '';
    const el = (
      <pre key={key} className="text-xs md:text-sm bg-gray-900 text-gray-100 rounded-md p-3 overflow-x-auto">
        <code className={langClass}>{content}</code>
      </pre>
    );
    codeLang = '';
    return el;
  };

  while (i < lines.length) {
    const raw = lines[i];
    const line = raw.replace(/\r$/, '');

    // Handle code blocks: ```lang ... ```
    const codeFence = line.match(/^```\s*([a-zA-Z0-9_-]+)?\s*$/);
    if (codeFence) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeLang = codeFence[1] || '';
      } else {
        // Closing fence
        inCodeBlock = false;
        const codeEl = flushCode(i);
        if (codeEl) elements.push(codeEl as unknown as JSX.Element);
      }
      i++;
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      i++;
      continue;
    }

    // Skip extra blank lines but keep paragraph breaks
    if (line.trim().length === 0) {
      i++;
      continue;
    }

    // Headings
    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={i} className="text-lg md:text-xl font-bold text-gray-900 mb-2 md:mb-3">
          {line.substring(2)}
        </h1>
      );
      i++;
      continue;
    }
    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={i} className="text-base md:text-lg font-semibold text-gray-800 mt-4 mb-2">
          {line.substring(3)}
        </h2>
      );
      i++;
      continue;
    }
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={i} className="text-sm md:text-base font-semibold text-gray-800 mt-3 mb-1.5">
          {line.substring(4)}
        </h3>
      );
      i++;
      continue;
    }

    // Implementation-style numbered section: "1. **Title**: desc"
    if (line.match(/^\d+\.\s\*\*/)) {
      const { element, nextIndex } = formatImplementationStep(lines, i);
      elements.push(element);
      i = nextIndex;
      continue;
    }

    // Bullet lists
    if (line.startsWith('- ') || line.startsWith('  -')) {
      const { element, nextIndex } = formatBulletPoints(lines, i);
      elements.push(element);
      i = nextIndex;
      continue;
    }

    // Fallback paragraph with inline formatting
    elements.push(
      <p key={i} className="text-sm text-gray-800 leading-relaxed mb-2">
        {formatInlineContent(line)}
      </p>
    );
    i++;
  }

  // If code block left open (malformed), flush what's collected
  if (inCodeBlock) {
    const codeEl = flushCode(lines.length + 1);
    if (codeEl) elements.push(codeEl as unknown as JSX.Element);
  }

  return <div className="space-y-1.5">{elements}</div>;
};

/**
 * Formats implementation steps with sub-items
 */
export const formatImplementationStep = (lines: string[], startIndex: number) => {
  const line = lines[startIndex].trim();
  const match = line.match(/^(\d+)\.\s\*\*([^*]+)\*\*:?\s*(.*)$/);
  
  if (!match) {
    return { 
      element: <div key={startIndex}>{formatInlineContent(line)}</div>, 
      nextIndex: startIndex + 1 
    };
  }
  
  const [, number, title, description] = match;
  let nextIndex = startIndex + 1;
  const subItems: string[] = [];
  
  while (nextIndex < lines.length) {
    const nextLine = lines[nextIndex].trim();
    if (nextLine.startsWith('- *Timeline:*') || nextLine.startsWith('- ') || nextLine.startsWith('  -')) {
      subItems.push(nextLine);
      nextIndex++;
    } else if (nextLine.length === 0) {
      nextIndex++;
      break;
    } else if (!nextLine.startsWith(' ') && !nextLine.startsWith('-')) {
      break;
    } else {
      subItems.push(nextLine);
      nextIndex++;
    }
  }

  const element = (
    <div key={startIndex} className="border-l-4 border-blue-200 pl-4 py-3 bg-blue-50/30 rounded-r mb-4">
      <div className="flex items-start space-x-2 mb-2">
        <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white text-xs font-medium rounded-full flex items-center justify-center">
          {number}
        </span>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 text-sm leading-tight mb-1">{title}</h4>
          {description && (
            <p className="text-sm text-gray-700 leading-relaxed mb-2">
              {formatInlineContent(description)}
            </p>
          )}
        </div>
      </div>
      {subItems.length > 0 && (
        <div className="ml-8 space-y-1">
          {subItems.map((item, idx) => (
            <div key={idx} className="text-sm text-gray-700">
              {formatInlineContent(item)}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return { element, nextIndex };
};

/**
 * Formats bullet point lists
 */
export const formatBulletPoints = (lines: string[], startIndex: number) => {
  const bullets: string[] = [];
  let nextIndex = startIndex;
  
  while (nextIndex < lines.length) {
    const line = lines[nextIndex].trim();
    if (line.startsWith('- ') || line.startsWith('  -')) {
      bullets.push(line.replace(/^\s*-\s*/, ''));
      nextIndex++;
    } else if (line.length === 0) {
      nextIndex++;
      break;
    } else {
      break;
    }
  }
  
  const element = (
    <ul key={startIndex} className="list-disc list-inside space-y-1 text-sm text-gray-700">
      {bullets.map((item, idx) => (
        <li key={idx}>{formatInlineContent(item)}</li>
      ))}
    </ul>
  );
  
  return { element, nextIndex };
};

/**
 * Formats comprehensive recommendation content with headers, bullets, and steps
 */
export const formatRecommendationContent = (text: string): JSX.Element => {
  const lines = text.split('\n').filter((line) => line.trim() !== '');
  const elements: JSX.Element[] = [];
  let currentIndex = 0;
  
  while (currentIndex < lines.length) {
    const line = lines[currentIndex].trim();
    
    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={currentIndex} className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
          {line.substring(2)}
        </h1>
      );
    } else if (line.startsWith('## ')) {
      elements.push(
        <h2 key={currentIndex} className="text-lg font-semibold text-gray-800 mb-3 mt-6">
          {line.substring(3)}
        </h2>
      );
    } else if (line.match(/^\d+\.\s\*\*/)) {
      const { element, nextIndex } = formatImplementationStep(lines, currentIndex);
      elements.push(element);
      currentIndex = nextIndex - 1;
    } else if (line.startsWith('- ')) {
      const { element, nextIndex } = formatBulletPoints(lines, currentIndex);
      elements.push(element);
      currentIndex = nextIndex - 1;
    } else if (line.length > 0) {
      elements.push(
        <p key={currentIndex} className="text-sm text-gray-700 leading-relaxed mb-3">
          {formatInlineContent(line)}
        </p>
      );
    }
    currentIndex++;
  }
  
  return <div className="space-y-2">{elements}</div>;
};
