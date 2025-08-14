import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sparkles, Eye, EyeOff, FileEdit, User } from 'lucide-react'
import type { ExtractedDocumentInfo } from '../../types'

interface MetadataExtractorCardProps {
  selectedFile: File | null
  extractedMetadata: ExtractedDocumentInfo | null
  isExtractingMetadata: boolean
  documentTitle: string
  documentAuthor: string
  titleOverride: boolean
  authorOverride: boolean
  showMetadataDetails: boolean
  isLoading: boolean
  onTitleChange: (value: string) => void
  onAuthorChange: (value: string) => void
  onResetToExtractedTitle: () => void
  onResetToExtractedAuthor: () => void
  onToggleMetadataDetails: () => void
}

export default function MetadataExtractorCard({
  selectedFile,
  extractedMetadata,
  isExtractingMetadata,
  documentTitle,
  documentAuthor,
  titleOverride,
  authorOverride,
  showMetadataDetails,
  isLoading,
  onTitleChange,
  onAuthorChange,
  onResetToExtractedTitle,
  onResetToExtractedAuthor,
  onToggleMetadataDetails
}: MetadataExtractorCardProps) {
  if (!selectedFile) return null

  return (
    <Card className="bg-muted/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-4 w-4 text-purple-600" />
            <CardTitle className="text-lg">Document Metadata</CardTitle>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onToggleMetadataDetails}
          >
            {showMetadataDetails ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
        {showMetadataDetails && (
          <CardDescription>
            {isExtractingMetadata ? (
              <span className="flex items-center space-x-2">
                <div className="animate-spin h-3 w-3 border-2 border-purple-600 border-t-transparent rounded-full"></div>
                <span>Extracting metadata from PDF...</span>
              </span>
            ) : extractedMetadata ? (
              extractedMetadata.hasMetadata ? (
                <span className="text-green-600">✓ Metadata extracted successfully from PDF</span>
              ) : (
                <span className="text-amber-600">⚠ No metadata found in PDF, using filename as title</span>
              )
            ) : null}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="document-title" className="text-sm font-medium flex items-center space-x-2">
              <FileEdit className="h-4 w-4" />
              <span>Document Title *</span>
            </label>
            {extractedMetadata?.title && titleOverride && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onResetToExtractedTitle}
                className="text-xs"
              >
                Reset to extracted
              </Button>
            )}
          </div>
          <Input
            id="document-title"
            type="text"
            placeholder="Enter document title"
            value={documentTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            disabled={isLoading}
            required
            className={titleOverride ? "border-amber-300 bg-amber-50" : ""}
          />
          {extractedMetadata?.title && (
            <p className="text-xs text-muted-foreground">
              {titleOverride ? (
                <span className="text-amber-600">Modified from extracted: "{extractedMetadata.title}"</span>
              ) : (
                <span className="text-green-600">Extracted from PDF metadata</span>
              )}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="document-author" className="text-sm font-medium flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Document Author</span>
            </label>
            {extractedMetadata?.author && authorOverride && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onResetToExtractedAuthor}
                className="text-xs"
              >
                Reset to extracted
              </Button>
            )}
          </div>
          <Input
            id="document-author"
            type="text"
            placeholder="Enter document author (optional)"
            value={documentAuthor}
            onChange={(e) => onAuthorChange(e.target.value)}
            disabled={isLoading}
            className={authorOverride ? "border-amber-300 bg-amber-50" : ""}
          />
          {extractedMetadata?.author && (
            <p className="text-xs text-muted-foreground">
              {authorOverride ? (
                <span className="text-amber-600">Modified from extracted: "{extractedMetadata.author}"</span>
              ) : (
                <span className="text-green-600">Extracted from PDF metadata</span>
              )}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}