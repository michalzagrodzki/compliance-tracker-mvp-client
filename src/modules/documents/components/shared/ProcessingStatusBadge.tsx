import { CheckCircle, Clock, XCircle, FileText } from 'lucide-react'
import { getProcessingStatusColor, PROCESSING_STATUSES } from '@/lib/documents'

interface ProcessingStatusBadgeProps {
  status?: string
  showIcon?: boolean
  className?: string
}

export const getProcessingStatusIcon = (status?: string) => {
  switch (status) {
    case PROCESSING_STATUSES.COMPLETED:
      return CheckCircle
    case PROCESSING_STATUSES.PROCESSING:
      return Clock
    case PROCESSING_STATUSES.FAILED:
      return XCircle
    default:
      return FileText
  }
}

export const getProcessingStatusInfo = (status?: string) => {
  switch (status) {
    case PROCESSING_STATUSES.COMPLETED:
      return {
        icon: CheckCircle,
        text: 'Completed',
        className: 'text-green-600 bg-green-50 border-green-200'
      }
    case PROCESSING_STATUSES.PROCESSING:
      return {
        icon: Clock,
        text: 'Processing',
        className: 'text-blue-600 bg-blue-50 border-blue-200'
      }
    case PROCESSING_STATUSES.FAILED:
      return {
        icon: XCircle,
        text: 'Failed',
        className: 'text-red-600 bg-red-50 border-red-200'
      }
    default:
      return {
        icon: FileText,
        text: 'Unknown',
        className: 'text-gray-600 bg-gray-50 border-gray-200'
      }
  }
}

export default function ProcessingStatusBadge({ 
  status, 
  showIcon = true, 
  className = '' 
}: ProcessingStatusBadgeProps) {
  const statusColor = getProcessingStatusColor(status)
  const StatusIcon = getProcessingStatusIcon(status)

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded border ${statusColor} flex items-center space-x-1 ${className}`}>
      {showIcon && <StatusIcon className="h-3 w-3" />}
      <span>{status || 'unknown'}</span>
    </span>
  )
}