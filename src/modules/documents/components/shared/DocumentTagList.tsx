import { Tag, X } from 'lucide-react'
import { formatTagName } from '@/lib/documents'

interface DocumentTagListProps {
  tags: string[]
  maxVisible?: number
  onTagRemove?: (tag: string) => void
  removable?: boolean
  className?: string
  tagClassName?: string
}

export default function DocumentTagList({
  tags,
  maxVisible = 5,
  onTagRemove,
  removable = false,
  className = '',
  tagClassName = ''
}: DocumentTagListProps) {
  if (!tags || tags.length === 0) return null

  const visibleTags = tags.slice(0, maxVisible)
  const remainingCount = tags.length - maxVisible

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Tag className="h-4 w-4 text-muted-foreground" />
      <div className="flex flex-wrap gap-1">
        {visibleTags.map((tag, index) => (
          <span
            key={index}
            className={`px-2 py-1 text-xs bg-muted text-muted-foreground rounded border flex items-center space-x-1 ${tagClassName}`}
          >
            <span>{formatTagName(tag)}</span>
            {removable && onTagRemove && (
              <button
                type="button"
                onClick={() => onTagRemove(tag)}
                className="hover:bg-muted-foreground/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </span>
        ))}
        {remainingCount > 0 && (
          <span className="text-xs text-muted-foreground">
            +{remainingCount} more
          </span>
        )}
      </div>
    </div>
  )
}