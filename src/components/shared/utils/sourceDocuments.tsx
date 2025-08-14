import { FileIcon, FileSearch, ExternalLink } from 'lucide-react';
import type { SourceDocument } from '@/modules/chat/types';
import { formatSimilarity } from './textFormatting';

export interface AggregatedDocument {
  title: string;
  author: string;
  source_filename?: string;
  pages: Array<{ page_number: number; similarity: string }>;
}

/**
 * Extracts unique titles from mixed source types
 */
export const extractUniqueTitles = (
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

/**
 * Aggregates source documents by title, author, and filename
 */
export const aggregateSourceDocuments = (
  sourceDocuments: SourceDocument[]
): Record<string, AggregatedDocument> => {
  return sourceDocuments.reduce((acc, doc) => {
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
  }, {} as Record<string, AggregatedDocument>);
};

/**
 * Sorts pages by similarity (highest first)
 */
export const sortPagesBySimilarity = (pages: Array<{ page_number: number; similarity: string }>) => {
  return pages.sort((a, b) => {
    const simA = typeof a.similarity === 'string' ? parseFloat(a.similarity.replace(',', '.')) : a.similarity;
    const simB = typeof b.similarity === 'string' ? parseFloat(b.similarity.replace(',', '.')) : b.similarity;
    return (simB as number) - (simA as number);
  });
};

/**
 * Renders source documents with chat message styling
 */
export const renderChatSources = (sources: (string | SourceDocument)[]) => {
  // Check if sources are SourceDocument objects or just strings
  const isSourceDocuments = sources.length > 0 && typeof sources[0] === 'object' && 'title' in sources[0];

  if (isSourceDocuments) {
    const sourceDocuments = sources as SourceDocument[];
    const aggregatedDocs = aggregateSourceDocuments(sourceDocuments);
    
    // Sort pages within each document by similarity (highest first)
    Object.values(aggregatedDocs).forEach(doc => {
      doc.pages = sortPagesBySimilarity(doc.pages);
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

/**
 * Renders source documents with gap detail styling (for compliance gaps)
 */
export const renderGapSourceDocuments = (sources: string[] | SourceDocument[] | undefined) => {
  if (!sources || sources.length === 0) {
    return (
      <div className="text-center py-4">
        <FileSearch className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">No source documents</p>
      </div>
    );
  }
  
  const isSourceDocuments = sources.length > 0 && typeof sources[0] === 'object' && 'title' in (sources[0] as SourceDocument);
  
  if (isSourceDocuments) {
    const sourceDocuments = sources as SourceDocument[];
    const aggregatedDocs = aggregateSourceDocuments(sourceDocuments);
    
    Object.values(aggregatedDocs).forEach((doc) => {
      doc.pages = sortPagesBySimilarity(doc.pages);
    });
    
    return (
      <div className="space-y-3">
        {Object.values(aggregatedDocs).map((doc, index) => (
          <div key={index} className="flex items-start space-x-3 p-3 bg-muted/50 rounded-md border">
            <FileIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h5 className="font-medium text-sm truncate">{doc.title}</h5>
              </div>
              <div className="space-y-1 mb-2">
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium">Author:</span> {doc.author}
                </p>
                {doc.source_filename && (
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium">File:</span> {doc.source_filename}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Pages:</p>
                <div className="flex flex-wrap gap-1">
                  {doc.pages.map((page, pageIndex) => (
                    <span key={pageIndex} className="inline-flex items-center space-x-1 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      <span>{page.page_number}</span>
                      <span className="text-blue-600">({formatSimilarity(page.similarity)})</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <button className="inline-flex items-center justify-center rounded-md px-2 py-1 text-xs text-muted-foreground hover:text-foreground">
              <ExternalLink className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    );
  }
  
  const stringSources = sources as string[];
  return (
    <div className="space-y-2">
      {stringSources.map((source, index) => (
        <div key={index} className="flex items-center space-x-2 p-2 bg-muted rounded">
          <FileSearch className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{source}</span>
          <button className="ml-auto inline-flex items-center justify-center rounded-md px-2 py-1 text-xs text-muted-foreground hover:text-foreground">
            <ExternalLink className="h-3 w-3" />
          </button>
        </div>
      ))}
    </div>
  );
};