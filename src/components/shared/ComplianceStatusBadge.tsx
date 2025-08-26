import { getStatusColor } from '@/lib/compliance'
import { safeReplaceUnderscore } from '@/lib/utils'

interface ComplianceStatusBadgeProps {
  status: string
  className?: string
}

export default function ComplianceStatusBadge({ 
  status, 
  className = '' 
}: ComplianceStatusBadgeProps) {
  const statusColor = getStatusColor(status)

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded border ${statusColor} flex items-center space-x-1 ${className}`}>
      <span>{safeReplaceUnderscore(status).toUpperCase()}</span>
    </span>
  )
}