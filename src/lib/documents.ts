// Shared constants and utilities for document management
import { safeReplaceUnderscore } from './utils'

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const formatDateDetailed = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  })
}

export const formatFileSize = (bytes?: number) => {
  if (!bytes) return 'Unknown size'
  const mb = bytes / (1024 * 1024)
  return `${mb.toFixed(2)} MB`
}

export const PROCESSING_STATUSES = {
  COMPLETED: 'completed',
  PROCESSING: 'processing',
  FAILED: 'failed'
} as const

export const DOMAIN_COLORS = {
  'ISO27001': 'bg-green-100 text-green-700 border-green-200',
  'GDPR': 'bg-blue-100 text-blue-700 border-blue-200',
  'SOX': 'bg-purple-100 text-purple-700 border-purple-200',
  'HIPAA': 'bg-indigo-100 text-indigo-700 border-indigo-200',
  'PCI_DSS': 'bg-orange-100 text-orange-700 border-orange-200',
  'DEFAULT': 'bg-gray-100 text-gray-700 border-gray-200'
} as const

export const PROCESSING_STATUS_STYLES = {
  [PROCESSING_STATUSES.COMPLETED]: 'bg-green-100 text-green-700 border-green-200',
  [PROCESSING_STATUSES.PROCESSING]: 'bg-blue-100 text-blue-700 border-blue-200',
  [PROCESSING_STATUSES.FAILED]: 'bg-red-100 text-red-700 border-red-200',
  'default': 'bg-gray-100 text-gray-700 border-gray-200'
} as const

export const getDomainColor = (domain?: string) => {
  return DOMAIN_COLORS[domain as keyof typeof DOMAIN_COLORS] || DOMAIN_COLORS.DEFAULT
}

export const getProcessingStatusColor = (status?: string) => {
  return PROCESSING_STATUS_STYLES[status as keyof typeof PROCESSING_STATUS_STYLES] || PROCESSING_STATUS_STYLES.default
}

export const generateDocumentVersion = () => {
  const date = new Date()
  const year = date.getFullYear()
  const quarter = Math.ceil((date.getMonth() + 1) / 3)
  return `${year}-Q${quarter}`
}

export const cleanTagName = (tag: string) => {
  return safeReplaceUnderscore(tag)
}

export const formatTagName = (tag: string) => {
  return safeReplaceUnderscore(tag)
}