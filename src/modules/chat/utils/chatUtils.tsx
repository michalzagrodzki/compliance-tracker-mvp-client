/* eslint-disable @typescript-eslint/no-explicit-any */
export const chatUtils = {
  generateChatId: (): string => {
    return crypto.randomUUID();
  },

  generateConversationId: (): string => {
    return crypto.randomUUID();
  },

  formatTimestamp: (timestamp: Date): string => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return timestamp.toLocaleDateString();
  },

  getFileExtension: (filename: string): string => {
    return filename.split('.').pop()?.toLowerCase() || '';
  },

  isPdfDocument: (filename: string): boolean => {
    return chatUtils.getFileExtension(filename) === 'pdf';
  },

  truncateText: (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  },

  parseDocumentTags: (tags: string[] = []): {
    isReference: boolean;
    isImplementation: boolean;
    isAssessment: boolean;
    isCurrentVersion: boolean;
    isDraft: boolean;
  } => {
    const tagSet = new Set(tags.map(tag => tag.toLowerCase()));
    
    return {
      isReference:        tagSet.has('reference_document') || 
                          tagSet.has('iso_standard') || 
                          tagSet.has('regulatory_framework'),
      isImplementation:   tagSet.has('implementation_document') || 
                          tagSet.has('sop') || 
                          tagSet.has('procedure') || 
                          tagSet.has('internal_policy'),
      isAssessment:       tagSet.has('assessment_document') || 
                          tagSet.has('audit_report') || 
                          tagSet.has('gap_analysis'),
      isCurrentVersion:   tagSet.has('current'),
      isDraft:            tagSet.has('draft')
    };
  },

  getDomainInfo: (complianceDomain: string): {
    name: string;
    description: string;
    color: string;
  } => {
    const domainMap: Record<string, any> = {
      'ISO27001': {
        name: 'ISO/IEC 27001',
        description: 'Information security management systems',
        color: 'blue'
      }
    };

    return domainMap[complianceDomain] || {
      name: complianceDomain,
      description: 'Custom compliance framework',
      color: 'gray'
    };
  }
};