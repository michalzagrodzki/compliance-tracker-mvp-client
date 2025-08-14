/* eslint-disable @typescript-eslint/no-explicit-any */
import { AlertCircle, AlertTriangle, CheckCircle, Eye, Shield, X, ExternalLink, FileIcon, FileSearch } from 'lucide-react'
import type { JSX } from 'react'
import type { SourceDocument } from '@/modules/chat/types'

export const getStatusIcon = (status: string) => {
  switch (status) {
    case 'identified': return <AlertTriangle className="h-4 w-4" />
    case 'acknowledged': return <Eye className="h-4 w-4" />
    case 'in_progress': return <CheckCircle className="h-4 w-4" />
    case 'resolved': return <CheckCircle className="h-4 w-4" />
    case 'false_positive': return <X className="h-4 w-4" />
    case 'accepted_risk': return <Shield className="h-4 w-4" />
    default: return <AlertCircle className="h-4 w-4" />
  }
}

export const formatSimilarity = (similarity: string | number) => {
  let numericSimilarity: number
  if (typeof similarity === 'string') {
    const cleanedString = similarity.replace(',', '.')
    numericSimilarity = parseFloat(cleanedString)
  } else {
    numericSimilarity = similarity
  }
  if (isNaN(numericSimilarity)) return 'N/A'
  if (numericSimilarity > 1) return `${Math.round(numericSimilarity)}%`
  return `${Math.round(numericSimilarity * 100)}%`
}

export const formatBasicContent = (text: string) => {
  const parts = text.split(/(\*\*[^*]+\*\*)/)
  return (
    <div className="leading-relaxed">
      {parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <span key={index} className="font-semibold text-gray-900">
              {part.slice(2, -2)}
            </span>
          )
        }
        return <span key={index}>{part}</span>
      })}
    </div>
  )
}

export const formatNumberedSection = (text: string) => {
  const match = text.match(/^(\d+)\.\s\*\*([^*]+)\*\*:\s*(.+)$/s)
  if (match) {
    const [, number, title, content] = match
    return (
      <div>
        <div className="flex items-start space-x-2 mb-2">
          <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white text-xs font-medium rounded-full flex items-center justify-center">
            {number}
          </span>
          <h4 className="font-semibold text-gray-900 text-sm leading-tight">{title}</h4>
        </div>
        <div className="ml-8 text-sm text-gray-700 leading-relaxed">{formatBasicContent(content.trim())}</div>
      </div>
    )
  }
  return formatBasicContent(text)
}

export const formatMessageContent = (text: string) => {
  const numberedSections = text.split(/(?=\d+\.\s\*\*)/)
  if (numberedSections.length <= 1) return formatBasicContent(text)
  return (
    <div className="space-y-4">
      {numberedSections.map((section, index) => {
        if (index === 0 && !section.match(/^\d+\.\s/)) {
          return (
            <div key={index} className="mb-4">
              {formatBasicContent(section.trim())}
            </div>
          )
        }
        return (
          <div key={index} className="border-l-4 border-blue-200 pl-4 py-2 bg-blue-50/30 rounded-r">
            {formatNumberedSection(section.trim())}
          </div>
        )
      })}
    </div>
  )
}

export const formatImplementationStep = (lines: string[], startIndex: number) => {
  const line = lines[startIndex].trim()
  const match = line.match(/^(\d+)\.\s\*\*([^*]+)\*\*:?\s*(.*)$/)
  if (!match) {
    return { element: <div key={startIndex}>{formatInlineContent(line)}</div>, nextIndex: startIndex + 1 }
  }
  const [, number, title, description] = match
  let nextIndex = startIndex + 1
  const subItems: string[] = []
  while (nextIndex < lines.length) {
    const nextLine = lines[nextIndex].trim()
    if (nextLine.startsWith('- *Timeline:*') || nextLine.startsWith('- ') || nextLine.startsWith('  -')) {
      subItems.push(nextLine)
      nextIndex++
    } else if (nextLine.length === 0) {
      nextIndex++
      break
    } else if (!nextLine.startsWith(' ') && !nextLine.startsWith('-')) {
      break
    } else {
      subItems.push(nextLine)
      nextIndex++
    }
  }

  const element = (
    <div key={startIndex} className="border-l-4 border-blue-200 pl-4 py-3 bg-blue-50/30 rounded-r mb-4">
      <div className="flex items-start space-x-2 mb-2">
        <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white text-xs font-medium rounded-full flex items-center justify-center">{number}</span>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 text-sm leading-tight mb-1">{title}</h4>
          {description && <p className="text-sm text-gray-700 leading-relaxed mb-2">{formatInlineContent(description)}</p>}
        </div>
      </div>
      {subItems.length > 0 && (
        <div className="ml-8 space-y-1">
          {subItems.map((item, idx) => (
            <div key={idx} className="text-sm text-gray-700">{formatInlineContent(item)}</div>
          ))}
        </div>
      )}
    </div>
  )

  return { element, nextIndex }
}

export const formatBulletPoints = (lines: string[], startIndex: number) => {
  const bullets: string[] = []
  let nextIndex = startIndex
  while (nextIndex < lines.length) {
    const line = lines[nextIndex].trim()
    if (line.startsWith('- ') || line.startsWith('  -')) {
      bullets.push(line.replace(/^\s*-\s*/, ''))
      nextIndex++
    } else if (line.length === 0) {
      nextIndex++
      break
    } else {
      break
    }
  }
  const element = (
    <ul key={startIndex} className="list-disc list-inside space-y-1 text-sm text-gray-700">
      {bullets.map((item, idx) => (
        <li key={idx}>{formatInlineContent(item)}</li>
      ))}
    </ul>
  )
  return { element, nextIndex }
}

export const formatInlineContent = (text: string) => {
  const parts = text.split(/(\*\*[^*]+\*\*)/)
  return (
    <>
      {parts.map((part, idx) =>
        part.startsWith('**') && part.endsWith('**') ? (
          <span key={idx} className="font-semibold text-gray-900">{part.slice(2, -2)}</span>
        ) : (
          <span key={idx}>{part}</span>
        )
      )}
    </>
  )
}

export const formatRecommendationContent = (text: string) => {
  const lines = text.split('\n').filter((line) => line.trim() !== '')
  const elements: JSX.Element[] = []
  let currentIndex = 0
  while (currentIndex < lines.length) {
    const line = lines[currentIndex].trim()
    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={currentIndex} className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">{line.substring(2)}</h1>
      )
    } else if (line.startsWith('## ')) {
      elements.push(
        <h2 key={currentIndex} className="text-lg font-semibold text-gray-800 mb-3 mt-6">{line.substring(3)}</h2>
      )
    } else if (line.match(/^\d+\.\s\*\*/)) {
      const { element, nextIndex } = formatImplementationStep(lines, currentIndex)
      elements.push(element)
      currentIndex = nextIndex - 1
    } else if (line.startsWith('- ')) {
      const { element, nextIndex } = formatBulletPoints(lines, currentIndex)
      elements.push(element)
      currentIndex = nextIndex - 1
    } else if (line.length > 0) {
      elements.push(
        <p key={currentIndex} className="text-sm text-gray-700 leading-relaxed mb-3">{formatInlineContent(line)}</p>
      )
    }
    currentIndex++
  }
  return <div className="space-y-2">{elements}</div>
}

export const renderSourceDocuments = (sources: string[] | SourceDocument[] | undefined) => {
  if (!sources || sources.length === 0) {
    return (
      <div className="text-center py-4">
        <FileSearch className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">No source documents</p>
      </div>
    )
  }
  const isSourceDocuments = sources.length > 0 && typeof sources[0] === 'object' && 'title' in (sources[0] as any)
  if (isSourceDocuments) {
    const sourceDocuments = sources as SourceDocument[]
    const aggregatedDocs = sourceDocuments.reduce((acc, doc) => {
      const key = `${doc.title}|${doc.author}|${doc.source_filename || ''}`
      if (!acc[key]) {
        acc[key] = { title: doc.title, author: doc.author, source_filename: doc.source_filename, pages: [] as Array<{ page_number: number; similarity: string }> }
      }
      acc[key].pages.push({ page_number: doc.source_page_number, similarity: doc.similarity })
      return acc
    }, {} as Record<string, { title: string; author: string; source_filename?: string; pages: Array<{ page_number: number; similarity: string }> }>)
    Object.values(aggregatedDocs).forEach((doc) => {
      doc.pages.sort((a, b) => {
        const simA = typeof a.similarity === 'string' ? parseFloat(a.similarity.replace(',', '.')) : (a.similarity as any)
        const simB = typeof b.similarity === 'string' ? parseFloat(b.similarity.replace(',', '.')) : (b.similarity as any)
        return simB - simA
      })
    })
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
                <p className="text-xs text-muted-foreground"><span className="font-medium">Author:</span> {doc.author}</p>
                {doc.source_filename && (
                  <p className="text-xs text-muted-foreground"><span className="font-medium">File:</span> {doc.source_filename}</p>
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
    )
  }
  const stringSources = sources as string[]
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
  )
}

