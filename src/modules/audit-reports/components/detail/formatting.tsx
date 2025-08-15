import type { JSX } from 'react';

const formatInlineContent = (text: string) => {
  const boldPattern = /\*\*([^*]+)\*\*/g;
  const italicPattern = /\*([^*]+)\*/g;
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/);
  return (
    <>
      {parts.map((part, index) => {
        if (part.match(boldPattern)) {
          return (
            <span key={index} className="font-semibold text-gray-900">
              {part.replace(/\*\*/g, '')}
            </span>
          );
        } else if (part.match(italicPattern)) {
          return (
            <span key={index} className="italic text-gray-600">
              {part.replace(/\*/g, '')}
            </span>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </>
  );
};

const formatImplementationStep = (lines: string[], startIndex: number) => {
  const line = lines[startIndex].trim();
  const match = line.match(/^(\d+)\.\s\*\*([^*]+)\*\*:?\s*(.*)$/);
  if (!match) {
    return { element: <div key={startIndex}>{formatInlineContent(line)}</div>, nextIndex: startIndex + 1 };
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
          {description && <p className="text-sm text-gray-700 leading-relaxed mb-2">{formatInlineContent(description)}</p>}
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

const formatBulletPoints = (lines: string[], startIndex: number) => {
  const bullets: string[] = [];
  let nextIndex = startIndex;
  while (nextIndex < lines.length) {
    const line = lines[nextIndex].trim();
    if (line.startsWith('- ') || line.startsWith('  -')) {
      bullets.push(line);
      nextIndex++;
    } else if (line.length === 0) {
      nextIndex++;
      if (nextIndex < lines.length && lines[nextIndex].trim().startsWith('- ')) {
        continue;
      } else {
        break;
      }
    } else {
      break;
    }
  }
  const element = (
    <div key={startIndex} className="mb-3">
      <ul className="space-y-1">
        {bullets.map((bullet, idx) => (
          <li key={idx} className="flex items-start space-x-2 text-sm text-gray-700">
            <span className="flex-shrink-0 w-1 h-1 bg-gray-400 rounded-full mt-2"></span>
            <span className="leading-relaxed">{formatInlineContent(bullet.replace(/^-\s*/, '').replace(/^\s*-\s*/, ''))}</span>
          </li>
        ))}
      </ul>
    </div>
  );
  return { element, nextIndex };
};

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
