export const formatRecommendationContent = (content: string): string => {
  if (!content) return '';
  
  // Convert markdown-like formatting to HTML
  let formatted = content
    // Headers
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mb-2 text-gray-900">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mb-3 text-gray-900">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mb-4 text-gray-900">$1</h1>')
    
    // Bold text
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
    
    // Italic text
    .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
    
    // Lists
    .replace(/^- (.+)$/gm, '<li class="ml-4 mb-1">• $1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4 mb-1">$1. $2</li>')
    
    // Line breaks
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>')
    
    // Code blocks (inline)
    .replace(/`(.+?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>');
  
  // Wrap consecutive list items in ul tags
  formatted = formatted.replace(/(<li[^>]*>.*?<\/li>)+/g, (match) => {
    return `<ul class="list-none mb-4">${match}</ul>`;
  });
  
  return formatted;
};