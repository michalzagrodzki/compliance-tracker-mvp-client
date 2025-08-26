import { X } from 'lucide-react'
import { formatTagName } from '@/lib/documents'
import { safeReplaceUnderscore } from '@/lib/utils'
import type { DocumentTagConstants } from '../../types'

interface TagSelectorProps {
  tagConstants: DocumentTagConstants
  selectedTags: string[]
  onTagToggle: (tag: string) => void
}

export default function TagSelector({ 
  tagConstants, 
  selectedTags, 
  onTagToggle 
}: TagSelectorProps) {
  const renderTagSection = (categoryName: string, tagsData: string[] | Record<string, string>) => {
    let tags: string[] = [];
    
    if (Array.isArray(tagsData)) {
      tags = tagsData;
    } else if (tagsData && typeof tagsData === 'object') {
      tags = Object.keys(tagsData);
    }
    
    if (!tags.length) return null;
    
    return (
      <div key={categoryName} className="space-y-2">
        <h4 className="font-medium text-sm text-muted-foreground capitalize">
          {safeReplaceUnderscore(categoryName)}
        </h4>
        <div className="flex flex-wrap gap-2">
          {tags.map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => onTagToggle(tag)}
              className={`px-3 py-2 text-xs rounded-lg border transition-colors text-left min-w-[120px] ${
                selectedTags.includes(tag)
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background hover:bg-muted border-border'
              }`}
            >
              <div className="flex flex-col space-y-0.5">
                <span className="font-medium leading-tight">
                  {formatTagName(tag)}
                </span>
                {typeof tagsData === 'object' && !Array.isArray(tagsData) && tagsData[tag] && (
                  <span className="text-xs opacity-75 leading-tight">
                    {tagsData[tag]}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Document Tags</label>
        <p className="text-xs text-muted-foreground mt-1">
          Select relevant tags to categorize this document for better discovery and organization
        </p>
      </div>

      {selectedTags.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Selected Tags:</h4>
          <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded border">
            {selectedTags.map(tag => (
              <span
                key={tag}
                className="flex items-center space-x-1 px-3 py-1 text-xs rounded-full bg-primary text-primary-foreground"
              >
                <span>{formatTagName(tag)}</span>
                <button
                  type="button"
                  onClick={() => onTagToggle(tag)}
                  className="hover:bg-primary/80 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {Object.entries(tagConstants.tag_categories).map(([category, tagsData]) =>
          renderTagSection(category, tagsData)
        )}
      </div>
    </div>
  )
}