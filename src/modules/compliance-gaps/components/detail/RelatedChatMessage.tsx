/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, ChevronRight, MessageSquare } from 'lucide-react'
import { formatMessageContent, renderSourceDocuments } from '@/lib/gap-detail'

interface RelatedChatMessageProps {
  originalQuestion?: string | null
  relatedChatMessage: {
    message: string
    sources?: any
    metadata?: any
  }
}

export default function RelatedChatMessage({ originalQuestion, relatedChatMessage }: RelatedChatMessageProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageSquare className="h-5 w-5" />
          <span>Related Chat Message</span>
        </CardTitle>
        <CardDescription>Original conversation that led to this compliance gap identification</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          {originalQuestion && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-gray-600 text-white flex items-center justify-center text-sm font-medium">Q</div>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm text-gray-700 mb-2">Question</h4>
                  <p className="text-sm text-gray-800 leading-relaxed">{originalQuestion}</p>
                </div>
              </div>
            </div>
          )}

          <div className="p-4 bg-gray-100 border border-gray-300 rounded-md">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-gray-700 text-white flex items-center justify-center text-sm font-medium">A</div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm text-gray-700">Answer</h4>
                </div>
                <div className="text-sm text-gray-800 leading-relaxed">{formatMessageContent(relatedChatMessage.message)}</div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground flex items-center space-x-2">
              <BookOpen className="h-4 w-4" />
              <span>Source Documents</span>
            </h4>
            {renderSourceDocuments(relatedChatMessage.sources)}
          </div>

          {relatedChatMessage.metadata && (
            <div className="pt-3 border-t">
              <details className="group">
                <summary className="flex items-center space-x-2 cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                  <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
                  <span>Message Metadata</span>
                </summary>
                <div className="mt-2 p-3 bg-muted/50 rounded text-xs font-mono">
                  <pre className="whitespace-pre-wrap">{JSON.stringify(relatedChatMessage.metadata, null, 2)}</pre>
                </div>
              </details>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

